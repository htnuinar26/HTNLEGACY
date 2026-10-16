import { getPeriodeBulan } from "@/lib/status";
import { getPrevPeriodeBulan } from "@/lib/periode";

export const MAX_RECEIPT_MONTHS = 4;

export function getRecentReceiptPeriods(from = getPeriodeBulan()): string[] {
  const periods = [from];
  let current = from;
  for (let index = 1; index < MAX_RECEIPT_MONTHS; index += 1) {
    current = getPrevPeriodeBulan(current);
    periods.push(current);
  }
  return periods;
}

export function isReceiptPeriodAllowed(period: string, from = getPeriodeBulan()): boolean {
  return getRecentReceiptPeriods(from).includes(period);
}
