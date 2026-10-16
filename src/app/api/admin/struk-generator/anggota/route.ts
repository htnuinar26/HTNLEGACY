import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { getPeriodeBulan } from "@/lib/status";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const periode = getPeriodeBulan();
  const activeReceipts = await db.struk.findMany({
    where: {
      periodeBulan: periode,
      statusStruk: { in: ["PENDING", "APPROVED"] },
    },
    select: { anggotaId: true },
  });
  const activeIds = activeReceipts.map((receipt) => receipt.anggotaId);

  const anggota = await db.anggota.findMany({
    where: { id: { notIn: activeIds } },
    select: { id: true, namaLengkap: true, gender: true, status: true },
    orderBy: [{ gender: "asc" }, { namaLengkap: "asc" }],
  });

  return NextResponse.json({ periode, anggota });
}
