// ============================================================
// POST /api/laporan/reset-siklus
// ------------------------------------------------------------
// Reset siklus bulanan:
// 1. Hapus seluruh object struk di Supabase Storage untuk periode berjalan.
// 2. Update seluruh Anggota.status → BELUM_LUNAS
// 3. TIDAK menghapus record Struk maupun Transaksi dari database
//    (gambar fisik hilang, imageUrl jadi stale link — diterima untuk bebaskan storage)
// 4. Transaksi TETAP utuh selamanya (basis grafik kas historis)
// ============================================================

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { getPeriodeBulan } from "@/lib/status";
import { auditLog } from "@/lib/audit";
import { listStorageObjects, removeStorageObjects } from "@/lib/storage";

export async function POST() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const periode = getPeriodeBulan();
    let storageCleared = false;
    try {
      const files = await listStorageObjects(`struk/${periode}`);
      const paths = files.filter((f) => f.name).map((f) => `struk/${periode}/${f.name}`);
      await removeStorageObjects(paths);
      storageCleared = paths.length > 0;
    } catch (e) {
      console.warn("[reset-siklus] gagal hapus storage:", e);
    }

    // 2. Reset semua Anggota.status → BELUM_LUNAS
    const result = await db.anggota.updateMany({
      where: { status: "LUNAS" },
      data: { status: "BELUM_LUNAS" },
    });

    // 3. Catat transaksi (TIDAK dihapus — hanya statistik untuk response)
    const transaksiCount = await db.transaksi.count({
      where: { periodeBulan: periode },
    });

    // Audit log
    await auditLog("RESET_SIKLUS", {
      targetLabel: `Periode ${periode}`,
      detail: `${result.count} anggota reset, ${transaksiCount} transaksi tetap, storage ${storageCleared ? "dihapus" : "tidak ada"}`,
    });

    return NextResponse.json({
      ok: true,
      periode,
      storageCleared,
      anggotaReset: result.count,
      transaksiTetap: transaksiCount,
      message: `Siklus ${periode} direset. ${result.count} anggota kembali ke BELUM_LUNAS. ${transaksiCount} transaksi tetap dipertahankan untuk grafik historis.`,
    });
  } catch (e) {
    console.error("[reset-siklus] error", e);
    return NextResponse.json(
      { error: "Gagal reset siklus: " + (e instanceof Error ? e.message : "") },
      { status: 500 }
    );
  }
}
