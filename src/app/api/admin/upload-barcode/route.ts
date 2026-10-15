// ============================================================
// POST /api/admin/upload-barcode
// ------------------------------------------------------------
// Upload gambar barcode statis (bukan generate dinamis).
// Disimpan di Supabase Storage dan menggantikan object barcode sebelumnya.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { uploadStorageObject, removeStorageObjects, createStorageSignedUrl } from "@/lib/storage";

const ALLOWED = ["image/png", "image/jpeg", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const fd = await req.formData();
    const file = fd.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File tidak ditemukan." }, { status: 400 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json(
        { error: "Format tidak didukung. Pakai PNG/JPG/WebP." },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Ukuran file melebihi 5MB." },
        { status: 400 }
      );
    }

    const ext = file.type === "image/png" ? "png" : file.type === "image/jpeg" ? "jpg" : "webp";
    const filename = `assets/barcode-${Date.now()}.${ext}`;
    const buf = Buffer.from(await file.arrayBuffer());
    await uploadStorageObject(filename, buf, file.type);

    const previous = await db.settings.findUnique({ where: { id: "singleton" }, select: { barcodeImageUrl: true } });
    if (previous?.barcodeImageUrl && !previous.barcodeImageUrl.startsWith("/")) {
      await removeStorageObjects([previous.barcodeImageUrl]).catch(() => undefined);
    }
    // Update settings
    await db.settings.upsert({
      where: { id: "singleton" },
      update: { barcodeImageUrl: filename },
      create: { id: "singleton", barcodeImageUrl: filename },
    });

    return NextResponse.json({ ok: true, url: await createStorageSignedUrl(filename) });
  } catch (e) {
    console.error("[upload-barcode] error", e);
    return NextResponse.json(
      { error: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}
