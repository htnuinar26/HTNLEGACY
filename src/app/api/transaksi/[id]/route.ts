// DELETE /api/transaksi/[id] — admin only, hapus transaksi manual
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { auditLog } from "@/lib/audit";
import { removeStorageObjects } from "@/lib/storage";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const t = await db.transaksi.findUnique({ where: { id } });
    if (!t) {
      return NextResponse.json({ error: "Transaksi tidak ditemukan." }, { status: 404 });
    }
    const linkedReceipt = t.strukId
      ? await db.struk.findUnique({ where: { id: t.strukId }, select: { id: true, imageUrl: true, anggotaId: true, periodeBulan: true } })
      : null;
    await db.$transaction(async (tx) => {
      await tx.transaksi.delete({ where: { id } });
      if (linkedReceipt) {
        await tx.struk.update({
          where: { id: linkedReceipt.id },
          data: {
            statusStruk: "REJECTED",
            ditolakAlasan: "Transaksi kas dihapus oleh admin.",
            verifiedAt: new Date(),
          },
        });
        if (linkedReceipt.periodeBulan === new Date().toISOString().slice(0, 7)) {
          const remainingApproved = await tx.struk.count({
            where: { anggotaId: linkedReceipt.anggotaId, periodeBulan: linkedReceipt.periodeBulan, statusStruk: "APPROVED" },
          });
          if (remainingApproved === 0) {
            await tx.anggota.update({ where: { id: linkedReceipt.anggotaId }, data: { status: "BELUM_LUNAS" } });
          }
        }
      }
    });
    if (linkedReceipt) await removeStorageObjects([linkedReceipt.imageUrl]).catch(() => undefined);
    await auditLog("DELETE_TRANSAKSI", {
      targetId: id,
      targetLabel: t.keterangan,
      detail: `${t.tipe} Rp ${t.nominal.toLocaleString("id-ID")} (${t.periodeBulan})`,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[transaksi DELETE] error", e);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
