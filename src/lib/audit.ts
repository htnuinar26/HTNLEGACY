// ============================================================
// SIDU — Audit Log helper
// ------------------------------------------------------------
// Catat aksi admin ke tabel AuditLog. Best-effort: kegagalan logging
// tidak boleh menggagalkan aksi utama.
// ============================================================

import { db } from "./db";

export type AuditAksi =
  | "APPROVE_STRUK"
  | "REJECT_STRUK"
  | "GENERATE_STRUK_MANUAL"
  | "UPDATE_STATUS"
  | "UPDATE_ANGGOTA"
  | "DELETE_ANGGOTA"
  | "ADD_ANGGOTA"
  | "IMPORT_ANGGOTA"
  | "UPDATE_SETTINGS"
  | "ADD_TRANSAKSI"
  | "DELETE_TRANSAKSI"
  | "RESET_SIKLUS"
  | "GENERATE_LAPORAN";

/**
 * Catat aksi admin. Best-effort (try/catch, tidak throw).
 */
export async function auditLog(
  aksi: AuditAksi,
  opts: {
    targetId?: string;
    targetLabel?: string;
    detail?: string;
  } = {}
): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        actor: "admin",
        aksi,
        targetId: opts.targetId ?? null,
        targetLabel: opts.targetLabel ?? null,
        detail: opts.detail ?? null,
      },
    });
  } catch (e) {
    console.warn("[audit] gagal log (best-effort):", e);
  }
}
