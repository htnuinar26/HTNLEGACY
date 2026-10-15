<div align="center">
  <img src="public/assets/images/logo-htnlegacy.png" alt="HTN Legacy" width="180" />
  <h1>HTN Legacy</h1>
  <p>Sistem digital untuk pencatatan, pembayaran, dan verifikasi iuran kas bulanan.</p>
</div>

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-149eca?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/Prisma-6-2d3748?logo=prisma" alt="Prisma 6" />
  <img src="https://img.shields.io/badge/Database-Neon%20PostgreSQL-00e599?logo=postgresql" alt="Neon PostgreSQL" />
  <img src="https://img.shields.io/badge/Runtime-Bun-f9f1e1?logo=bun" alt="Bun" />
</div>

## Tentang Project

HTN Legacy adalah aplikasi internal untuk membantu organisasi mengelola iuran kas bulanan secara transparan dan terstruktur.

Anggota dapat melihat status pembayaran, daftar anggota, barcode pembayaran, riwayat transaksi, dan mengirim bukti pembayaran. Admin dapat mengelola anggota, memverifikasi bukti pembayaran, mencatat transaksi, mengatur nominal iuran, mengimpor data, serta membuat laporan bulanan.

## Fitur Utama

- Autentikasi anggota dengan gender, nama lengkap, dan password.
- Akses admin menggunakan password bersama yang disimpan di environment variable.
- Dashboard status pembayaran anggota: lunas, belum lunas, dan tertunggak.
- Upload bukti pembayaran dengan verifikasi password per aksi.
- Review receipt dilakukan manual oleh Admin/Bendahara.
- Verifikasi admin dengan aksi approve dan reject.
- Pencatatan transaksi pemasukan otomatis dari struk approved.
- Pencatatan transaksi pemasukan dan pengeluaran manual.
- Grafik kas bulanan dan histori transaksi.
- Import data anggota dari XLSX atau JSON.
- Pengaturan nominal iuran, deadline, barcode, dan kontak pengurus.
- Audit log untuk aktivitas admin.
- Export laporan ZIP berisi rekap Excel dan gambar bukti pembayaran.
- Reset siklus bulanan tanpa menghapus histori transaksi.
- Tampilan responsive dengan desain playful neo-brutalist.

## Teknologi

| Area | Teknologi |
| --- | --- |
| Framework | Next.js App Router 16 |
| UI | React 19, Tailwind CSS 4, Radix UI |
| Bahasa | TypeScript |
| Runtime dan package manager | Bun |
| Database | PostgreSQL melalui Neon dan Prisma |
| Autentikasi | JWT berbasis httpOnly cookie |
| Enkripsi password anggota | AES-256-GCM |
| Receipt | Upload file dan review manual Admin/Bendahara |
| Laporan | XLSX dan Archiver |
| Grafik | Recharts |
| Reverse proxy | Caddy |

## Persyaratan

- Bun versi 1.4 atau lebih baru.
- Node.js versi 20 atau lebih baru untuk script tooling.
- Environment variable yang diperlukan.
- Neon PostgreSQL dan Supabase Storage.

## Instalasi Lokal

1. Clone repository.

```bash
git clone <URL_REPOSITORY>
cd HTN26Legacy
```

2. Install dependency.

```bash
bun install
```

3. Salin template environment.

PowerShell:

```powershell
Copy-Item .env.example .env
```

Linux atau macOS:

```bash
cp .env.example .env
```

4. Isi secret pada `.env`.

```env
DATABASE_URL="postgresql://user:password@ep-example-pooler.region.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-example.region.aws.neon.tech/neondb?sslmode=require"
JWT_SECRET="ganti-dengan-secret-random-yang-panjang"
ENCRYPTION_KEY="64-karakter-hex-untuk-32-byte"
ADMIN_PASSWORD="password-admin-yang-kuat"
```

5. Generate Prisma Client dan sinkronkan schema.

```bash
bun run db:generate
bun run db:push
```

6. Jalankan mode development.

```bash
bun run dev
```

Aplikasi tersedia di `http://localhost:3000`.

## Perintah Project

```bash
bun run dev          # Menjalankan development server
bun run lint         # Menjalankan ESLint
bun run build        # Build production dan menyiapkan standalone output
bun run start        # Menjalankan standalone server
bun run db:generate  # Generate Prisma Client
bun run db:push      # Sinkronkan schema ke database
bun run db:migrate   # Membuat migration Prisma
bun run db:reset     # Reset database development
```

