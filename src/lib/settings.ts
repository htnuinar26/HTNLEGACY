// ============================================================
// SIDU — Settings singleton helper
// ------------------------------------------------------------
// Settings.id selalu "singleton". Auto-create default jika belum ada.
// ============================================================

import { db } from "@/lib/db";
import { createStorageSignedUrl } from "@/lib/storage";

const DEFAULTS = {
  id: "singleton",
  nominalIuran: 15000,
  deadlineTanggal: 10,
  namaBank: null,
  nomorRekening: null,
  barcodeImageUrl: null,
  kontakBendahara: null,
  kontakSekretaris: null,
  kontakKompting: null,
};

export async function getSettings() {
  let s = await db.settings.findUnique({ where: { id: "singleton" } });
  if (!s) {
    s = await db.settings.create({ data: DEFAULTS });
  }
  return s;
}

export async function getSettingsForDisplay() {
  const s = await getSettings();
  return { ...s, barcodeImageUrl: await createStorageSignedUrl(s.barcodeImageUrl ?? "") };
}
