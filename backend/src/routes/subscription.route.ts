import { Router } from "express";
import { getSubscriptionStatusController } from "../controllers/subscription.controller";

const subscriptionRoutes = Router();

/**
 * GET /api/subscription/status
 * Returns the authenticated user's current plan and feature limits.
 *
 * NOTE: Checkout is handled by Better Auth's Polar plugin at:
 *   GET /api/auth/checkout/:slug  (e.g. /api/auth/checkout/pro)
 *
 * Webhooks are handled at:
 *   POST /api/auth/polar/webhooks  (registered automatically by @polar-sh/better-auth)
 */
subscriptionRoutes.get("/status", getSubscriptionStatusController);

export default subscriptionRoutes;
