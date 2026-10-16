"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronDown, Loader2, RefreshCw, Search, X } from "lucide-react";
import { StrukGeneratorPreview } from "@/components/struk-generator-preview";

type Member = { id: string; namaLengkap: string; gender: string; status: string };
type GeneratedReceipt = { receiptId: string; status: string; amount: number; imageUrl: string };

function formatAmount(value: string): string {
  if (!value) return "";
  const amount = Number(value);
  return Number.isSafeInteger(amount) ? new Intl.NumberFormat("id-ID").format(amount) : value;
}

export function StrukGeneratorForm() {
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [nominal, setNominal] = useState("");
  const [catatan, setCatatan] = useState("");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<GeneratedReceipt | null>(null);
  const [submittedMemberName, setSubmittedMemberName] = useState("");

  const selected = members.find((member) => member.id === selectedId);
  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return members;
    return members.filter((member) => `${member.namaLengkap} ${member.gender}`.toLowerCase().includes(query));
  }, [members, search]);

  async function loadMembers() {
    setLoadingMembers(true);
    setError("");
    try {
      const response = await fetch("/api/admin/struk-generator/anggota");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Gagal memuat anggota.");
      setMembers(data.anggota ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gagal memuat anggota.");
    } finally {
      setLoadingMembers(false);
    }
  }

  useEffect(() => { void loadMembers(); }, []);

  function resetForm() {
    setSelectedId("");
    setNominal("");
    setCatatan("");
    setSearch("");
    setReceipt(null);
    setSubmittedMemberName("");
    setError("");
    void loadMembers();
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!selectedId) return setError("Pilih anggota terlebih dahulu.");
    if (!/^[1-9]\d*$/.test(nominal)) return setError("Nominal harus berupa angka penuh tanpa titik atau koma.");
    setSubmitting(true);
    try {
      const response = await fetch("/api/admin/struk-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anggotaId: selectedId, nominal, catatan }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Gagal membuat struk.");
      setSubmittedMemberName(selected?.namaLengkap ?? "Anggota");
      setReceipt(data.data);
      setMembers((current) => current.filter((member) => member.id !== selectedId));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Gagal membuat struk.");
    } finally {
      setSubmitting(false);
    }
  }

  if (receipt) {
    return <StrukGeneratorPreview receipt={receipt} memberName={submittedMemberName} onReset={resetForm} />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.7fr)]">
      <form onSubmit={submit} className="brutal-card p-5 md:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div><h2 className="text-lg font-extrabold">Data Pembayaran</h2><p className="mt-1 text-sm font-semibold text-[#6b6b6b]">Receipt langsung disimpan sebagai pembayaran approved.</p></div>
          <button type="button" onClick={() => void loadMembers()} className="brutal-btn brutal-btn-neutral p-2" title="Muat ulang anggota"><RefreshCw size={17} /></button>
        </div>

        <label className="mb-2 block text-sm font-extrabold">Nama lengkap anggota</label>
        <div className="relative mb-5">
          <button type="button" onClick={() => setOpen((value) => !value)} className="brutal-input flex w-full items-center justify-between text-left" aria-expanded={open}>
            <span className={selected ? "font-bold" : "text-[#777]"}>{selected ? `${selected.namaLengkap} · ${selected.gender}` : loadingMembers ? "Memuat anggota..." : "Pilih anggota"}</span>
            <ChevronDown size={18} />
          </button>
          {open && <div className="absolute z-20 mt-2 w-full brutal-card overflow-hidden p-2">
            <div className="flex items-center gap-2 border-2 border-[var(--ink)] bg-white px-3 py-2"><Search size={16} /><input autoFocus value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama anggota..." className="w-full bg-transparent text-sm font-semibold outline-none" /></div>
            <div className="mt-2 max-h-64 overflow-y-auto">
              {filteredMembers.length === 0 ? <p className="p-3 text-sm font-semibold text-[#777]">Tidak ada anggota tersedia.</p> : filteredMembers.map((member) => <button type="button" key={member.id} onClick={() => { setSelectedId(member.id); setOpen(false); setSearch(""); }} className="flex w-full items-center justify-between border-b border-black/10 px-3 py-3 text-left last:border-0 hover:bg-[var(--status-pending-bg)]"><span className="font-bold">{member.namaLengkap}</span><span className="text-xs font-extrabold text-[#777]">{member.gender}</span></button>)}
            </div>
          </div>}
        </div>

        <label htmlFor="nominal" className="mb-2 block text-sm font-extrabold">Nominal pembayaran</label>
        <input id="nominal" inputMode="numeric" value={nominal} onChange={(event) => setNominal(event.target.value.replace(/\D/g, ""))} placeholder="Contoh: 170000" className="brutal-input w-full" />
        <p className="mt-2 text-xs font-semibold text-[#6b6b6b]">Masukkan angka penuh tanpa titik atau koma. Preview: {formatAmount(nominal) ? `Rp ${formatAmount(nominal)}` : "-"}</p>

        <label htmlFor="catatan" className="mb-2 mt-5 block text-sm font-extrabold">Catatan <span className="font-semibold text-[#777]">(opsional)</span></label>
        <textarea id="catatan" value={catatan} onChange={(event) => setCatatan(event.target.value)} maxLength={240} rows={4} placeholder="Contoh: Pembayaran cash" className="brutal-input w-full resize-y" />
        <div className="mt-1 text-right text-xs font-bold text-[#777]">{catatan.length}/240</div>

        {error && <div className="mt-4 flex items-start gap-2 border-2 border-[var(--accent-danger)] bg-[var(--status-tertunggak-bg)] p-3 text-sm font-bold text-[#7f1d1d]"><X size={17} className="mt-0.5 shrink-0" />{error}</div>}
        <button type="submit" disabled={submitting || loadingMembers || !members.length} className="brutal-btn mt-6 flex w-full justify-center bg-[var(--accent-primary)] px-4 py-3 font-extrabold disabled:cursor-not-allowed disabled:opacity-50">{submitting ? <><Loader2 size={18} className="animate-spin" /> Menyimpan...</> : <><CheckCircle2 size={18} /> Generate &amp; Simpan</>}</button>
      </form>

      <aside className="brutal-card h-fit bg-[var(--status-pending-bg)] p-5">
        <h2 className="text-lg font-extrabold">Aturan generator</h2>
        <ul className="mt-4 space-y-3 text-sm font-semibold"><li>• Hanya anggota tanpa receipt aktif yang tersedia.</li><li>• Receipt manual langsung berstatus Approved.</li><li>• Nominal dan transaksi dicatat dalam satu proses database.</li><li>• File struk dapat di-preview dan diunduh setelah berhasil.</li></ul>
        {!loadingMembers && !members.length && <p className="mt-5 border-2 border-[var(--ink)] bg-white p-3 text-sm font-extrabold">Semua anggota sudah memiliki pembayaran aktif untuk periode ini.</p>}
      </aside>
    </div>
  );
}
