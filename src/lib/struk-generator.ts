import sharp from "sharp";
import { formatRupiah } from "@/lib/status";

type StrukImageInput = {
  receiptNumber: string;
  memberName: string;
  gender: string;
  amount: number;
  date: Date;
  note?: string | null;
};

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function wrapText(value: string, maxLength: number): string[] {
  const words = value.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines.slice(0, 3);
}

export async function generateStrukImage(input: StrukImageInput): Promise<Buffer> {
  const projectName = escapeXml(process.env.NEXT_PUBLIC_INSTANCE_NAME ?? "HTN 26");
  const memberName = escapeXml(input.memberName);
  const gender = escapeXml(input.gender);
  const receiptNumber = escapeXml(input.receiptNumber);
  const amount = escapeXml(formatRupiah(input.amount));
  const date = escapeXml(input.date.toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" }));
  const noteLines = wrapText(input.note ?? "", 48);
  const noteMarkup = noteLines.length
    ? noteLines.map((line, index) => `<text x="90" y="${590 + index * 25}" class="body">${escapeXml(line)}</text>`).join("")
    : `<text x="90" y="590" class="muted">Tidak ada catatan</text>`;

  const svg = `
    <svg width="900" height="760" viewBox="0 0 900 760" xmlns="http://www.w3.org/2000/svg">
      <style>
        .ink { fill: #111111; }
        .body { font: 600 25px 'Plus Jakarta Sans', Arial, sans-serif; fill: #111111; }
        .muted { font: 500 23px 'Plus Jakarta Sans', Arial, sans-serif; fill: #6b6b6b; }
        .label { font: 700 21px 'Plus Jakarta Sans', Arial, sans-serif; fill: #6b6b6b; }
        .value { font: 800 27px 'Plus Jakarta Sans', Arial, sans-serif; fill: #111111; }
        .title { font: 900 42px 'Plus Jakarta Sans', Arial, sans-serif; fill: #111111; }
        .amount { font: 900 48px 'Plus Jakarta Sans', Arial, sans-serif; fill: #111111; }
      </style>
      <rect width="900" height="760" fill="#faf9f6"/>
      <rect x="28" y="28" width="844" height="704" rx="18" fill="#ffffff" stroke="#111111" stroke-width="6"/>
      <rect x="28" y="28" width="844" height="115" rx="15" fill="#ffc700" stroke="#111111" stroke-width="6"/>
      <text x="65" y="78" class="title">${projectName}</text>
      <text x="65" y="115" class="body">Struk Pembayaran Manual</text>
      <text x="65" y="190" class="label">STATUS</text>
      <rect x="65" y="208" width="165" height="42" rx="21" fill="#d9ffe6" stroke="#111111" stroke-width="3"/>
      <text x="92" y="237" class="body">APPROVED</text>
      <text x="65" y="302" class="label">NAMA ANGGOTA</text>
      <text x="65" y="337" class="value">${memberName}</text>
      <text x="65" y="388" class="label">GENDER</text>
      <text x="65" y="423" class="value">${gender}</text>
      <text x="485" y="302" class="label">NOMINAL</text>
      <text x="485" y="360" class="amount">${amount}</text>
      <text x="485" y="412" class="label">TANGGAL</text>
      <text x="485" y="447" class="body">${date}</text>
      <line x1="65" y1="480" x2="835" y2="480" stroke="#111111" stroke-width="3"/>
      <text x="65" y="530" class="label">CATATAN</text>
      ${noteMarkup}
      <text x="65" y="675" class="muted">No. Struk: ${receiptNumber}</text>
      <text x="835" y="675" text-anchor="end" class="muted">Dibuat oleh Admin</text>
    </svg>`;

  return sharp(Buffer.from(svg)).png().toBuffer();
}
