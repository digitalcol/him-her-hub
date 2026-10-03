export const APP_STATUSES = [
  "NEW",
  "REVIEWING",
  "HOLD",
  "APPROVED",
  "WAITING_FOR_CIRCLE",
  "ASSIGNED",
  "DECLINED",
] as const;
export type AppStatus = (typeof APP_STATUSES)[number];

const NEXT: Record<AppStatus, AppStatus[]> = {
  NEW: ["REVIEWING", "HOLD", "DECLINED"],
  REVIEWING: ["HOLD", "WAITING_FOR_CIRCLE", "DECLINED"],
  HOLD: ["REVIEWING", "WAITING_FOR_CIRCLE", "DECLINED"],
  APPROVED: ["WAITING_FOR_CIRCLE"],
  WAITING_FOR_CIRCLE: ["ASSIGNED"],
  ASSIGNED: [],
  DECLINED: [],
};

export function canTransition(from: AppStatus, to: AppStatus): boolean {
  return NEXT[from].includes(to);
}

export function displayStatus(status: AppStatus, assigned: boolean): string {
  if (status === "WAITING_FOR_CIRCLE" || (status === "APPROVED" && !assigned)) return "WAITING FOR CIRCLE";
  if (status === "ASSIGNED" || (status === "APPROVED" && assigned)) return "IN A CIRCLE";
  return status;
}

export function seatsLeft(capacity: number, taken: number): number {
  return Math.max(0, capacity - taken);
}

export function canAssign(status: AppStatus, assigned: boolean, capacity: number, taken: number): boolean {
  const waiting = status === "APPROVED" || status === "WAITING_FOR_CIRCLE";
  return waiting && !assigned && seatsLeft(capacity, taken) > 0;
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

export type Actor =
  | { role: "anonymous" }
  | { role: "preview" }
  | { role: "admin"; userId: string }
  | { role: "member"; userId: string; circleId: string };

export function canListApplications(actor: Actor): boolean {
  return actor.role === "admin" || actor.role === "preview";
}

export function canReadAdminNotes(actor: Actor): boolean {
  return actor.role === "admin" || actor.role === "preview";
}

export function canReadCircle(actor: Actor, circleId: string): boolean {
  if (actor.role === "admin" || actor.role === "preview") return true;
  return actor.role === "member" && actor.circleId === circleId;
}

export function canMutateOperations(actor: Actor): boolean {
  return actor.role === "admin" || actor.role === "preview";
}

export function memberSafe<T extends Record<string, unknown>>(row: T) {
  const copy: Record<string, unknown> = { ...row };
  for (const key of ["email", "dob", "phone", "notes", "referral", "about"]) delete copy[key];
  return copy;
}
