import { ReceiptText } from "lucide-react";
import { StrukGeneratorForm } from "./struk-generator-form";

export const dynamic = "force-dynamic";

export default function AdminStrukGeneratorPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center" style={{ background: "var(--accent-primary)", border: "3px solid var(--ink)", borderRadius: 10, boxShadow: "4px 4px 0 var(--ink)" }}>
            <ReceiptText size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">Struk Generator</h1>
            <p className="text-sm font-semibold text-[#6b6b6b]">Buat bukti pembayaran manual untuk anggota yang membayar secara tunai.</p>
          </div>
        </div>
      </header>
      <StrukGeneratorForm />
    </div>
  );
}
