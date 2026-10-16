import { db } from "@/lib/db";
import { formatPeriodeLabel } from "@/lib/periode";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Trash2,
  Pencil,
  Plus,
  Upload,
  Settings as SettingsIcon,
  RefreshCw,
  FileArchive,
  ReceiptText,
  ScrollText,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

const AKSI_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  APPROVE_STRUK: { icon: CheckCircle2, color: "#14532d", bg: "var(--status-lunas)", label: "Approve Struk" },
  REJECT_STRUK: { icon: XCircle, color: "#7f1d1d", bg: "var(--status-tertunggak)", label: "Reject Struk" },
  UPDATE_STATUS: { icon: Pencil, color: "var(--ink)", bg: "var(--accent-primary)", label: "Update Status" },
  UPDATE_ANGGOTA: { icon: Pencil, color: "var(--ink)", bg: "var(--accent-primary)", label: "Update Anggota" },
  DELETE_ANGGOTA: { icon: Trash2, color: "#ffffff", bg: "var(--status-tertunggak)", label: "Hapus Anggota" },
  ADD_ANGGOTA: { icon: Plus, color: "var(--ink)", bg: "var(--status-lunas)", label: "Tambah Anggota" },
  IMPORT_ANGGOTA: { icon: Upload, color: "var(--ink)", bg: "var(--accent-secondary)", label: "Import Anggota" },
  UPDATE_SETTINGS: { icon: SettingsIcon, color: "var(--ink)", bg: "var(--accent-primary)", label: "Update Settings" },
  ADD_TRANSAKSI: { icon: Plus, color: "var(--ink)", bg: "var(--status-lunas)", label: "Tambah Transaksi" },
  DELETE_TRANSAKSI: { icon: Trash2, color: "#ffffff", bg: "var(--status-tertunggak)", label: "Hapus Transaksi" },
  RESET_SIKLUS: { icon: RefreshCw, color: "var(--ink)", bg: "var(--status-pending)", label: "Reset Siklus" },
  GENERATE_LAPORAN: { icon: FileArchive, color: "var(--ink)", bg: "var(--accent-tertiary)", label: "Generate Laporan" },
  GENERATE_STRUK_MANUAL: { icon: ReceiptText, color: "var(--ink)", bg: "var(--accent-primary)", label: "Generate Struk Manual" },
};

export async function RecentActivity({ limit = 5 }: { limit?: number }) {
  const logs = await db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return (
    <section className="brutal-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-extrabold text-lg flex items-center gap-2">
          <ScrollText size={20} strokeWidth={2.5} />
          Aktivitas Terbaru
        </h2>
        <Link
          href="/admin/audit-log"
          className="text-xs font-bold flex items-center gap-1 hover:underline"
          style={{ color: "var(--ink)" }}
        >
          <span>Lihat Semua</span>
          <ArrowRight size={12} strokeWidth={2.5} />
        </Link>
      </div>

      {logs.length === 0 ? (
        <div className="text-center py-6 text-sm font-semibold text-[#6b6b6b]">
          Belum ada aktivitas tercatat.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {logs.map((log) => {
            const cfg = AKSI_CONFIG[log.aksi] ?? { icon: ScrollText, color: "var(--ink)", bg: "var(--bg-base)", label: log.aksi };
            const Icon = cfg.icon;
            return (
              <div
                key={log.id}
                className="flex items-center gap-3 p-2.5"
                style={{
                  background: "var(--bg-base)",
                  border: "1.5px solid var(--ink)",
                  borderRadius: 6,
                }}
              >
                <div
                  className="flex items-center justify-center w-8 h-8 shrink-0"
                  style={{ background: cfg.bg, border: "1.5px solid var(--ink)", borderRadius: 6 }}
                >
                  <Icon size={14} strokeWidth={2.5} color={cfg.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold truncate">{cfg.label}</div>
                  {log.targetLabel && (
                    <div className="text-[11px] font-semibold text-[#6b6b6b] truncate">
                      {log.targetLabel}
                    </div>
                  )}
                </div>
                <div className="text-[10px] font-semibold text-[#6b6b6b] shrink-0 text-right">
                  <div>{new Date(log.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</div>
                  <div>{new Date(log.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