## Environment Variables

Template lengkap tersedia pada [.env.example](.env.example).

| Variable | Wajib | Keterangan |
| --- | --- | --- |
| `DATABASE_URL` | Ya | Connection string database Prisma |
| `JWT_SECRET` | Ya | Secret untuk signing session JWT |
| `ENCRYPTION_KEY` | Ya | 64 karakter hex atau 32 karakter string untuk AES-256-GCM |
| `ADMIN_PASSWORD` | Ya | Password akses panel admin |
| `DIRECT_URL` | Ya untuk migrasi | Direct connection Neon untuk Prisma migration |
| `SUPABASE_URL` | Ya | URL project Supabase untuk Storage |
| `SUPABASE_SECRET_KEY` | Ya | Secret key server-side Supabase Storage |
| `SUPABASE_STORAGE_BUCKET` | Ya | Nama bucket Storage receipt dan barcode |
| `NEXT_PUBLIC_INSTANCE_NAME` | Tidak | Nama instance yang ditampilkan di UI |
| `DEBUG_MW` | Tidak | Set `1` untuk log middleware |

Jangan commit `.env` ke repository. File tersebut sudah di-ignore oleh `.gitignore`.

## Struktur Direktori

```text
src/
├── app/                    # Pages dan API route handlers
├── components/             # Komponen UI dan shell aplikasi
├── hooks/                  # React hooks
├── lib/                    # Database, auth, session, dan helper
└── proxy.ts                # Proteksi route berbasis session cookie

prisma/
└── schema.prisma           # Schema database

public/
├── assets/images/          # Asset branding utama
├── uploads/                # Upload lokal untuk development atau deployment lokal
├── favicon.ico             # Favicon browser
└── logo.svg                # Logo SVG kompatibilitas

scripts/
└── copy-standalone.mjs     # Menyalin asset untuk standalone deployment
```

## Route Utama

| Route | Keterangan |
| --- | --- |
| `/login` | Login anggota |
| `/signup` | Registrasi anggota |
| `/beranda` | Dashboard anggota |
| `/profil` | Profil dan riwayat anggota |
| `/barcode` | Barcode pembayaran dan kontak pengurus |
| `/kas` | Grafik kas publik untuk anggota yang login |
| `/admin` | Login panel admin |
| `/admin/dashboard` | Dashboard admin |
| `/admin/anggota` | Manajemen anggota |
| `/admin/struk` | Verifikasi bukti pembayaran |
| `/admin/kas` | Manajemen transaksi kas |
| `/admin/import` | Import anggota |
| `/admin/settings` | Pengaturan aplikasi |
| `/admin/laporan` | Generate laporan dan reset siklus |

## Keamanan

- Session anggota dan admin menggunakan cookie `httpOnly`.
- Password anggota dienkripsi menggunakan AES-256-GCM sesuai kebutuhan produk agar dapat dipulihkan admin.
- Password tidak boleh disimpan di source code atau repository.
- Endpoint sensitif menggunakan validasi session atau verifikasi password per aksi.
- Upload dibatasi ke gambar JPG, PNG, dan WebP dengan ukuran maksimal 5MB.
- Rate limit digunakan pada autentikasi dan verifikasi password.
- File environment lokal tidak boleh dikomit.
- Gunakan HTTPS pada deployment production.
- Gunakan password admin dan secret encryption yang kuat serta unik.

## Deployment Production

Build production menghasilkan standalone server Next.js.

```bash
bun install --frozen-lockfile
bun run db:generate
bun run build
bun run start
```

Reverse proxy dapat menggunakan Caddy. Contoh konfigurasi tersedia pada [Caddyfile](Caddyfile).

Pastikan Neon PostgreSQL dan bucket Supabase Storage sudah tersedia sebelum deployment.

## Catatan Pengembangan

- `TERTUNGGAK` dihitung secara dinamis berdasarkan deadline, bukan disimpan permanen di database.
- Record `Transaksi` dipertahankan sebagai histori permanen.
- Reset siklus mengubah status anggota dan membersihkan file upload periode berjalan.
- WhatsApp hanya menggunakan tautan manual `wa.me`; tidak ada service WhatsApp yang berjalan terus-menerus.
- Receipt yang diupload langsung berstatus `PENDING` dan diverifikasi manual oleh Admin/Bendahara.

## Lisensi

Project ini digunakan untuk kebutuhan internal HTN Legacy.
