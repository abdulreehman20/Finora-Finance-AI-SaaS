/**
 * Finora AI — Database Seed Script
 *
 * Seeds:
 *  - Transactions: 120 records with varied types, categories, payment methods,
 *    amounts, dates, and recurring patterns
 *  - Reports: 6 historical monthly report records
 *  - ReportSetting: 1 per-user setting record (enabled, day=1)
 *
 * Usage:
 *   bun run src/seed.ts
 *   // or
 *   npx tsx src/seed.ts
 *
 * The script auto-detects the first user in the `user` table and seeds for
 * that user. It safely skips inserting records that already exist (ON CONFLICT).
 */

import { config } from "dotenv";
config({ path: ".env" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

// Schema imports
import { user } from "../src/db/schema/user.schema.js";
import { transaction } from "../src/db/schema/transaction.schema.js";
import { report } from "../src/db/schema/report.schema.js";
import { reportSetting } from "../src/db/schema/report.setting.schema.js";
import { subscription } from "../src/db/schema/subscription.schema.js";

// ─────────────────────────────────────────────────────────────────────────────
// DB Connection
// ─────────────────────────────────────────────────────────────────────────────

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function uuid() {
  return randomUUID();
}

/** Returns a random integer between min and max (inclusive) */
function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Returns a random item from an array */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Returns a Date that is `daysAgo` days before today */
function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(rand(8, 22), rand(0, 59), rand(0, 59));
  return d;
}

// ─────────────────────────────────────────────────────────────────────────────
// Seed Data Templates
// ─────────────────────────────────────────────────────────────────────────────

type TxType = "INCOME" | "EXPENSE";
type PayMethod = "CARD" | "BANK_TRANSFER" | "MOBILE_PAYMENT" | "AUTO_DEBIT" | "CASH" | "OTHER";
type RecurInterval = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
type TxStatus = "PENDING" | "COMPLETED" | "FAILED";

interface TxTemplate {
  title: string;
  type: TxType;
  category: string;
  minAmount: number; // in dollars
  maxAmount: number;
  paymentMethods: PayMethod[];
  recurringChance: number; // 0.0–1.0
  allowedIntervals?: RecurInterval[];
  status?: TxStatus;
}

const templates: TxTemplate[] = [
  // ── INCOME ──────────────────────────────────────────────────────
  {
    title: "Client Payment",
    type: "INCOME",
    category: "Freelance",
    minAmount: 150,
    maxAmount: 3500,
    paymentMethods: ["BANK_TRANSFER", "OTHER"],
    recurringChance: 0.3,
    allowedIntervals: ["MONTHLY"],
  },
  {
    title: "Project Bonus",
    type: "INCOME",
    category: "Freelance",
    minAmount: 500,
    maxAmount: 4000,
    paymentMethods: ["BANK_TRANSFER"],
    recurringChance: 0.0,
  },
  {
    title: "Consulting Fee",
    type: "INCOME",
    category: "Freelance",
    minAmount: 800,
    maxAmount: 2500,
    paymentMethods: ["BANK_TRANSFER", "MOBILE_PAYMENT"],
    recurringChance: 0.2,
    allowedIntervals: ["MONTHLY"],
  },
  {
    title: "Salary Payment",
    type: "INCOME",
    category: "Salary",
    minAmount: 2500,
    maxAmount: 6000,
    paymentMethods: ["BANK_TRANSFER"],
    recurringChance: 1.0,
    allowedIntervals: ["MONTHLY"],
  },
  {
    title: "Dividend Income",
    type: "INCOME",
    category: "Investments",
    minAmount: 50,
    maxAmount: 800,
    paymentMethods: ["BANK_TRANSFER"],
    recurringChance: 0.6,
    allowedIntervals: ["MONTHLY", "YEARLY"],
  },
  {
    title: "Stock Sale",
    type: "INCOME",
    category: "Investments",
    minAmount: 200,
    maxAmount: 5000,
    paymentMethods: ["BANK_TRANSFER"],
    recurringChance: 0.0,
  },
  {
    title: "Rental Income",
    type: "INCOME",
    category: "Real Estate",
    minAmount: 800,
    maxAmount: 2200,
    paymentMethods: ["BANK_TRANSFER", "CASH"],
    recurringChance: 1.0,
    allowedIntervals: ["MONTHLY"],
  },
  {
    title: "Misc Income",
    type: "INCOME",
    category: "Other",
    minAmount: 20,
    maxAmount: 500,
    paymentMethods: ["CASH", "MOBILE_PAYMENT", "OTHER"],
    recurringChance: 0.0,
  },
  {
    title: "YouTube Revenue",
    type: "INCOME",
    category: "Content Creation",
    minAmount: 100,
    maxAmount: 1200,
    paymentMethods: ["BANK_TRANSFER"],
    recurringChance: 0.8,
    allowedIntervals: ["MONTHLY"],
  },
  {
    title: "Course Sales",
    type: "INCOME",
    category: "Content Creation",
    minAmount: 200,
    maxAmount: 3000,
    paymentMethods: ["BANK_TRANSFER", "OTHER"],
    recurringChance: 0.0,
  },
  {
    title: "Tax Refund",
    type: "INCOME",
    category: "Government",
    minAmount: 300,
    maxAmount: 2000,
    paymentMethods: ["BANK_TRANSFER"],
    recurringChance: 0.0,
  },
  {
    title: "Affiliate Commission",
    type: "INCOME",
    category: "Side Business",
    minAmount: 30,
    maxAmount: 700,
    paymentMethods: ["BANK_TRANSFER", "OTHER"],
    recurringChance: 0.4,
    allowedIntervals: ["MONTHLY"],
  },
  {
    title: "Gift Received",
    type: "INCOME",
    category: "Personal",
    minAmount: 20,
    maxAmount: 500,
    paymentMethods: ["CASH", "MOBILE_PAYMENT"],
    recurringChance: 0.0,
  },

  // ── EXPENSE ─────────────────────────────────────────────────────
  {
    title: "Grocery Shopping",
    type: "EXPENSE",
    category: "Shopping",
    minAmount: 40,
    maxAmount: 300,
    paymentMethods: ["CARD", "CASH"],
    recurringChance: 0.8,
    allowedIntervals: ["WEEKLY"],
  },
  {
    title: "Internet Bill",
    type: "EXPENSE",
    category: "Utilities",
    minAmount: 40,
    maxAmount: 120,
    paymentMethods: ["AUTO_DEBIT", "BANK_TRANSFER"],
    recurringChance: 1.0,
    allowedIntervals: ["MONTHLY"],
  },
  {
    title: "Electricity Bill",
    type: "EXPENSE",
    category: "Utilities",
    minAmount: 60,
    maxAmount: 250,
    paymentMethods: ["AUTO_DEBIT", "BANK_TRANSFER"],
    recurringChance: 1.0,
    allowedIntervals: ["MONTHLY"],
  },
  {
    title: "Netflix Subscription",
    type: "EXPENSE",
    category: "Entertainment",
    minAmount: 15,
    maxAmount: 22,
    paymentMethods: ["CARD", "AUTO_DEBIT"],
    recurringChance: 1.0,
    allowedIntervals: ["MONTHLY"],
  },
  {
    title: "Spotify Premium",
    type: "EXPENSE",
    category: "Entertainment",
    minAmount: 10,
    maxAmount: 16,
    paymentMethods: ["CARD", "AUTO_DEBIT"],
    recurringChance: 1.0,
    allowedIntervals: ["MONTHLY"],
  },
  {
    title: "Gym Membership",
    type: "EXPENSE",
    category: "Health & Fitness",
    minAmount: 30,
    maxAmount: 100,
    paymentMethods: ["CARD", "AUTO_DEBIT"],
    recurringChance: 1.0,
    allowedIntervals: ["MONTHLY"],
  },
  {
    title: "Lunch",
    type: "EXPENSE",
    category: "Meals",
    minAmount: 8,
    maxAmount: 80,
    paymentMethods: ["CARD", "CASH", "MOBILE_PAYMENT"],
    recurringChance: 0.5,
    allowedIntervals: ["WEEKLY", "DAILY"],
  },
  {
    title: "Dinner Out",
    type: "EXPENSE",
    category: "Meals",
    minAmount: 20,
    maxAmount: 150,
    paymentMethods: ["CARD", "CASH"],
    recurringChance: 0.2,
    allowedIntervals: ["WEEKLY"],
  },
  {
    title: "Coffee",
    type: "EXPENSE",
    category: "Meals",
    minAmount: 3,
    maxAmount: 15,
    paymentMethods: ["CARD", "CASH", "MOBILE_PAYMENT"],
    recurringChance: 0.0,
  },
  {
    title: "Office Rent",
    type: "EXPENSE",
    category: "Rent",
    minAmount: 500,
    maxAmount: 2000,
    paymentMethods: ["BANK_TRANSFER"],
    recurringChance: 1.0,
    allowedIntervals: ["MONTHLY"],
  },
  {
    title: "Home Rent",
    type: "EXPENSE",
    category: "Rent",
    minAmount: 800,
    maxAmount: 3000,
    paymentMethods: ["BANK_TRANSFER"],
    recurringChance: 1.0,
    allowedIntervals: ["MONTHLY"],
  },
  {
    title: "Gas Station",
    type: "EXPENSE",
    category: "Transport",
    minAmount: 20,
    maxAmount: 100,
    paymentMethods: ["CARD", "CASH"],
    recurringChance: 0.5,
    allowedIntervals: ["WEEKLY"],
  },
  {
    title: "Uber Ride",
    type: "EXPENSE",
    category: "Transport",
    minAmount: 8,
    maxAmount: 60,
    paymentMethods: ["CARD", "MOBILE_PAYMENT"],
    recurringChance: 0.0,
  },
  {
    title: "Flight Ticket",
    type: "EXPENSE",
    category: "Travel",
    minAmount: 150,
    maxAmount: 1500,
    paymentMethods: ["CARD", "BANK_TRANSFER"],
    recurringChance: 0.0,
  },
  {
    title: "Hotel Stay",
    type: "EXPENSE",
    category: "Travel",
    minAmount: 80,
    maxAmount: 500,
    paymentMethods: ["CARD"],
    recurringChance: 0.0,
  },
  {
    title: "Duplicate - Internet Bill",
    type: "EXPENSE",
    category: "Utilities",
    minAmount: 40,
    maxAmount: 120,
    paymentMethods: ["AUTO_DEBIT"],
    recurringChance: 0.0,
    status: "FAILED",
  },
  {
    title: "Software Subscription",
    type: "EXPENSE",
    category: "Software",
    minAmount: 10,
    maxAmount: 200,
    paymentMethods: ["CARD", "AUTO_DEBIT"],
    recurringChance: 1.0,
    allowedIntervals: ["MONTHLY", "YEARLY"],
  },
  {
    title: "AWS Services",
    type: "EXPENSE",
    category: "Software",
    minAmount: 15,
    maxAmount: 350,
    paymentMethods: ["CARD", "AUTO_DEBIT"],
    recurringChance: 1.0,
    allowedIntervals: ["MONTHLY"],
  },
  {
    title: "Domain & Hosting",
    type: "EXPENSE",
    category: "Software",
    minAmount: 10,
    maxAmount: 50,
    paymentMethods: ["CARD"],
    recurringChance: 1.0,
    allowedIntervals: ["YEARLY"],
  },
  {
    title: "Doctor Visit",
    type: "EXPENSE",
    category: "Healthcare",
    minAmount: 50,
    maxAmount: 400,
    paymentMethods: ["CARD", "CASH"],
    recurringChance: 0.0,
  },
  {
    title: "Pharmacy",
    type: "EXPENSE",
    category: "Healthcare",
    minAmount: 10,
    maxAmount: 80,
    paymentMethods: ["CARD", "CASH"],
    recurringChance: 0.0,
  },
  {
    title: "Book Purchase",
    type: "EXPENSE",
    category: "Education",
    minAmount: 15,
    maxAmount: 100,
    paymentMethods: ["CARD", "MOBILE_PAYMENT"],
    recurringChance: 0.0,
  },
  {
    title: "Online Course",
    type: "EXPENSE",
    category: "Education",
    minAmount: 30,
    maxAmount: 500,
    paymentMethods: ["CARD"],
    recurringChance: 0.0,
  },
  {
    title: "Clothes Shopping",
    type: "EXPENSE",
    category: "Shopping",
    minAmount: 30,
    maxAmount: 400,
    paymentMethods: ["CARD", "CASH"],
    recurringChance: 0.0,
  },
  {
    title: "Electronics",
    type: "EXPENSE",
    category: "Shopping",
    minAmount: 50,
    maxAmount: 1500,
    paymentMethods: ["CARD", "BANK_TRANSFER"],
    recurringChance: 0.0,
  },
  {
    title: "Insurance Premium",
    type: "EXPENSE",
    category: "Insurance",
    minAmount: 80,
    maxAmount: 400,
    paymentMethods: ["AUTO_DEBIT", "BANK_TRANSFER"],
    recurringChance: 1.0,
    allowedIntervals: ["MONTHLY", "YEARLY"],
  },
  {
    title: "Water Bill",
    type: "EXPENSE",
    category: "Utilities",
    minAmount: 20,
    maxAmount: 80,
    paymentMethods: ["AUTO_DEBIT"],
    recurringChance: 1.0,
    allowedIntervals: ["MONTHLY"],
  },
  {
    title: "Phone Bill",
    type: "EXPENSE",
    category: "Utilities",
    minAmount: 30,
    maxAmount: 100,
    paymentMethods: ["AUTO_DEBIT", "CARD"],
    recurringChance: 1.0,
    allowedIntervals: ["MONTHLY"],
  },
  {
    title: "Charity Donation",
    type: "EXPENSE",
    category: "Charity",
    minAmount: 20,
    maxAmount: 500,
    paymentMethods: ["BANK_TRANSFER", "CARD"],
    recurringChance: 0.3,
    allowedIntervals: ["MONTHLY"],
  },
  {
    title: "Furniture",
    type: "EXPENSE",
    category: "Home",
    minAmount: 100,
    maxAmount: 2000,
    paymentMethods: ["CARD", "BANK_TRANSFER"],
    recurringChance: 0.0,
  },
  {
    title: "Home Repair",
    type: "EXPENSE",
    category: "Home",
    minAmount: 50,
    maxAmount: 800,
    paymentMethods: ["CASH", "CARD"],
    recurringChance: 0.0,
  },
  {
    title: "Pet Care",
    type: "EXPENSE",
    category: "Pets",
    minAmount: 30,
    maxAmount: 300,
    paymentMethods: ["CARD", "CASH"],
    recurringChance: 0.4,
    allowedIntervals: ["MONTHLY"],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Build Transaction Records
// ─────────────────────────────────────────────────────────────────────────────

function buildTransactions(userId: string, count = 120) {
  const records = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const tpl = pick(templates);
    const daysBack = rand(0, 365); // spread over the past year
    const txDate = daysAgo(daysBack);
    const createdAt = new Date(txDate);
    createdAt.setMinutes(createdAt.getMinutes() + rand(0, 30));

    const amountDollars = rand(tpl.minAmount * 100, tpl.maxAmount * 100) / 100;
    const amountCents = Math.round(amountDollars * 100);

    const isRecurring =
      tpl.recurringChance > 0 && Math.random() < tpl.recurringChance;

    const recurringInterval: RecurInterval | null =
      isRecurring && tpl.allowedIntervals
        ? pick(tpl.allowedIntervals)
        : null;

    // Calculate nextRecurringDate based on interval
    let nextRecurringDate: Date | null = null;
    if (recurringInterval) {
      const next = new Date(txDate);
      if (recurringInterval === "DAILY") next.setDate(next.getDate() + 1);
      else if (recurringInterval === "WEEKLY")
        next.setDate(next.getDate() + 7);
      else if (recurringInterval === "MONTHLY")
        next.setMonth(next.getMonth() + 1);
      else if (recurringInterval === "YEARLY")
        next.setFullYear(next.getFullYear() + 1);
      // Only set a future next date
      nextRecurringDate = next > now ? next : null;
    }

    const status: TxStatus =
      tpl.status ??
      (Math.random() < 0.05
        ? pick(["PENDING", "FAILED"] as TxStatus[])
        : "COMPLETED");

    records.push({
      id: uuid(),
      userId,
      type: tpl.type,
      title: tpl.title,
      amount: amountCents,
      category: tpl.category,
      receiptUrl: null,
      recurringInterval,
      nextRecurringDate,
      lastProcessed: isRecurring ? txDate : null,
      isRecurring,
      description: null,
      date: txDate,
      status,
      paymentMethod: pick(tpl.paymentMethods) as PayMethod,
      createdAt,
      updatedAt: createdAt,
    });
  }

  return records;
}

// ─────────────────────────────────────────────────────────────────────────────
// Build Report Records
// ─────────────────────────────────────────────────────────────────────────────

function buildReports(userId: string) {
  const months = [
    { period: "May 1-31, 2025", sentDate: new Date("2025-05-24"), status: "SENT" as const },
    { period: "April 1-30, 2025", sentDate: new Date("2025-04-24"), status: "SENT" as const },
    { period: "March 1-31, 2025", sentDate: new Date("2025-03-24"), status: "SENT" as const },
    { period: "February 1-28, 2025", sentDate: new Date("2025-02-24"), status: "SENT" as const },
    { period: "January 1-31, 2025", sentDate: new Date("2025-01-24"), status: "SENT" as const },
    { period: "December 1-31, 2024", sentDate: new Date("2024-12-24"), status: "SENT" as const },
    { period: "November 1-30, 2024", sentDate: new Date("2024-11-24"), status: "FAILED" as const },
    { period: "October 1-31, 2024", sentDate: new Date("2024-10-24"), status: "NO_ACTIVITY" as const },
  ];

  return months.map(({ period, sentDate, status }) => ({
    id: uuid(),
    userId,
    period,
    sentDate,
    status,
    createdAt: sentDate,
    updatedAt: sentDate,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Build Report Setting
// ─────────────────────────────────────────────────────────────────────────────

function buildReportSetting(userId: string) {
  const nextReportDate = new Date();
  nextReportDate.setMonth(nextReportDate.getMonth() + 1);
  nextReportDate.setDate(1);

  return {
    id: uuid(),
    userId,
    frequency: "MONTHLY" as const,
    isEnabled: true,
    dayOfMonth: 1,
    nextReportDate,
    lastSentDate: new Date("2025-05-24"),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Seed Runner
// ─────────────────────────────────────────────────────────────────────────────

async function seed() {
  console.log("🌱 Finora AI — Starting database seed...\n");

  // 1. Find first user
  console.log("🔍 Looking for existing users...");
  const users = await db.select().from(user).limit(5);

  if (users.length === 0) {
    console.error(
      "❌ No users found in the database!\n" +
        "   Please sign up via the app first, then re-run this seed script.\n" +
        "   The seed script needs an existing user to attach transactions to.",
    );
    process.exit(1);
  }

  // Seed for all found users (usually just 1)
  for (const u of users) {
    console.log(`\n👤 Seeding for user: ${u.name} <${u.email}> (${u.id})\n`);

    // ── 2. Transactions ─────────────────────────────────────────────
    console.log("💳 Building 120 transaction records...");
    const txRecords = buildTransactions(u.id, 120);

    console.log("📥 Inserting transactions (in batches of 20)...");
    const batchSize = 20;
    let inserted = 0;
    for (let i = 0; i < txRecords.length; i += batchSize) {
      const batch = txRecords.slice(i, i + batchSize);
      await db.insert(transaction).values(batch).onConflictDoNothing();
      inserted += batch.length;
      process.stdout.write(`   ✓ ${inserted}/${txRecords.length} inserted\r`);
    }
    console.log(`\n   ✅ ${txRecords.length} transactions seeded!`);

    // ── 3. Reports ──────────────────────────────────────────────────
    console.log("\n📊 Building report history records...");
    const reportRecords = buildReports(u.id);
    await db.insert(report).values(reportRecords).onConflictDoNothing();
    console.log(`   ✅ ${reportRecords.length} reports seeded!`);

    // ── 4. Report Setting ───────────────────────────────────────────
    console.log("\n⚙️  Building report setting record...");

    // Check if setting already exists
    const existing = await db
      .select()
      .from(reportSetting)
      .where(eq(reportSetting.userId, u.id))
      .limit(1);

    if (existing.length > 0) {
      console.log("   ℹ️  Report setting already exists — skipped.");
    } else {
      const settingRecord = buildReportSetting(u.id);
      await db.insert(reportSetting).values(settingRecord).onConflictDoNothing();
      console.log("   ✅ Report setting seeded!");
    }
    // ── 5. Subscription ─────────────────────────────────────────────
    console.log("\n💳 Seeding free-plan subscription record...");

    const existingSub = await db
      .select()
      .from(subscription)
      .where(eq(subscription.referenceId, u.id))
      .limit(1);

    if (existingSub.length > 0) {
      console.log("   ℹ️  Subscription already exists — skipped.");
    } else {
      await db.insert(subscription).values({
        id: uuid(),
        plan: "free",
        referenceId: u.id,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        stripePriceId: null,
        status: null,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
        seats: null,
        trialStart: null,
        trialEnd: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).onConflictDoNothing();
      console.log("   ✅ Subscription (free plan) seeded!");
    }
  }

  console.log("\n🎉 Seed completed successfully!");
  console.log(`   Users seeded: ${users.length}`);
  console.log(`   Transactions per user: 120`);
  console.log(`   Reports per user: 8`);
  console.log(`   Report settings per user: 1`);
  console.log(`   Subscription records per user: 1`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
