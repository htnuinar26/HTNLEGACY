// ============================================================
// SIDU — StatusBadge (konsisten di semua halaman, DESIGN §4.3 & §7)
// ------------------------------------------------------------
// Warna status 100% konsisten:
// - LUNAS        → hijau
// - BELUM_LUNAS  → netral
// - TERTUNGGAK   → merah
// - PENDING      → kuning amber
//
// Selalu disertai label teks + ikon (a11y, tidak andalkan warna).
// ============================================================

import { CheckCircle2, CircleDashed, AlertTriangle, Clock } from "lucide-react";
import { STATUS_IURAN, STATUS_STRUK } from "@/lib/constants";
import { cn } from "@/lib/utils";

type StatusType =
  | "LUNAS"
  | "BELUM_LUNAS"
  | "TERTUNGGAK"
  | "PENDING"
  | "APPROVED"
  | "REJECTED";

const MAP: Record<
  StatusType,
  { cls: string; label: string; icon: React.ElementType }
> = {
  LUNAS: { cls: "badge-lunas", label: "Lunas", icon: CheckCircle2 },
  BELUM_LUNAS: { cls: "badge-belum-lunas", label: "Belum Lunas", icon: CircleDashed },
  TERTUNGGAK: { cls: "badge-tertunggak", label: "Tertunggak", icon: AlertTriangle },
  PENDING: { cls: "badge-pending", label: "Pending", icon: Clock },
  APPROVED: { cls: "badge-lunas", label: "Disetujui", icon: CheckCircle2 },
  REJECTED: { cls: "badge-tertunggak", label: "Ditolak", icon: AlertTriangle },
};

export function StatusBadge({ status }: { status: StatusType }) {
  const cfg = MAP[status] ?? MAP.BELUM_LUNAS;
  const Icon = cfg.icon;
  return (
    <span className={cn("brutal-badge status-badge", cfg.cls)}>
      <Icon size={13} strokeWidth={2.5} aria-hidden="true" />
      <span>{cfg.label}</span>
    </span>
  );
}

/** Helper untuk konversi dari stored status + derived. */
export function statusBadgeFromIuran(storedStatus: string): StatusType {
  if (storedStatus === STATUS_IURAN.LUNAS) return "LUNAS";
  if (storedStatus === STATUS_IURAN.TERTUNGGAK) return "TERTUNGGAK";
  return "BELUM_LUNAS";
}

export function statusBadgeFromStruk(storedStatus: string): StatusType {
  if (storedStatus === STATUS_STRUK.APPROVED) return "APPROVED";
  if (storedStatus === STATUS_STRUK.REJECTED) return "REJECTED";
  return "PENDING";
}
