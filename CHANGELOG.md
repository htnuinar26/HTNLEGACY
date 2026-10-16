# Changelog

Semua perubahan baru ditambahkan di bagian paling atas. Catatan lama tidak ditimpa.

---

## 2026-10-16

### Revisi kas, receipt, UI, dan workflow

- Memperbaiki input nominal transaksi kas agar menerima nominal rupiah penuh tanpa batasan format yang tidak diperlukan.
- Mengizinkan penghapusan transaksi kas oleh Admin, termasuk pemasukan yang terhubung dengan receipt.
- Menyinkronkan status receipt dan status anggota setelah transaksi receipt dihapus.
- Menambahkan alur upload receipt untuk empat periode terbaru.
- Menolak duplikasi receipt pada anggota dan periode yang sama di server.
- Menggunakan nominal receipt yang tersimpan saat approval, termasuk receipt historis.
- Merapikan badge `Tertunggak` dan responsivitas dasar komponen UI.
- Menambahkan dark mode berbasis preferensi sistem dan tombol pengubah tema.
- Menambahkan `TODO.md` untuk pelacakan revisi dan aturan workflow.
- Mencatat audit bahwa folder `logs/` tidak tersedia pada saat pemeriksaan.
