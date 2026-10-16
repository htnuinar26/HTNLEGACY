# Aturan Kerja Agent HTN Legacy

## TODO dan pencatatan perubahan

1. Semua pengajuan revisi yang diminta user harus dicatat sebagai item checklist di `TODO.md`.
2. Item yang benar-benar selesai diberi tanda `[x]`. Item yang ditunda atau menunggu instruksi user tetap diberi tanda `[ ]` dengan alasan yang jelas.
3. `TODO.md` tidak boleh dihapus atau diganti dengan daftar baru tanpa mempertahankan riwayat item sebelumnya.
4. Setiap perubahan project harus dicatat di `CHANGELOG.md`.
5. `CHANGELOG.md` bersifat append-only. Catatan yang sudah ada tidak boleh ditimpa; perubahan baru ditambahkan dengan tanggal dan divider.

## GitHub workflow

1. Sebelum perubahan, periksa `git status`, branch remote, Issue, dan PR terbuka.
2. Issue harus dibuat dalam Markdown multiline dengan bagian masalah, tujuan, perubahan yang diharapkan, dan acceptance criteria.
3. Perubahan dipisahkan ke branch deskriptif dan commit Conventional Commit.
4. Jika diminta membuat banyak commit, setiap commit harus tetap fokus dan dapat ditinjau; jangan membuat commit kosong atau memecah perubahan secara artifisial.
5. PR harus memuat ringkasan, daftar perubahan, validasi, dampak data, dan deployment checklist.
6. Agent tidak boleh merge PR atau membuat release tanpa instruksi eksplisit user.
7. Issue dan PR harus dibuat tanpa menduplikasi Issue atau PR yang masih terbuka.

## Perlindungan perubahan lokal

- Perubahan lokal user, termasuk `.gitignore`, tidak boleh ditimpa tanpa persetujuan.
- Data database, storage, migration, dan environment production tidak boleh dihapus tanpa instruksi eksplisit.
