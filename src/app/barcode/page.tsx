import { AppShell } from "@/components/app-shell";
import { getSettingsForDisplay } from "@/lib/settings";
import { QrCode, Building2, CreditCard, Phone, User } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BarcodePage() {
  const s = await getSettingsForDisplay();

  const panitia = [
    { label: "Bendahara", value: s.kontakBendahara },
    { label: "Sekretaris", value: s.kontakSekretaris },
    { label: "Kompting", value: s.kontakKompting },
  ].filter((p) => p.value);

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <header>
          <h1 className="text-2xl font-extrabold tracking-tight">Barcode Pembayaran</h1>
          <p className="text-sm font-semibold text-[#6b6b6b]">
            Scan barcode untuk transfer iuran bulanan
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Barcode */}
          <section className="brutal-card p-5">
            <h2 className="font-extrabold text-lg mb-4 flex items-center gap-2">
              <QrCode size={20} strokeWidth={2.5} />
              Barcode / QRIS
            </h2>
            <div
              className="w-full aspect-square max-w-sm mx-auto flex items-center justify-center bg-[var(--bg-base)]"
              style={{
                border: "3px solid var(--ink)",
                borderRadius: 10,
              }}
            >
              {s.barcodeImageUrl ? (
                <img
                  src={s.barcodeImageUrl}
                  alt="Barcode pembayaran iuran"
                  className="w-full h-full object-contain p-4"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-[#9a9a9a]">
                  <QrCode size={64} strokeWidth={1.5} />
                  <span className="text-xs font-semibold">
                    Barcode belum diunggah admin
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs text-[#6b6b6b] font-semibold mt-3 text-center">
              Barcode statis — berlaku sama untuk semua anggota.
            </p>
          </section>

          {/* Rekening & kontak */}
          <div className="flex flex-col gap-6">
            {/* Rekening */}
            <section className="brutal-card p-5">
              <h2 className="font-extrabold text-lg mb-4 flex items-center gap-2">
                <Building2 size={20} strokeWidth={2.5} />
                Rekening Penampung
              </h2>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-xs font-bold text-[#6b6b6b] uppercase tracking-wide">
                    Bank
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Building2 size={16} strokeWidth={2.5} className="text-[#6b6b6b]" />
                    <span className="font-bold">
                      {s.namaBank || "Belum diset"}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#6b6b6b] uppercase tracking-wide">
                    Nomor Rekening
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <CreditCard size={16} strokeWidth={2.5} className="text-[#6b6b6b]" />
                    <span className="font-bold font-mono tabular-nums">
                      {s.nomorRekening || "Belum diset"}
                    </span>
                  </div>
                </div>
                <div
                  className="mt-2 p-3 text-sm font-semibold"
                  style={{
                    background: "var(--status-pending-bg)",
                    border: "2px solid var(--status-pending)",
                    borderRadius: 8,
                    color: "#78350f",
                  }}
                >
                  Nominal iuran: Rp {s.nominalIuran.toLocaleString("id-ID")}
                </div>
              </div>
            </section>

            {/* Kontak panitia */}
            <section className="brutal-card p-5">
              <h2 className="font-extrabold text-lg mb-4 flex items-center gap-2">
                <Phone size={20} strokeWidth={2.5} />
                Kontak Panitia
              </h2>
              {panitia.length === 0 ? (
                <p className="text-sm font-semibold text-[#6b6b6b]">
                  Kontak panitia belum diset oleh admin.
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {panitia.map((p) => (
                    <div
                      key={p.label}
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
                          background: "var(--accent-primary)",
                          border: "2px solid var(--ink)",
                          borderRadius: 6,
                        }}
                      >
                        <User size={18} strokeWidth={2.5} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#6b6b6b] uppercase tracking-wide">
                          {p.label}
                        </div>
                        <div className="font-bold text-sm break-words">
                          {p.value}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
