import { eq } from "drizzle-orm";
import { db } from "../db";
import { user } from "../db/schema/user.schema";
import { transaction } from "../db/schema/transaction.schema";
import { count } from "drizzle-orm";

export const FREE_PLAN_LIMITS = {
  MAX_TRANSACTIONS: 30,
  ANALYTICS_DAYS: 7,
  BULK_IMPORT: false,
} as const;

/**
 * Check if a user is on the Pro plan.
 * Source of truth is the `plan` column on the user row in the database.
 */
export async function isUserSubscribedService(userId: string): Promise<boolean> {
  const [result] = await db
    .select({ plan: user.plan })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  return result?.plan === "pro";
}

/**
 * Count total transactions for a user.
 */
export async function getUserTransactionCountService(userId: string): Promise<number> {
  const [result] = await db
    .select({ total: count() })
    .from(transaction)
    .where(eq(transaction.userId, userId));
  return result?.total ?? 0;
}

/**
 * Get full subscription status for the frontend Billing tab.
 * Uses the user.plan column — no Polar API call needed at runtime.
 */
export async function getSubscriptionStatusService(userId: string) {
  const [result] = await db
    .select({ plan: user.plan })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  const plan = result?.plan ?? "free";
  const isPro = plan === "pro";

  return {
    isSubscribed: isPro,
    plan: isPro ? "pro" : "free",
    limits: isPro
      ? {
          maxTransactions: null, // unlimited
          analyticsPresets: ["1W", "1M", "3M", "6M", "1Y", "ALL"],
          bulkImport: true,
        }
      : {
          maxTransactions: FREE_PLAN_LIMITS.MAX_TRANSACTIONS,
          analyticsPresets: ["1W"],
          bulkImport: false,
        },
  };
}
