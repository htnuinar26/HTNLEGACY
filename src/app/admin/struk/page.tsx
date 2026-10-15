import { db } from "@/lib/db";
import { getPeriodeBulan } from "@/lib/status";
import { StrukListClient } from "./struk-list-client";
import { Inbox } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { createStorageSignedUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function AdminStrukPage() {
  const periode = getPeriodeBulan();
  const strukList = await db.struk.findMany({
    where: { periodeBulan: periode },
    include: {
      anggota: {
        select: { id: true, namaLengkap: true, gender: true, noHpWa: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const pending = strukList.filter((s) => s.statusStruk === "PENDING");
  const decided = strukList.filter((s) => s.statusStruk !== "PENDING");

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">Verifikasi Struk</h1>
        <p className="text-sm font-semibold text-[#6b6b6b]">
          Periode {periode} — {pending.length} pending, {decided.length} sudah diproses
        </p>
      </header>

      {strukList.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Belum ada struk"
          description="Anggota yang upload struk pembayaran akan muncul di sini untuk diverifikasi."
        />
      ) : (
        <StrukListClient
          strukList={await Promise.all(strukList.map(async (s) => ({
            ...s,
            imageUrl: await createStorageSignedUrl(s.imageUrl),
            createdAt: s.createdAt.toISOString(),
            verifiedAt: s.verifiedAt?.toISOString() ?? null,
          })))}
          periode={periode}
        />
      )}
    </div>
  );
}
