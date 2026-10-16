import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { auditLog } from "@/lib/audit";
import { getPeriodeBulan } from "@/lib/status";
import { createStorageSignedUrl, removeStorageObjects, uploadStorageObject } from "@/lib/storage";
import { generateStrukImage } from "@/lib/struk-generator";

function parseNominal(value: unknown): number | null {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) return null;
  const amount = Number(value);
  return Number.isSafeInteger(amount) && amount > 0 ? amount : null;
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let storagePath = "";
  try {
    const body = await req.json() as {
      anggotaId?: unknown;
      nominal?: unknown;
      catatan?: unknown;
    };
    const anggotaId = typeof body.anggotaId === "string" ? body.anggotaId.trim() : "";
    const nominal = parseNominal(body.nominal);
    const catatan = typeof body.catatan === "string" ? body.catatan.trim() : "";

    if (!anggotaId) {
      return NextResponse.json({ code: "MEMBER_REQUIRED", error: "Anggota wajib dipilih." }, { status: 400 });
    }
    if (nominal === null) {
      return NextResponse.json({ code: "INVALID_AMOUNT", error: "Nominal harus berupa angka penuh yang lebih besar dari nol." }, { status: 400 });
    }
    if (catatan.length > 240) {
      return NextResponse.json({ code: "NOTE_TOO_LONG", error: "Catatan maksimal 240 karakter." }, { status: 400 });
    }

    const periode = getPeriodeBulan();
    const anggota = await db.anggota.findUnique({
      where: { id: anggotaId },
      select: { id: true, namaLengkap: true, gender: true },
    });
    if (!anggota) {
      return NextResponse.json({ code: "MEMBER_NOT_FOUND", error: "Anggota tidak ditemukan." }, { status: 404 });
    }

    const active = await db.struk.findFirst({
      where: { anggotaId, periodeBulan: periode, statusStruk: { in: ["PENDING", "APPROVED"] } },
      select: { statusStruk: true },
    });
    if (active) {
      return NextResponse.json({ code: "ACTIVE_RECEIPT_EXISTS", error: "Anggota ini sudah memiliki pembayaran aktif." }, { status: 409 });
    }

    const now = new Date();
    const receiptNumber = `MAN-${now.getTime()}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    const image = await generateStrukImage({
      receiptNumber,
      memberName: anggota.namaLengkap,
      gender: anggota.gender,
      amount: nominal,
      date: now,
      note: catatan,
    });
    storagePath = `struk/${periode}/manual-${crypto.randomUUID()}.png`;
    await uploadStorageObject(storagePath, image, "image/png");

    const created = await db.$transaction(async (tx) => {
      const activeInsideTransaction = await tx.struk.findFirst({
        where: { anggotaId, periodeBulan: periode, statusStruk: { in: ["PENDING", "APPROVED"] } },
        select: { id: true },
      });
      if (activeInsideTransaction) {
        throw new Error("ACTIVE_RECEIPT_EXISTS");
      }

      const struk = await tx.struk.create({
        data: {
          anggotaId,
          imageUrl: storagePath,
          statusStruk: "APPROVED",
          nominal,
          catatan: catatan || null,
          dibuatOleh: "ADMIN",
          periodeBulan: periode,
          verifiedAt: now,
        },
      });

      await tx.anggota.update({
        where: { id: anggotaId },
        data: { status: "LUNAS" },
      });

      await tx.transaksi.create({
        data: {
          tipe: "MASUK",
          nominal,
          keterangan: `Struk manual ${periode} - ${anggota.namaLengkap}${catatan ? ` - ${catatan}` : ""}`,
          strukId: struk.id,
          anggotaId,
          periodeBulan: periode,
        },
      });

      return struk;
    }, { isolationLevel: "Serializable" });

    await auditLog("GENERATE_STRUK_MANUAL", {
      targetId: created.id,
      targetLabel: anggota.namaLengkap,
      detail: `Nominal: Rp ${nominal.toLocaleString("id-ID")} (${periode})`,
    });

    return NextResponse.json({
      ok: true,
      data: {
        receiptId: created.id,
        status: created.statusStruk,
        amount: nominal,
        imageUrl: await createStorageSignedUrl(created.imageUrl),
      },
    });
  } catch (error) {
    if (storagePath) await removeStorageObjects([storagePath]).catch(() => undefined);
    if (error instanceof Error && error.message === "ACTIVE_RECEIPT_EXISTS") {
      return NextResponse.json({ code: "ACTIVE_RECEIPT_EXISTS", error: "Anggota ini sudah memiliki pembayaran aktif." }, { status: 409 });
    }
    console.error("[struk-generator] error", error);
    return NextResponse.json({ error: "Gagal membuat struk manual." }, { status: 500 });
  }
}
