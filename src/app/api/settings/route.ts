// ============================================================
// /api/settings — GET, PATCH
// ------------------------------------------------------------
// Singleton Settings (id="singleton"). Auto-create default.
// Hanya admin (proxy.ts guard) yang boleh PATCH.
// GET public untuk anggota (perlu info barcode, kontak, dll).
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSettings, getSettingsForDisplay } from "@/lib/settings";
import { createStorageSignedUrl } from "@/lib/storage";
import { isAdmin } from "@/lib/auth";
import { auditLog } from "@/lib/audit";

export async function GET() {
  const s = await getSettingsForDisplay();
  return NextResponse.json(s);
}

export async function PATCH(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};

    // Whitelist field yang boleh di-update
    if (typeof body.nominalIuran === "number" && body.nominalIuran > 0) {
      data.nominalIuran = Math.floor(body.nominalIuran);
    }
    if (
      typeof body.deadlineTanggal === "number" &&
      body.deadlineTanggal >= 1 &&
      body.deadlineTanggal <= 28
    ) {
      data.deadlineTanggal = Math.floor(body.deadlineTanggal);
    }
    if (typeof body.namaBank === "string") data.namaBank = body.namaBank || null;
    if (typeof body.nomorRekening === "string") data.nomorRekening = body.nomorRekening || null;
    if (typeof body.barcodeImageUrl === "string") data.barcodeImageUrl = body.barcodeImageUrl || null;
    if (typeof body.kontakBendahara === "string") data.kontakBendahara = body.kontakBendahara || null;
    if (typeof body.kontakSekretaris === "string") data.kontakSekretaris = body.kontakSekretaris || null;
    if (typeof body.kontakKompting === "string") data.kontakKompting = body.kontakKompting || null;

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "Tidak ada field valid untuk diupdate." },
        { status: 400 }
      );
    }

    const updated = await db.settings.upsert({
      where: { id: "singleton" },
      update: data,
      create: { id: "singleton", ...data },
    });
    await auditLog("UPDATE_SETTINGS", {
      targetLabel: "singleton",
      detail: Object.keys(data).join(", "),
    });
    return NextResponse.json({ ...updated, barcodeImageUrl: await createStorageSignedUrl(updated.barcodeImageUrl ?? "") });
  } catch (e) {
    console.error("[settings PATCH] error", e);
    return NextResponse.json(
      { error: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
