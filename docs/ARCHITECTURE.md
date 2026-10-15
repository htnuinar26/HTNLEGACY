# Architecture

## Komponen

- Next.js App Router menangani halaman dan API.
- Prisma dan Neon PostgreSQL menangani database.
- Supabase Storage menyimpan file receipt dan barcode.
- Middleware dan route handler menerapkan authorization Admin/anggota.
- Admin review page menangani keputusan manual.

## Alur Receipt

```text
User
  -> POST /api/struk/upload
  -> validasi data dasar dan file
  -> simpan file
  -> buat Struk(PENDING)
  -> Admin membuka /admin/struk
  -> APPROVED atau REJECTED
```

Isi receipt tidak dibaca atau dinilai otomatis. File yang tidak terbaca tetap masuk antrean selama data dasar dan file valid.

## Approval

Approval memperbarui receipt, anggota, dan transaksi pemasukan dalam satu transaksi database. API tetap memeriksa status receipt agar request lama tidak dapat memproses receipt yang sudah selesai.

## Rejection

Rejection menyimpan alasan, mengembalikan anggota ke status yang sesuai, dan memungkinkan submit ulang. Pesan WhatsApp tidak dikirim otomatis; sistem dapat menyediakan tautan manual `wa.me`.

## Deployment

Deployment menggunakan build Next.js standalone dan Caddy. Tidak ada service tambahan untuk pemrosesan receipt atau WhatsApp.
