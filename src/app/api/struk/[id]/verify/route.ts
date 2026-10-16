// ============================================================
// POST /api/struk/[id]/verify
// ------------------------------------------------------------
// Body: { action: "approve" | "reject", alasan?: string }
//
// Approve:
//   - Struk.statusStruk = APPROVED, verifiedAt = now
//   - Anggota.status = LUNAS
//   - Create Transaksi(MASUK, nominal=settings.nominalIuran, strukId, anggotaId, periodeBulan)
//
// Reject:
//   - Struk.statusStruk = REJECTED, ditolakAlasan, verifiedAt = now
//   - Anggota.status kembali ke kondisi sebelumnya (BELUM_LUNAS — TERTUNGGAK derived)
//   - Reject mengembalikan tautan WhatsApp manual (wa.me), tanpa pengiriman otomatis.
//
// Hanya admin.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { getPeriodeBulan } from "@/lib/status";
import { buildStrukDitolakMessage, buildWhatsAppManualUrl } from "@/lib/whatsapp";
import { auditLog } from "@/lib/audit";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = await req.json();
    const { action, alasan } = body as { action?: string; alasan?: string };

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        { error: "Action harus 'approve' atau 'reject'." },
        { status: 400 }
      );
    }

    const struk = await db.struk.findUnique({
      where: { id },
      include: { anggota: true },
    });
    if (!struk) {
      return NextResponse.json({ error: "Struk tidak ditemukan." }, { status: 404 });
    }
    if (struk.statusStruk !== "PENDING") {
      return NextResponse.json(
        { error: `Struk sudah ${struk.statusStruk}, tidak bisa diverifikasi ulang.` },
        { status: 400 }
      );
    }

    const settings = await getSettings();
    const now = new Date();

    if (action === "approve") {
      const approvedForPeriod = await db.struk.findFirst({
        where: {
          id: { not: struk.id },
          anggotaId: struk.anggotaId,
          periodeBulan: struk.periodeBulan,
          statusStruk: "APPROVED",
        },
        select: { id: true },
      });
      if (approvedForPeriod) {
        return NextResponse.json(
          { error: "Anggota sudah memiliki struk approved untuk periode ini." },
          { status: 409 }
        );
      }
      const nominal = struk.nominal ?? settings.nominalIuran;
      await db.$transaction(async (tx) => {
        await tx.struk.update({
          where: { id },
          data: { statusStruk: "APPROVED", verifiedAt: now, nominal },
        });
        if (struk.periodeBulan === getPeriodeBulan()) {
          await tx.anggota.update({
            where: { id: struk.anggotaId },
            data: { status: "LUNAS" },
          });
        }
        await tx.transaksi.create({
          data: {
            tipe: "MASUK",
            nominal,
            keterangan: `Iuran ${struk.periodeBulan} — ${struk.anggota.namaLengkap} (${struk.anggota.gender})`,
            strukId: struk.id,
            anggotaId: struk.anggotaId,
            periodeBulan: struk.periodeBulan,
          },
        });
      });

      await auditLog("APPROVE_STRUK", {
        targetId: id,
        targetLabel: struk.anggota.namaLengkap,
        detail: `Nominal: Rp ${nominal.toLocaleString("id-ID")}`,
      });

      return NextResponse.json({
        ok: true,
        action: "approve",
        nominal,
      });
    }

    // Reject
    const alasanText = (alasan ?? "").trim();
    if (!alasanText) {
      return NextResponse.json(
        { error: "Alasan penolakan wajib diisi." },
        { status: 400 }
      );
    }

    const approvedForPeriod = await db.struk.findFirst({
      where: {
        id: { not: struk.id },
        anggotaId: struk.anggotaId,
        periodeBulan: struk.periodeBulan,
        statusStruk: "APPROVED",
      },
      select: { id: true },
    });

    await db.$transaction([
      db.struk.update({
        where: { id },
        data: {
          statusStruk: "REJECTED",
          ditolakAlasan: alasanText,
          verifiedAt: now,
        },
      }),
      // Pertahankan LUNAS jika ada pembayaran approved lain pada periode ini.
      ...(struk.periodeBulan === getPeriodeBulan()
        ? [db.anggota.update({
            where: { id: struk.anggotaId },
            data: {
              status: struk.anggota.status === "LUNAS" || approvedForPeriod ? "LUNAS" : "BELUM_LUNAS",
            },
          })]
        : []),
    ]);

    await auditLog("REJECT_STRUK", {
      targetId: id,
      targetLabel: struk.anggota.namaLengkap,
      detail: alasanText,
    });

    const whatsappUrl = buildWhatsAppManualUrl(
      struk.anggota.noHpWa,
      buildStrukDitolakMessage(struk.anggota.namaLengkap, alasanText)
    );

    return NextResponse.json({ ok: true, action: "reject", whatsappUrl });
  } catch (e) {
    console.error("[struk verify] error", e);
    return NextResponse.json(
      { error: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
