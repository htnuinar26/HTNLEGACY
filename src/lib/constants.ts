// ============================================================
// SIDU — App-layer constants & validators
// ------------------------------------------------------------
// Nilai status disimpan sebagai String agar data tetap kompatibel.
// disimpan sebagai String dengan konstanta di sini. Saat migrasi
// ke PostgreSQL, cukup ubah schema Prisma ke native enum tanpa
// menyentuh logic downstream (konstanta ini tetap dipakai).
// ============================================================

export const GENDER = {
  PRIA: "PRIA",
  WANITA: "WANITA",
} as const;
export type Gender = (typeof GENDER)[keyof typeof GENDER];

export const STATUS_IURAN = {
  BELUM_LUNAS: "BELUM_LUNAS",
  LUNAS: "LUNAS",
  // TERTUNGGAK TIDAK disimpan sebagai field permanen — derived on-the-fly
  // (lihat lib/status.ts computeAnggotaStatus). Hanya dipakai di UI/presentasi.
  TERTUNGGAK: "TERTUNGGAK",
} as const;
export type StatusIuran = (typeof STATUS_IURAN)[keyof typeof STATUS_IURAN];

export const STATUS_STRUK = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;
export type StatusStruk = (typeof STATUS_STRUK)[keyof typeof STATUS_STRUK];

export const TIPE_TRANSAKSI = {
  MASUK: "MASUK",
  KELUAR: "KELUAR",
} as const;
export type TipeTransaksi = (typeof TIPE_TRANSAKSI)[keyof typeof TIPE_TRANSAKSI];

// ============================================================
// Validators — dipakai sebelum insert/update
// ============================================================

export function isValidGender(v: string): v is Gender {
  return v === GENDER.PRIA || v === GENDER.WANITA;
}

export function isValidStatusIuranStored(v: string): boolean {
  // Hanya BELUM_LUNAS / LUNAS yang boleh disimpan. TERTUNGGAK derived.
  return v === STATUS_IURAN.BELUM_LUNAS || v === STATUS_IURAN.LUNAS;
}

export function isValidStatusStruk(v: string): v is StatusStruk {
  return (
    v === STATUS_STRUK.PENDING ||
    v === STATUS_STRUK.APPROVED ||
    v === STATUS_STRUK.REJECTED
  );
}

export function isValidTipeTransaksi(v: string): v is TipeTransaksi {
  return v === TIPE_TRANSAKSI.MASUK || v === TIPE_TRANSAKSI.KELUAR;
}
