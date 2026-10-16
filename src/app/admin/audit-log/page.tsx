import { db } from "@/lib/db";
import { AuditLogList } from "./audit-log-list";

export const dynamic = "force-dynamic";

export default async function AdminAuditLogPage() {
  const logs = await db.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  // Statistik per aksi
  const allLogs = await db.auditLog.findMany({
    select: { aksi: true },
  });
  const targetIds = logs.map((log) => log.targetId).filter((id): id is string => Boolean(id));
  const relatedTransactions = await db.transaksi.findMany({
    where: {
      OR: [
        { id: { in: targetIds } },
        { strukId: { in: targetIds } },
      ],
    },
    select: { id: true, strukId: true },
  });
  const transactionByReference = new Map<string, string>();
  for (const transaction of relatedTransactions) {
    transactionByReference.set(transaction.id, transaction.id);
    if (transaction.strukId) transactionByReference.set(transaction.strukId, transaction.id);
  }
  const statMap = new Map<string, number>();
  for (const l of allLogs) {
    statMap.set(l.aksi, (statMap.get(l.aksi) ?? 0) + 1);
  }
  const stats = Array.from(statMap.entries())
    .map(([aksi, count]) => ({ aksi, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight">Audit Log</h1>
        <p className="text-sm font-semibold text-[#6b6b6b]">
          Riwayat aksi admin — {allLogs.length} total entri
        </p>
      </header>

      {stats.length > 0 && (
        <section className="brutal-card p-5">
          <h2 className="font-extrabold text-lg mb-3">Distribusi Aksi</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {stats.map((s) => (
              <div
                key={s.aksi}
                className="p-2 text-center"
                style={{ background: "var(--bg-base)", border: "2px solid var(--ink)", borderRadius: 6 }}
              >
                <div className="text-lg font-extrabold tabular-nums">{s.count}</div>
                <div className="text-[10px] font-bold text-[#6b6b6b] mt-0.5">{s.aksi}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      <AuditLogList
        initialLogs={logs.map((log) => ({
          ...log,
          createdAt: log.createdAt.toISOString(),
          transactionId: log.targetId ? transactionByReference.get(log.targetId) ?? null : null,
        }))}
      />
    </div>
  );
}
