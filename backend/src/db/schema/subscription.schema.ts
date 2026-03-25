import { relations } from "drizzle-orm";
import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./user.schema";

/**
 * Subscription table — managed by @better-auth/stripe plugin.
 *
 * Field names match the Better Auth Stripe plugin's expected schema exactly so
 * the plugin can read/write rows without any field-name mapping configuration.
 *
 * referenceId → userId (the user the subscription belongs to)
 * stripeCustomerId → stored on the user table by the plugin
 * stripeSubscriptionId → the Stripe subscription ID
 * stripePriceId → the Stripe price ID
 * status → Stripe subscription status string
 * periodStart / periodEnd → current billing period
 * cancelAtPeriodEnd → whether the sub cancels at the end of the period
 * seats → for seat-based plans (unused but kept for plugin compat)
 */
export const subscription = pgTable("subscription", {
  id: text("id").primaryKey(),
  plan: text("plan").notNull().default("free"),
  referenceId: text("reference_id").notNull(), // userId
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripePriceId: text("stripe_price_id"),
  status: text("status"), // Stripe subscription status: active, canceled, past_due, trialing, etc.
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
  seats: text("seats"),
  trialStart: timestamp("trial_start"),
  trialEnd: timestamp("trial_end"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const subscriptionRelations = relations(subscription, ({ one }) => ({
  user: one(user, {
    fields: [subscription.referenceId],
    references: [user.id],
  }),
}));
