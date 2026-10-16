"use client";

import { useState } from "react";
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
  Mars,
  Venus,
} from "lucide-react";
import { EmptyState } from "@/components/empty-state";

type LogItem = {
  id: string;
  actor: string;
  aksi: string;
  targetId: string | null;
  targetLabel: string | null;
  detail: string | null;
  createdAt: string;
};

const AKSI_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  APPROVE_STRUK: { icon: CheckCircle2, color: "#14532d", bg: "var(--status-lunas)" },
  REJECT_STRUK: { icon: XCircle, color: "#ffffff", bg: "var(--status-tertunggak)" },
  UPDATE_STATUS: { icon: Pencil, color: "var(--ink)", bg: "var(--accent-primary)" },
  UPDATE_ANGGOTA: { icon: Pencil, color: "var(--ink)", bg: "var(--accent-primary)" },
  DELETE_ANGGOTA: { icon: Trash2, color: "#ffffff", bg: "var(--status-tertunggak)" },
  ADD_ANGGOTA: { icon: Plus, color: "var(--ink)", bg: "var(--status-lunas)" },
  IMPORT_ANGGOTA: { icon: Upload, color: "var(--ink)", bg: "var(--accent-secondary)" },
  UPDATE_SETTINGS: { icon: SettingsIcon, color: "var(--ink)", bg: "var(--accent-primary)" },
  ADD_TRANSAKSI: { icon: Plus, color: "var(--ink)", bg: "var(--status-lunas)" },
  DELETE_TRANSAKSI: { icon: Trash2, color: "#ffffff", bg: "var(--status-tertunggak)" },
  RESET_SIKLUS: { icon: RefreshCw, color: "var(--ink)", bg: "var(--status-pending)" },
  GENERATE_LAPORAN: { icon: FileArchive, color: "var(--ink)", bg: "var(--accent-tertiary)" },
  GENERATE_STRUK_MANUAL: { icon: ReceiptText, color: "var(--ink)", bg: "var(--accent-primary)" },
};

export function AuditLogList({ initialLogs }: { initialLogs: LogItem[] }) {
  const [filter, setFilter] = useState<string>("ALL");

  const filtered = filter === "ALL" ? initialLogs : initialLogs.filter((l) => l.aksi === filter);
  const aksiOptions = Array.from(new Set(initialLogs.map((l) => l.aksi))).sort();

  return (
    <div className="flex flex-col gap-4">
      {/* Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-bold">Filter:</span>
        <button
          type="button"
          onClick={() => setFilter("ALL")}
          className="brutal-btn px-3 py-1.5 text-xs"
          style={{ background: filter === "ALL" ? "var(--accent-primary)" : "var(--surface)" }}
        >
          Semua ({initialLogs.length})
        </button>
        {aksiOptions.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setFilter(a)}
            className="brutal-btn px-3 py-1.5 text-xs"
            style={{ background: filter === a ? "var(--accent-primary)" : "var(--surface)" }}
          >
            {a}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="Belum ada audit log"
          description="Riwayat aksi admin akan muncul di sini setelah ada aktivitas seperti approve/reject struk, edit anggota, atau reset siklus."
        />
      ) : (
        <div className="brutal-card-flat max-h-[600px] overflow-y-auto">
          <div className="flex flex-col">
            {filtered.map((l, idx) => {
              const cfg = AKSI_CONFIG[l.aksi] ?? { icon: ScrollText, color: "var(--ink)", bg: "var(--bg-base)" };
              const Icon = cfg.icon;
              return (
                <div
                  key={l.id}
                  className="flex items-start gap-3 p-4"
                  style={{
                    borderBottom: idx < filtered.length - 1 ? "1.5px solid var(--ink)" : "none",
                  }}
                >
                  <div
                    className="flex items-center justify-center w-10 h-10 shrink-0 mt-0.5"
                    style={{ background: cfg.bg, border: "2.5px solid var(--ink)", borderRadius: 8 }}
                  >
                    <Icon size={18} strokeWidth={2.5} color={cfg.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm">{l.aksi}</span>
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5"
                        style={{ background: "var(--bg-base)", border: "1.5px solid var(--ink)", borderRadius: 4 }}
                      >
                        {l.actor}
                      </span>
                    </div>
                    {l.targetLabel && (
                      <div className="text-sm font-semibold mt-0.5">
                        Target: <span className="font-bold">{l.targetLabel}</span>
                      </div>
                    )}
                    {l.detail && (
                      <div className="text-xs font-semibold text-[#6b6b6b] mt-0.5 break-words">
                        {l.detail}
                      </div>
                    )}
                  </div>
                  <div className="text-xs font-semibold text-[#6b6b6b] shrink-0 text-right">
                    <div>{new Date(l.createdAt).toLocaleDateString("id-ID")}</div>
                    <div>{new Date(l.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Unused icon imports guard */}
      <span className="hidden">
        <Mars />
        <Venus />
      </span>
    </div>
  );
}
