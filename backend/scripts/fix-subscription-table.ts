/**
 * Fix script: Drops the old subscription table (previously using Polar columns)
 * and recreates it with the correct Stripe-compatible schema so `drizzle-kit push`
 * can run cleanly.
 *
 * Run once with: bun run scripts/fix-subscription-table.ts
 */

import { config } from "dotenv";
config({ path: ".env" });

import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function fix() {
  console.log("🔧 Dropping old subscription table...");

  // Drop the old table entirely (Polar-era schema)
  await sql`DROP TABLE IF EXISTS "subscription" CASCADE`;

  console.log("✅ Old subscription table dropped.");

  // Recreate with the Stripe-compatible schema
  await sql`
    CREATE TABLE IF NOT EXISTS "subscription" (
      "id"                      TEXT PRIMARY KEY,
      "plan"                    TEXT NOT NULL DEFAULT 'free',
      "reference_id"            TEXT NOT NULL,
      "stripe_customer_id"      TEXT,
      "stripe_subscription_id"  TEXT,
      "stripe_price_id"         TEXT,
      "status"                  TEXT,
      "current_period_start"    TIMESTAMP,
      "current_period_end"      TIMESTAMP,
      "cancel_at_period_end"    BOOLEAN NOT NULL DEFAULT FALSE,
      "seats"                   TEXT,
      "trial_start"             TIMESTAMP,
      "trial_end"               TIMESTAMP,
      "created_at"              TIMESTAMP NOT NULL DEFAULT NOW(),
      "updated_at"              TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;

  console.log("✅ New subscription table created with Stripe schema.");
  console.log("\n🎉 Done! You can now run: bun run db:push");
  process.exit(0);
}

fix().catch((err) => {
  console.error("❌ Fix failed:", err);
  process.exit(1);
});
