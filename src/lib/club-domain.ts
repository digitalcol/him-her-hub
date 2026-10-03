export const APP_STATUSES = ["NEW", "REVIEWING", "HOLD", "APPROVED", "DECLINED"] as const;
export type AppStatus = (typeof APP_STATUSES)[number];

const NEXT: Record<AppStatus, AppStatus[]> = {
  NEW: ["REVIEWING", "HOLD", "DECLINED"],
  REVIEWING: ["HOLD", "APPROVED", "DECLINED"],
  HOLD: ["REVIEWING", "APPROVED", "DECLINED"],
  APPROVED: [],
  DECLINED: [],
};

export function canTransition(from: AppStatus, to: AppStatus): boolean {
  return NEXT[from].includes(to);
}

export function displayStatus(status: AppStatus, assigned: boolean): string {
  if (status === "APPROVED" && !assigned) return "WAITING FOR CIRCLE";
  if (status === "APPROVED" && assigned) return "IN A CIRCLE";
  return status;
}

export function seatsLeft(capacity: number, taken: number): number {
  return Math.max(0, capacity - taken);
}

export function canAssign(status: AppStatus, assigned: boolean, capacity: number, taken: number): boolean {
  return status === "APPROVED" && !assigned && seatsLeft(capacity, taken) > 0;
}

export type LedgerKind = "CONTRIBUTION" | "EXPENSE" | "REFUND" | "ADJUSTMENT";

export function signedAmount(kind: LedgerKind, amount: number): number {
  const value = Math.abs(amount);
  if (kind === "EXPENSE" || kind === "REFUND") return -value;
  if (kind === "ADJUSTMENT") return amount;
  return value;
}

export function balance(rows: { kind: LedgerKind; amount: number }[]): number {
  return rows.reduce((sum, row) => sum + signedAmount(row.kind, row.amount), 0);
}

export function bestDate(marks: Record<string, boolean[]>): string | null {
  let winner: string | null = null;
  let best = -1;
  for (const [date, votes] of Object.entries(marks)) {
    const count = votes.filter(Boolean).length;
    if (count > best) {
      best = count;
      winner = date;
    }
  }
  return winner;
}

export function normalizeInstagram(value: string): string {
  return value.trim().replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, "");
}

export function normalizePhone(value: string): string {
  return value.replace(/[^\d+]/g, "");
}
