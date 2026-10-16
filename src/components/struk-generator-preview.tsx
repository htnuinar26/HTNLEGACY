"use client";

import { Download, ExternalLink, Printer, RotateCcw, Share2 } from "lucide-react";

type Receipt = { receiptId: string; status: string; amount: number; imageUrl: string };

export function StrukGeneratorPreview({ receipt, memberName, onReset }: { receipt: Receipt; memberName: string; onReset: () => void }) {
  async function share() {
    if (navigator.share) await navigator.share({ title: `Struk ${memberName}`, text: "Bukti pembayaran", url: receipt.imageUrl });
    else await navigator.clipboard.writeText(receipt.imageUrl);
  }

  return <section className="brutal-card p-5 md:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-extrabold uppercase tracking-wider text-[#6b6b6b]">Berhasil dibuat</p><h2 className="mt-1 text-2xl font-extrabold">Struk {memberName}</h2><p className="mt-1 text-sm font-semibold text-[#6b6b6b]">Receipt #{receipt.receiptId} · {receipt.status}</p></div><div className="border-2 border-[var(--ink)] bg-[var(--status-lunas-bg)] px-3 py-2 text-sm font-extrabold">Rp {new Intl.NumberFormat("id-ID").format(receipt.amount)}</div></div><div className="mt-6 flex justify-center bg-[var(--bg-base)] p-3" style={{ border: "3px solid var(--ink)", borderRadius: 10 }}><img src={receipt.imageUrl} alt={`Struk pembayaran ${memberName}`} className="max-h-[620px] max-w-full object-contain" /></div><div className="mt-5 flex flex-wrap gap-3"><a href={receipt.imageUrl} download={`struk-${memberName.replace(/\s+/g, "-").toLowerCase()}.png`} className="brutal-btn brutal-btn-neutral px-4 py-2.5"><Download size={17} /> Download</a><button type="button" onClick={() => window.print()} className="brutal-btn brutal-btn-neutral px-4 py-2.5"><Printer size={17} /> Print</button><button type="button" onClick={() => void share()} className="brutal-btn brutal-btn-neutral px-4 py-2.5"><Share2 size={17} /> Share</button><a href={receipt.imageUrl} target="_blank" rel="noreferrer" className="brutal-btn brutal-btn-neutral px-4 py-2.5"><ExternalLink size={17} /> Buka</a><button type="button" onClick={onReset} className="brutal-btn ml-auto bg-[var(--accent-primary)] px-4 py-2.5"><RotateCcw size={17} /> Buat Lagi</button></div></section>;
}
