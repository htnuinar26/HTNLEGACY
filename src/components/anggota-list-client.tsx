"use client";

import { useState } from "react";
import { UploadStrukModal } from "./upload-struk-modal";
import { StatusBadge } from "./status-badge";
import { Upload, Search, Mars, Venus } from "lucide-react";

type AnggotaItem = {
  id: string;
  gender: string;
  namaLengkap: string;
  noHpWa: string;
  status: string;
  statusTampil: string;
  receiptAktif?: string | null;
};

export function AnggotaListClient({
  anggota,
  myId,
}: {
  anggota: AnggotaItem[];
  myId: string | null;
}) {
  const [selected, setSelected] = useState<AnggotaItem | null>(null);
  const [filter, setFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState<"ALL" | "PRIA" | "WANITA">("ALL");
  const [tick, setTick] = useState(0);

  const filtered = anggota.filter((a) => {
    const matchName = a.namaLengkap
      .toLowerCase()
      .includes(filter.toLowerCase());
    const matchGender = genderFilter === "ALL" || a.gender === genderFilter;
    return matchName && matchGender;
  });

  // Sort: LUNAS first, then BELUM_LUNAS, then TERTUNGGAK
  const order: Record<string, number> = {
    LUNAS: 0,
    BELUM_LUNAS: 1,
    TERTUNGGAK: 2,
  };
  filtered.sort((a, b) => {
    const so = order[a.statusTampil] ?? 99;
    const bo = order[b.statusTampil] ?? 99;
    if (so !== bo) return so - bo;
    return a.namaLengkap.localeCompare(b.namaLengkap);
  });

  return (
    <>
      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search
            size={18}
            strokeWidth={2.5}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b6b6b]"
            aria-hidden="true"
          />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Cari nama anggota..."
            className="brutal-input pl-10"
          />
        </div>
        <div className="flex gap-2">
          {(["ALL", "PRIA", "WANITA"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGenderFilter(g)}
              className="brutal-btn px-3 py-2 text-sm"
              style={{
                background:
                  genderFilter === g ? "var(--accent-primary)" : "var(--surface)",
              }}
              aria-pressed={genderFilter === g}
            >
              {g === "PRIA" && <Mars size={16} strokeWidth={2.5} />}
              {g === "WANITA" && <Venus size={16} strokeWidth={2.5} />}
              <span>
                {g === "ALL" ? "Semua" : g === "PRIA" ? "Pria" : "Wanita"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setSelected(a)}
            className="brutal-card-flat brutal-hover-lift p-4 text-left"
            style={{ background: "var(--surface)" }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                {a.gender === "PRIA" ? (
                  <Mars size={16} strokeWidth={2.5} className="shrink-0 text-[var(--accent-secondary)]" />
                ) : (
                  <Venus size={16} strokeWidth={2.5} className="shrink-0 text-[var(--accent-secondary)]" />
                )}
                <span className="font-bold truncate">{a.namaLengkap}</span>
                {a.id === myId && (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 shrink-0"
                    style={{
                      background: "var(--accent-primary)",
                      border: "1.5px solid var(--ink)",
                      borderRadius: 4,
                    }}
                  >
                    ANDA
                  </span>
                )}
              </div>
              <StatusBadge status={a.statusTampil as "LUNAS" | "BELUM_LUNAS" | "TERTUNGGAK"} />
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-[var(--accent-tertiary)]">
              {a.receiptAktif && <span>Periode berjalan: receipt {a.receiptAktif === "PENDING" ? "menunggu review" : "sudah disetujui"}.</span>}
              {!a.receiptAktif && <Upload size={12} strokeWidth={2.5} />}
              <span>{a.receiptAktif ? "Klik untuk upload periode lain (maks 4 bulan)" : "Klik untuk upload struk (maks 4 bulan)"}</span>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full brutal-card-flat p-6 text-center text-[#6b6b6b] font-semibold">
            Tidak ada anggota yang cocok.
          </div>
        )}
      </div>

      {selected && (
        <UploadStrukModal
          anggota={selected}
          onClose={() => setSelected(null)}
          onSuccess={() => setTick((t) => t + 1)}
        />
      )}
      {/* tick dipakai untuk trigger refresh via key */}
      <span className="sr-only" aria-hidden="true">{tick}</span>
    </>
  );
}
