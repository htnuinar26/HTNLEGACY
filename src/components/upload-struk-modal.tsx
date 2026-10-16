"use client";

import { useState, useRef } from "react";
import { Loader2, X, KeyRound, Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { StatusBadge } from "./status-badge";
import { useEscapeToClose } from "@/hooks/use-escape-to-close";
import { toast as sonnerToast } from "@/components/ui/sonner";
import { HelpTooltip } from "@/components/help-tooltip";
import { getRecentPeriodeBulan, formatPeriodeLabel } from "@/lib/periode";
import { getPeriodeBulan } from "@/lib/status";

type AnggotaItem = {
  id: string;
  gender: string;
  namaLengkap: string;
  statusTampil: string;
};

export function UploadStrukModal({
  anggota,
  onClose,
  onSuccess,
}: {
  anggota: AnggotaItem;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState<"password" | "upload" | "success">("password");
  const [password, setPassword] = useState("");
  const [pwdErr, setPwdErr] = useState<string | null>(null);
  const [pwdLoading, setPwdLoading] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [periodeBulan, setPeriodeBulan] = useState(getPeriodeBulan());
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Escape to close — hanya saat tidak di step success (post-upload) atau loading
  const canDismiss = step !== "success" && !uploadLoading && !pwdLoading;
  useEscapeToClose(onClose, canDismiss);

  async function verifyPassword() {
    setPwdErr(null);
    setPwdLoading(true);
    try {
      const res = await fetch("/api/auth/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ anggotaId: anggota.id, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        const msg = data.error ?? "Password salah.";
        setPwdErr(msg);
        sonnerToast.error(msg);
        return;
      }
      setStep("upload");
      sonnerToast.success("Password terverifikasi");
    } catch {
      const msg = "Gagal terhubung ke server.";
      setPwdErr(msg);
      sonnerToast.error(msg);
    } finally {
      setPwdLoading(false);
    }
  }

  async function doUpload() {
    if (!file) return;
    setUploadErr(null);
    setUploadLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("anggotaId", anggota.id);
      fd.append("password", password);
      fd.append("periodeBulan", periodeBulan);
      const res = await fetch("/api/struk/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.error ?? "Gagal upload struk.";
        setUploadErr(msg);
        sonnerToast.error(msg);
        return;
      }
      setStep("success");
      sonnerToast.success("Struk berhasil diupload", {
        description: "Menunggu verifikasi admin",
      });
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch {
      const msg = "Gagal terhubung ke server.";
      setUploadErr(msg);
      sonnerToast.error(msg);
    } finally {
      setUploadLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Upload struk untuk ${anggota.namaLengkap}`}
    >
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative brutal-card brutal-animate-in w-full max-w-md p-6">
        <button
          type="button"
          onClick={onClose}
          className="brutal-btn brutal-btn-ghost p-1.5 absolute top-3 right-3"
          aria-label="Tutup"
        >
          <X size={18} strokeWidth={2.5} />
        </button>

        <div className="mb-4">
          <h2 className="text-lg font-extrabold">Upload Struk Pembayaran</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-semibold text-sm">{anggota.namaLengkap}</span>
            <span className="text-xs text-[#6b6b6b]">({anggota.gender})</span>
            <StatusBadge status={anggota.statusTampil as "LUNAS" | "BELUM_LUNAS" | "TERTUNGGAK"} />
          </div>
        </div>

        {/* Step: password */}
        {step === "password" && (
          <div>
            <p className="text-sm font-semibold text-[#6b6b6b] mb-3 flex items-start gap-1.5">
              <span>
                Masukkan password milik <b>{anggota.namaLengkap}</b> untuk verifikasi.
                Re-entry wajib per aksi — bahkan jika Anda sudah login sebagai anggota lain.
              </span>
              <HelpTooltip text="By design: siapa pun bisa upload struk atas nama anggota lain, asal tahu password orang tsb. Ini fitur, bukan bug — memudahkan anggota saling bantu upload struk pembayaran." />
            </p>
            <div className="relative mb-3">
              <KeyRound
                size={18}
                strokeWidth={2.5}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b6b6b]"
                aria-hidden="true"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && password) verifyPassword();
                }}
                placeholder="Password anggota"
                className="brutal-input pl-10"
                autoFocus
              />
            </div>
            {pwdErr && (
              <div
                className="mb-3 px-3 py-2 text-sm font-semibold"
                style={{
                  background: "var(--status-tertunggak-bg)",
                  border: "2px solid var(--status-tertunggak)",
                  borderRadius: 6,
                  color: "#7f1d1d",
                }}
                role="alert"
              >
                {pwdErr}
              </div>
            )}
            <button
              type="button"
              onClick={verifyPassword}
              disabled={!password || pwdLoading}
              className="brutal-btn brutal-btn-primary px-4 py-2.5 w-full"
            >
              {pwdLoading ? (
                <Loader2 size={16} strokeWidth={2.5} className="animate-spin" />
              ) : (
                <KeyRound size={16} strokeWidth={2.5} />
              )}
              <span>Verifikasi Password</span>
            </button>
          </div>
        )}

        {/* Step: upload */}
        {step === "upload" && (
          <div>
            <p className="text-sm font-semibold text-[#6b6b6b] mb-3">
              Password terverifikasi. Pilih periode pembayaran dan upload gambar struk (JPG/PNG/WebP, maks 5MB).
            </p>
            <label htmlFor="periode-struk" className="mb-2 block text-sm font-extrabold">Periode pembayaran</label>
            <select
              id="periode-struk"
              value={periodeBulan}
              onChange={(event) => setPeriodeBulan(event.target.value)}
              className="brutal-select mb-3 w-full"
            >
              {getRecentPeriodeBulan(4, getPeriodeBulan()).map((period) => (
                <option key={period} value={period}>{formatPeriodeLabel(period)}</option>
              ))}
            </select>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(e) => {
                setFile(e.target.files?.[0] ?? null);
                setUploadErr(null);
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="brutal-btn brutal-btn-neutral px-4 py-6 w-full flex-col gap-2"
              style={{
                borderStyle: "dashed",
                background: file ? "var(--status-lunas-bg)" : "var(--bg-base)",
              }}
            >
              {file ? (
                <>
                  <CheckCircle2 size={24} strokeWidth={2.5} color="#14532d" />
                  <span className="text-sm font-bold" style={{ color: "#14532d" }}>
                    {file.name}
                  </span>
                  <span className="text-xs font-semibold text-[#6b6b6b]">
                    Klik untuk ganti file
                  </span>
                </>
              ) : (
                <>
                  <Upload size={24} strokeWidth={2.5} />
                  <span className="text-sm font-bold">Pilih Gambar Struk</span>
                  <span className="text-xs font-semibold text-[#6b6b6b]">
                    JPG / PNG / WebP — maks 5MB
                  </span>
                </>
              )}
            </button>
            {uploadErr && (
              <div
                className="mt-3 px-3 py-2 text-sm font-semibold flex items-start gap-2"
                style={{
                  background: "var(--status-tertunggak-bg)",
                  border: "2px solid var(--status-tertunggak)",
                  borderRadius: 6,
                  color: "#7f1d1d",
                }}
                role="alert"
              >
                <AlertCircle size={16} strokeWidth={2.5} className="shrink-0 mt-0.5" />
                <span>{uploadErr}</span>
              </div>
            )}
            <button
              type="button"
              onClick={doUpload}
              disabled={!file || uploadLoading}
              className="brutal-btn brutal-btn-primary px-4 py-2.5 w-full mt-4"
            >
              {uploadLoading ? (
                <Loader2 size={16} strokeWidth={2.5} className="animate-spin" />
              ) : (
                <Upload size={16} strokeWidth={2.5} />
              )}
              <span>{uploadLoading ? "Mengirim struk..." : "Kirim untuk Review"}</span>
            </button>
          </div>
        )}

        {/* Step: success */}
        {step === "success" && (
          <div className="flex flex-col items-center text-center py-6">
            <div
              className="flex items-center justify-center w-14 h-14 mb-3"
              style={{
                background: "var(--status-lunas)",
                border: "3px solid #14532d",
                borderRadius: 12,
              }}
            >
              <CheckCircle2 size={28} strokeWidth={2.5} color="#14532d" />
            </div>
            <h3 className="font-extrabold text-lg">Struk Terkirim</h3>
            <p className="text-sm font-semibold text-[#6b6b6b] mt-1">
              Status berubah menjadi <b>Pending</b>. Menunggu verifikasi admin.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
