// ============================================================
// /api/anggota — GET (list), POST (create manual oleh admin)
// ------------------------------------------------------------
// GET: untuk halaman beranda & daftar (anggota bisa lihat semua).
//      Password TIDAK di-return. Status computed on-the-fly.
// POST: hanya admin (tambah anggota manual).
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { computeStatusTampil } from "@/lib/status";
import { isValidGender, isValidStatusIuranStored } from "@/lib/constants";
import { encryptPassword } from "@/lib/crypto";
import { isValidIndoPhone, normalizePhone, getPeriodeBulan } from "@/lib/status";
import { getAnggotaSession } from "@/lib/session";
import { getRecentReceiptPeriods } from "@/lib/receipt-policy";

export async function GET() {
  if (!(await getAnggotaSession()) && !(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [anggota, settings, activeStruk] = await Promise.all([
    db.anggota.findMany({
      orderBy: [{ gender: "asc" }, { namaLengkap: "asc" }],
      select: {
        id: true,
        gender: true,
        namaLengkap: true,
        noHpWa: true,
        status: true,
        createdAt: true,
      },
    }),
    getSettings(),
    db.struk.findMany({
      where: { periodeBulan: { in: getRecentReceiptPeriods() }, statusStruk: { in: ["PENDING", "APPROVED"] } },
      select: { anggotaId: true, statusStruk: true, periodeBulan: true },
    }),
  ]);

  const activeByAnggota = new Map<string, string>();
  for (const receipt of activeStruk) {
    if (receipt.periodeBulan === getPeriodeBulan()) {
      activeByAnggota.set(receipt.anggotaId, receipt.statusStruk);
    }
  }

  const now = new Date();
  const list = anggota.map((a) => ({
    ...a,
    statusTampil: computeStatusTampil(a.status, settings.deadlineTanggal, now),
    receiptAktif: activeByAnggota.get(a.id) ?? null,
  }));

  return NextResponse.json({ anggota: list, settings });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { gender, namaLengkap, noHpWa, password, status } = body as {
      gender?: string;
      namaLengkap?: string;
      noHpWa?: string;
      password?: string;
      status?: string;
    };

    if (!gender || !isValidGender(gender)) {
      return NextResponse.json({ error: "Gender tidak valid." }, { status: 400 });
    }
    const nama = (namaLengkap ?? "").trim();
    if (nama.length < 2) {
      return NextResponse.json({ error: "Nama minimal 2 karakter." }, { status: 400 });
    }
    if (!noHpWa || !isValidIndoPhone(noHpWa)) {
      return NextResponse.json({ error: "Nomor HP/WA tidak valid." }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password minimal 6 karakter." }, { status: 400 });
    }
    const statusVal = status ?? "BELUM_LUNAS";
    if (!isValidStatusIuranStored(statusVal)) {
      return NextResponse.json({ error: "Status tidak valid." }, { status: 400 });
    }

    const exist = await db.anggota.findUnique({
      where: { namaLengkap_gender: { namaLengkap: nama, gender } },
    });
    if (exist) {
      return NextResponse.json(
        { error: "Nama+gender sudah terdaftar." },
        { status: 409 }
      );
    }

    const created = await db.anggota.create({
      data: {
        gender,
        namaLengkap: nama,
        noHpWa: normalizePhone(noHpWa),
        passwordEnc: encryptPassword(password),
        status: statusVal,
      },
      select: { id: true, namaLengkap: true, gender: true },
    });
    return NextResponse.json({ ok: true, anggota: created });
  } catch (e) {
    console.error("[anggota POST] error", e);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
