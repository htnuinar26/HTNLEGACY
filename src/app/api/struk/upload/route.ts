// POST /api/struk/upload
// Upload struk dengan verifikasi password per-aksi untuk review manual.

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getPeriodeBulan } from "@/lib/status";
import { verifyPassword } from "@/lib/crypto";
import { checkRateLimit, getClientIp, resetRateLimit } from "@/lib/rate-limit";
import { uploadStorageObject, removeStorageObjects } from "@/lib/storage";

const MAX_SIZE = 5 * 1024 * 1024;
const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);

  try {
    const form = await req.formData();
    const anggotaId = String(form.get("anggotaId") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const file = form.get("file");

    if (!anggotaId || !password || !(file instanceof File)) {
      return NextResponse.json(
        { error: "anggotaId, password, dan file wajib diisi." },
        { status: 400 }
      );
    }

    const ext = MIME_TO_EXT[file.type];
    if (!ext) {
      return NextResponse.json(
        { error: "Format file harus JPG, PNG, atau WebP." },
        { status: 400 }
      );
    }
    if (file.size <= 0 || file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Ukuran file harus lebih dari 0 dan maksimal 5MB." },
        { status: 400 }
      );
    }

    const rateKey = `upload:${anggotaId}:${ip}`;
    const rate = checkRateLimit(rateKey, 5, 300, 60);
    if (!rate.ok) {
      return NextResponse.json(
        {
          error: `Terlalu banyak percobaan. Coba lagi dalam ${rate.retryAfterSeconds} detik.`,
          retryAfter: rate.retryAfterSeconds,
        },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds ?? 60) } }
      );
    }

    const anggota = await db.anggota.findUnique({
      where: { id: anggotaId },
      select: { id: true, passwordEnc: true, namaLengkap: true, gender: true },
    });
    if (!anggota || !verifyPassword(password, anggota.passwordEnc)) {
      return NextResponse.json({ error: "Password atau anggota tidak valid." }, { status: 401 });
    }
    resetRateLimit(rateKey);

    const periode = getPeriodeBulan();
    const existing = await db.struk.findFirst({
      where: { anggotaId, periodeBulan: periode, statusStruk: { in: ["PENDING", "APPROVED"] } },
      select: { statusStruk: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: `Sudah ada struk ${existing.statusStruk.toLowerCase()} untuk periode ini.` },
        { status: 409 }
      );
    }

    const filename = `${anggota.id}-${Date.now()}.${ext}`;
    const storagePath = `struk/${periode}/${filename}`;
    const imageBuffer = Buffer.from(await file.arrayBuffer());
    await uploadStorageObject(storagePath, imageBuffer, file.type);

    try {
      const activeAfterSave = await db.struk.findFirst({
        where: { anggotaId, periodeBulan: periode, statusStruk: { in: ["PENDING", "APPROVED"] } },
        select: { statusStruk: true },
      });
      if (activeAfterSave) {
        await removeStorageObjects([storagePath]).catch(() => undefined);
        return NextResponse.json(
          { error: `Sudah ada struk ${activeAfterSave.statusStruk.toLowerCase()} untuk periode ini.` },
          { status: 409 }
        );
      }

      const created = await db.struk.create({
        data: {
          anggotaId,
          imageUrl: storagePath,
          statusStruk: "PENDING",
          periodeBulan: periode,
        },
      });

      return NextResponse.json({ ok: true, strukId: created.id, statusStruk: created.statusStruk });
    } catch (error) {
      await removeStorageObjects([storagePath]).catch(() => undefined);
      throw error;
    }
  } catch (error) {
    console.error("[struk upload] error", error);
    return NextResponse.json({ error: "Gagal memproses upload struk." }, { status: 500 });
  }
}
