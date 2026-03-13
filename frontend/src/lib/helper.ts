import type { PaymentMethod } from "@/types/transaction";

// ── Currency ──────────────────────────────────────────────────────────────────

/** Format cents as USD. Pass `asDollars: true` for already-dollar values. */
export function formatCurrency(value: number, asDollars = false): string {
  const amount = asDollars ? value : value / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

// ── Dates ─────────────────────────────────────────────────────────────────────

export function formatDate(dateStr: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr));
}

export function toISODate(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

// ── Payment Method ────────────────────────────────────────────────────────────

export function formatPaymentMethod(method: PaymentMethod): string {
  const map: Record<PaymentMethod, string> = {
    CARD: "Card",
    BANK_TRANSFER: "Bank Transfer",
    MOBILE_PAYMENT: "Mobile Payment",
    AUTO_DEBIT: "Auto Debit",
    CASH: "Cash",
    OTHER: "Other",
  };
  return map[method] ?? method;
}

// ── CSV ───────────────────────────────────────────────────────────────────────

export function parseCSV(text: string): string[][] {
  return text
    .trim()
    .split("\n")
    .map((row) =>
      row.split(",").map((cell) => cell.trim().replace(/^"|"$/g, "")),
    );
}

// ── Misc ──────────────────────────────────────────────────────────────────────

export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
