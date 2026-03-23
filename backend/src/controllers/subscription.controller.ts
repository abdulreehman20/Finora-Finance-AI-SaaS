import type { Request, Response } from "express";
import { HTTPSTATUS } from "../configs/http.config";
import { asyncHandler } from "../middlewares/asyncHandler.middlerware";
import { getSubscriptionStatusService } from "../services/subscription.service";

/**
 * GET /api/subscription/status
 * Returns the authenticated user's plan info and feature limits.
 * The plan field is updated automatically by the official Polar webhook
 * handled at POST /api/auth/polar/webhooks (via @polar-sh/better-auth).
 */
export const getSubscriptionStatusController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId)
      return res
        .status(HTTPSTATUS.UNAUTHORIZED)
        .json({ message: "User not authenticated" });

    const status = await getSubscriptionStatusService(userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Subscription status fetched successfully",
      ...status,
    });
  },
);
