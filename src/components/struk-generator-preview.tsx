"use client";

type Receipt = { receiptId: string; status: string; amount: number; imageUrl: string };

export function StrukGeneratorPreview({ receipt, memberName }: { receipt: Receipt; memberName: string; onReset: () => void }) {
  return (
    <section className="brutal-card p-5">
      <h2 className="text-lg font-extrabold">Preview Struk</h2>
      <p className="mt-2 text-sm font-semibold">{memberName} · {receipt.status}</p>
      <img src={receipt.imageUrl} alt={"Struk pembayaran " + memberName} className="mt-4 max-w-full" />
    </section>
  );
}
