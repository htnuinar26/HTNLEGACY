# TODO Revisi Project

Daftar pengajuan revisi HTN Legacy. Item yang selesai diberi tanda centang dan tidak dihapus dari riwayat.

- [x] 1. Perbaiki input nominal kas agar menerima nominal rupiah penuh tanpa batasan `1.001` atau batas angka yang tidak diperlukan.
- [x] 2. Izinkan Admin menghapus transaksi pemasukan maupun pengeluaran, termasuk transaksi yang berasal dari receipt. Status receipt dan anggota disinkronkan kembali.
- [ ] 3. Penggantian logo ditunda sampai ada instruksi lanjutan.
- [x] 4. Tambahkan upload receipt untuk periode berjalan dan maksimal tiga bulan sebelumnya, satu receipt per anggota per periode.
- [x] 5. Rapikan tampilan label dan badge `Tertunggak` agar tidak pecah pada layar kecil.
- [x] 6. Tambahkan dark mode dengan pilihan tema terang, gelap, dan mengikuti sistem.
- [x] 7. Perbaiki responsivitas dasar shell, tombol, kartu, chart, tabel, dan modal pada mobile.
- [x] 8. Audit folder `logs/`; folder tersebut tidak tersedia pada saat audit sehingga tidak ada file log yang perlu diperbaiki.
- [x] 9. Simpan seluruh pengajuan revisi ini dalam file `TODO.md`.
- [x] 10. Buat `CHANGELOG.md` sebagai catatan perubahan append-only.
- [x] 11. Buat Issue terfokus dan PR terpisah tanpa merge otomatis.
- [x] 12. Dokumentasikan aturan TODO, CHANGELOG, Issue, dan PR di `AGENT.md`.

## Catatan aturan receipt

Duplikasi pada bulan yang sama tetap ditolak oleh server. Pengiriman lintas bulan hanya berlaku untuk empat periode terbaru, termasuk periode berjalan.
