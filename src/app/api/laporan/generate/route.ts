// ============================================================
// POST /api/laporan/generate
// ------------------------------------------------------------
// Generate .zip berisi:
// 1. Folder "struk/" — seluruh gambar struk APPROVED bulan berjalan
//    (dinamai {namaLengkap}.jpg)
// 2. rekap.xlsx — Excel berisi data anggota: nama, gender, status, nominal
//
// Return: streaming .zip file (application/zip)
// ============================================================

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { getPeriodeBulan } from "@/lib/status";
import { ZipArchive } from "archiver";
import * as XLSX from "xlsx";
import { auditLog } from "@/lib/audit";
import { downloadStorageObject } from "@/lib/storage";

export async function POST() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const periode = getPeriodeBulan();
    const [strukList, anggotaList, transaksiList, settings] = await Promise.all([
      db.struk.findMany({
        where: { periodeBulan: periode, statusStruk: "APPROVED" },
        include: { anggota: { select: { namaLengkap: true, gender: true } } },
        orderBy: { anggota: { namaLengkap: "asc" } },
      }),
      db.anggota.findMany({
        orderBy: [{ gender: "asc" }, { namaLengkap: "asc" }],
        select: { id: true, gender: true, namaLengkap: true, noHpWa: true, status: true },
      }),
      db.transaksi.findMany({
        where: { periodeBulan: periode, tipe: "MASUK", strukId: { not: null } },
        select: { anggotaId: true, nominal: true },
      }),
      getSettings(),
    ]);

    const paidByAnggota = new Map<string, number>();
    for (const t of transaksiList) {
      if (!t.anggotaId) continue;
      paidByAnggota.set(t.anggotaId, (paidByAnggota.get(t.anggotaId) ?? 0) + t.nominal);
    }
    const totalKasMasuk = transaksiList.reduce((sum, t) => sum + t.nominal, 0);

    // Build Excel rekap
    const rekapData = anggotaList.map((a, i) => ({
      No: i + 1,
      Gender: a.gender,
      "Nama Lengkap": a.namaLengkap,
      "No HP/WA": a.noHpWa,
      Status: a.status === "LUNAS" ? "LUNAS" : "BELUM_LUNAS",
      "Nominal Iuran": settings.nominalIuran,
      "Sudah Bayar": paidByAnggota.get(a.id) ?? 0,
      Periode: periode,
    }));
    const ws = XLSX.utils.json_to_sheet(rekapData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rekap");
    const excelBuffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    // Build zip stream
    const archive = new ZipArchive({ zlib: { level: 6 } });

    // Tambahkan file Excel
    archive.append(excelBuffer, { name: "rekap-anggota.xlsx" });

    // Tambahkan README
    const readme = `SIDU — Laporan Bulanan
Periode: ${periode}
Generated: ${new Date().toISOString()}

Isi:
- rekap-anggota.xlsx: data seluruh anggota + status pembayaran
- struk/: ${strukList.length} gambar struk APPROVED periode ini

Statistik:
- Total anggota: ${anggotaList.length}
- Anggota LUNAS: ${anggotaList.filter((a) => a.status === "LUNAS").length}
- Struk APPROVED: ${strukList.length}
- Total kas masuk: Rp ${totalKasMasuk.toLocaleString("id-ID")}
- Nominal iuran: Rp ${settings.nominalIuran.toLocaleString("id-ID")}
`;
    archive.append(readme, { name: "README.txt" });

    // Tambahkan gambar struk
    let addedStruk = 0;
    const usedNames = new Set<string>();
    for (const s of strukList) {
      try {
        const imgBuf = await downloadStorageObject(s.imageUrl);
        // Unique filename: {namaLengkap}.ext (handle duplicate names)
        const safeBase = s.anggota.namaLengkap
          .normalize("NFKC")
          .replace(/[\\/:*?"<>|\x00-\x1f]/g, "-")
          .replace(/\.\./g, "-")
          .replace(/\s+/g, " ")
          .trim()
          .replace(/^\.+|\.+$/g, "") || "struk";
        let name = safeBase;
        let counter = 2;
        while (usedNames.has(name)) {
          name = `${safeBase}-${counter}`;
          counter++;
        }
        usedNames.add(name);
        const ext = s.imageUrl.endsWith(".png") ? "png" : s.imageUrl.endsWith(".webp") ? "webp" : "jpg";
        archive.append(imgBuf, { name: `struk/${name}.${ext}` });
        addedStruk++;
      } catch {
        /* skip file yang tidak bisa dibaca */
      }
    }

    // Stream ke response
    const chunks: Buffer[] = [];
    archive.on("data", (chunk: Buffer) => chunks.push(chunk));

    await new Promise<void>((resolve, reject) => {
      archive.on("end", () => resolve());
      archive.on("error", (e: Error) => reject(e));
      archive.finalize();
    });

    const zipBuffer = Buffer.concat(chunks);
    const filename = `laporan-${periode}.zip`;

    await auditLog("GENERATE_LAPORAN", {
      targetLabel: `Periode ${periode}`,
      detail: `${addedStruk} struk + rekap-anggota.xlsx (${zipBuffer.length} bytes)`,
    });

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": zipBuffer.length.toString(),
        "X-Periode": periode,
        "X-Struk-Count": addedStruk.toString(),
      },
    });
  } catch (e) {
    console.error("[laporan generate] error", e);
    return NextResponse.json(
      { error: "Gagal generate laporan: " + (e instanceof Error ? e.message : "") },
      { status: 500 }
    );
  }
}
