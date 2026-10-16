"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Line,
  LineChart,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  Minus,
  Trash2,
  Loader2,
  ArrowRight,
  Download,
} from "lucide-react";
import { formatRupiah } from "@/lib/status";
import { ConfirmDialog } from "@/components/confirm-dialog";

type Transaksi = {
  id: string;
  tipe: string;
  nominal: number;
  keterangan: string;
  strukId: string | null;
  anggotaId: string | null;
  periodeBulan: string;
  createdAt: string;
};

type PerBulan = {
  bulan: string;
  masuk: number;
  keluar: number;
  saldo: number;
};

type DataState = {
  bulan: string;
  list: Transaksi[];
  summary: { masuk: number; keluar: number; saldo: number };
  perBulan: PerBulan[];
};

export function KasView({
  initial,
  canEdit,
}: {
  initial: DataState;
  canEdit: boolean;
}) {
  const [data, setData] = useState<DataState>(initial);
  const [bulan, setBulan] = useState(initial.bulan);
  const [loading, setLoading] = useState(false);

  // Form state
  const [tipe, setTipe] = useState<"MASUK" | "KELUAR">("MASUK");
  const [nominal, setNominal] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  // Confirm dialog state
  const [deleteTarget, setDeleteTarget] = useState<Transaksi | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function loadBulan(newBulan: string) {
    setBulan(newBulan);
    setLoading(true);
    try {
      const res = await fetch(`/api/transaksi?bulan=${newBulan}`);
      const d = await res.json();
      setData(d);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setSubmitLoading(true);
    try {
      const res = await fetch("/api/transaksi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipe,
          nominal: Number(nominal),
          keterangan,
          periodeBulan: bulan,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Gagal simpan");
      setNominal("");
      setKeterangan("");
      await loadBulan(bulan);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Gagal simpan");
    } finally {
      setSubmitLoading(false);
    }
  }

  async function handleDelete(id: string) {
    // Trigger confirm dialog instead of native confirm()
    const target = data.list.find((t) => t.id === id);
    if (target) setDeleteTarget(target);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/transaksi/${deleteTarget.id}`, { method: "DELETE" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Gagal hapus");
      setDeleteTarget(null);
      await loadBulan(bulan);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Gagal hapus");
    } finally {
      setDeleteLoading(false);
    }
  }

  function exportCsv(currentBulan: string, list: Transaksi[]) {
    if (list.length === 0) return;
    const header = ["Tanggal", "Tipe", "Nominal", "Keterangan", "Periode", "Dari Struk"];
    const rows = list.map((t) => [
      new Date(t.createdAt).toLocaleString("id-ID"),
      t.tipe,
      String(t.nominal),
      `"${(t.keterangan ?? "").replace(/"/g, '""')}"`,
      t.periodeBulan,
      t.strukId ? "Ya" : "Tidak",
    ]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transaksi-${currentBulan}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Chart data: 6 bulan terakhir + bulan saat ini
  const chartData = data.perBulan.slice(-6).map((b) => ({
    bulan: b.bulan,
    Masuk: b.masuk,
    Keluar: b.keluar,
    Saldo: b.saldo,
  }));

  const PIE_COLORS = ["var(--status-lunas)", "var(--status-tertunggak)"];

  return (
    <div className="flex flex-col gap-6">
      {err && (
        <div
          className="px-4 py-3 text-sm font-semibold"
          style={{
            background: "var(--status-tertunggak-bg)",
            border: "3px solid var(--status-tertunggak)",
            borderRadius: 8,
            color: "#7f1d1d",
          }}
          role="alert"
        >
          {err}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="brutal-card p-4" style={{ background: "var(--status-lunas-bg)" }}>
          <div className="flex items-center gap-2 mb-2">
            <div
              className="flex items-center justify-center w-9 h-9"
              style={{ background: "var(--status-lunas)", border: "2.5px solid #14532d", borderRadius: 8 }}
            >
              <TrendingUp size={18} strokeWidth={2.5} color="#14532d" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "#14532d" }}>
              Kas Masuk
            </span>
          </div>
          <div className="text-2xl font-extrabold tabular-nums" style={{ color: "#14532d" }}>
            {formatRupiah(data.summary.masuk)}
          </div>
        </div>
        <div className="brutal-card p-4" style={{ background: "var(--status-tertunggak-bg)" }}>
          <div className="flex items-center gap-2 mb-2">
            <div
              className="flex items-center justify-center w-9 h-9"
              style={{ background: "var(--status-tertunggak)", border: "2.5px solid #7f1d1d", borderRadius: 8 }}
            >
              <TrendingDown size={18} strokeWidth={2.5} color="#ffffff" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "#7f1d1d" }}>
              Kas Keluar
            </span>
          </div>
          <div className="text-2xl font-extrabold tabular-nums" style={{ color: "#7f1d1d" }}>
            {formatRupiah(data.summary.keluar)}
          </div>
        </div>
        <div className="brutal-card p-4" style={{ background: "var(--accent-primary)" }}>
          <div className="flex items-center gap-2 mb-2">
            <div
              className="flex items-center justify-center w-9 h-9"
              style={{ background: "var(--ink)", border: "2.5px solid var(--ink)", borderRadius: 8 }}
            >
              <Wallet size={18} strokeWidth={2.5} color="#ffffff" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wide">Saldo Bersih</span>
          </div>
          <div className="text-2xl font-extrabold tabular-nums">
            {formatRupiah(data.summary.saldo)}
          </div>
        </div>
      </div>

      {/* Bulan selector + Export */}
      <div className="flex items-center gap-2 flex-wrap justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold">Periode:</span>
          {data.perBulan.slice(-6).reverse().map((b) => (
            <button
              key={b.bulan}
              type="button"
              onClick={() => loadBulan(b.bulan)}
              className="brutal-btn px-3 py-1.5 text-xs"
              style={{
                background: bulan === b.bulan ? "var(--accent-primary)" : "var(--surface)",
              }}
              aria-pressed={bulan === b.bulan}
            >
              {b.bulan}
            </button>
          ))}
          {loading && <Loader2 size={14} strokeWidth={2.5} className="animate-spin" />}
        </div>
        <button
          type="button"
          onClick={() => exportCsv(bulan, data.list)}
          className="brutal-btn brutal-btn-neutral px-3 py-1.5 text-xs"
          disabled={data.list.length === 0}
          aria-label="Export CSV transaksi bulan ini"
        >
          <Download size={14} strokeWidth={2.5} />
          <span>CSV</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart: Masuk vs Keluar per bulan */}
        <section className="brutal-card p-5">
          <h2 className="font-extrabold text-lg mb-4">Pemasukan vs Pengeluaran</h2>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis
                  dataKey="bulan"
                  stroke="var(--ink)"
                  fontSize={11}
                  fontWeight={700}
                />
                <YAxis
                  stroke="var(--ink)"
                  fontSize={11}
                  fontWeight={700}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(v: number) => formatRupiah(v)}
                  contentStyle={{
                    border: "2px solid var(--ink)",
                    borderRadius: 8,
                    background: "var(--surface)",
                    fontWeight: 600,
                  }}
                />
                <Legend wrapperStyle={{ fontWeight: 700 }} />
                <Bar dataKey="Masuk" fill="var(--status-lunas)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Keluar" fill="var(--status-tertunggak)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Line chart: Saldo kumulatif */}
        <section className="brutal-card p-5">
          <h2 className="font-extrabold text-lg mb-4">Tren Saldo</h2>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis
                  dataKey="bulan"
                  stroke="var(--ink)"
                  fontSize={11}
                  fontWeight={700}
                />
                <YAxis
                  stroke="var(--ink)"
                  fontSize={11}
                  fontWeight={700}
                  tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(v: number) => formatRupiah(v)}
                  contentStyle={{
                    border: "2px solid var(--ink)",
                    borderRadius: 8,
                    background: "var(--surface)",
                    fontWeight: 600,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="Saldo"
                  stroke="var(--accent-primary)"
                  strokeWidth={3}
                  dot={{ fill: "var(--ink)", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Pie chart + form input (admin) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie chart distribusi bulan ini */}
        <section className="brutal-card p-5">
          <h2 className="font-extrabold text-lg mb-4">Distribusi {bulan}</h2>
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={[
                    { name: "Masuk", value: data.summary.masuk },
                    { name: "Keluar", value: data.summary.keluar },
                  ].filter((d) => d.value > 0)}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(e: { name?: string }) => e.name ?? ""}
                  labelLine={false}
                >
                  {PIE_COLORS.map((c, i) => (
                    <Cell key={i} fill={c} stroke="var(--ink)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number) => formatRupiah(v)}
                  contentStyle={{
                    border: "2px solid var(--ink)",
                    borderRadius: 8,
                    background: "var(--surface)",
                    fontWeight: 600,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Form input manual (admin only) */}
        {canEdit && (
          <section className="brutal-card p-5 lg:col-span-2">
            <h2 className="font-extrabold text-lg mb-4">Catat Transaksi Manual</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTipe("MASUK")}
                  className="brutal-btn px-3 py-2.5"
                  style={{
                    background: tipe === "MASUK" ? "var(--status-lunas)" : "var(--surface)",
                    color: tipe === "MASUK" ? "#14532d" : "var(--ink)",
                  }}
                  aria-pressed={tipe === "MASUK"}
                >
                  <Plus size={16} strokeWidth={2.5} />
                  <span>Pemasukan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTipe("KELUAR")}
                  className="brutal-btn px-3 py-2.5"
                  style={{
                    background: tipe === "KELUAR" ? "var(--status-tertunggak)" : "var(--surface)",
                    color: tipe === "KELUAR" ? "#ffffff" : "var(--ink)",
                  }}
                  aria-pressed={tipe === "KELUAR"}
                >
                  <Minus size={16} strokeWidth={2.5} />
                  <span>Pengeluaran</span>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold mb-2">Nominal (Rp)</label>
                  <input
                    type="number"
                    min={1}
                    step={500}
                    value={nominal}
                    onChange={(e) => setNominal(e.target.value)}
                    placeholder="50000"
                    className="brutal-input tabular-nums"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Keterangan</label>
                  <input
                    type="text"
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                    placeholder={tipe === "MASUK" ? "Sumbangan kas" : "Beli air mineral"}
                    className="brutal-input"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={submitLoading}
                className="brutal-btn brutal-btn-primary px-4 py-2.5"
              >
                {submitLoading ? <Loader2 size={16} strokeWidth={2.5} className="animate-spin" /> : <ArrowRight size={16} strokeWidth={2.5} />}
                <span>Catat Transaksi</span>
              </button>
              <p className="text-xs text-[#6b6b6b] font-semibold">
                Periode: {bulan}. Semua transaksi, termasuk pemasukan dari receipt, dapat dihapus oleh Admin.
              </p>
            </form>
          </section>
        )}
      </div>

      {/* List transaksi bulan ini */}
      <section className="brutal-card p-5">
        <h2 className="font-extrabold text-lg mb-4">
          Riwayat Transaksi — {bulan}
          <span className="ml-2 text-xs font-bold text-[#6b6b6b]">
            {data.list.length} transaksi
          </span>
        </h2>
        {data.list.length === 0 ? (
          <p className="text-sm font-semibold text-[#6b6b6b] text-center py-8">
            Belum ada transaksi di periode ini.
          </p>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <div className="flex flex-col gap-2">
              {data.list.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-3 p-3"
                  style={{
                    background: "var(--bg-base)",
                    border: "2px solid var(--ink)",
                    borderRadius: 8,
                  }}
                >
                  <div
                    className="flex items-center justify-center w-9 h-9 shrink-0"
                    style={{
                      background: t.tipe === "MASUK" ? "var(--status-lunas)" : "var(--status-tertunggak)",
                      border: "2px solid var(--ink)",
                      borderRadius: 6,
                    }}
                  >
                    {t.tipe === "MASUK" ? (
                      <Plus size={16} strokeWidth={2.5} color={t.tipe === "MASUK" ? "#14532d" : "#ffffff"} />
                    ) : (
                      <Minus size={16} strokeWidth={2.5} color="#ffffff" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm truncate">{t.keterangan}</div>
                    <div className="text-xs font-semibold text-[#6b6b6b]">
                      {new Date(t.createdAt).toLocaleString("id-ID")}
                      {t.strukId && " · dari struk approved"}
                    </div>
                  </div>
                  <div
                    className="font-extrabold tabular-nums text-sm shrink-0"
                    style={{ color: t.tipe === "MASUK" ? "#14532d" : "#7f1d1d" }}
                  >
                    {t.tipe === "MASUK" ? "+" : "−"} {formatRupiah(t.nominal)}
                  </div>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => handleDelete(t.id)}
                      className="brutal-btn brutal-btn-danger p-1.5 shrink-0"
                      aria-label="Hapus transaksi"
                      title="Hapus"
                    >
                      <Trash2 size={12} strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Confirm dialog for delete transaksi */}
      <ConfirmDialog
        open={deleteTarget !== null}
        title="Hapus Transaksi?"
        description={
          deleteTarget
            ? `"${deleteTarget.keterangan}" (${deleteTarget.tipe} ${formatRupiah(deleteTarget.nominal)}) akan dihapus permanen.`
            : ""
        }
        confirmLabel="Ya, Hapus"
        cancelLabel="Batal"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
        variant="danger"
      />
    </div>
  );
}
