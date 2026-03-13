import type { Request, Response } from "express";
import { HTTPSTATUS } from "../configs/http.config";
import { asyncHandler } from "../middlewares/asyncHandler.middlerware";
import {
    chartAnalyticsService,
    expensePieChartBreakdownService,
    summaryAnalyticsService,
} from "../services/analytics.service";

// ── Summary Controller ─────────────────────────────────────────────────────────

export const summaryAnalyticsController = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) return res.status(HTTPSTATUS.UNAUTHORIZED).json({ message: "User not authenticated" });

        const { preset, from, to } = req.query;
        const customFrom = from ? new Date(from as string) : undefined;
        const customTo = to ? new Date(to as string) : undefined;

        const data = await summaryAnalyticsService(
            userId,
            preset as string | undefined,
            customFrom,
            customTo,
        );

        return res.status(HTTPSTATUS.OK).json({ message: "Summary fetched successfully", data });
    },
);

// ── Chart Controller ───────────────────────────────────────────────────────────

export const chartAnalyticsController = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) return res.status(HTTPSTATUS.UNAUTHORIZED).json({ message: "User not authenticated" });

        const { preset, from, to } = req.query;
        const customFrom = from ? new Date(from as string) : undefined;
        const customTo = to ? new Date(to as string) : undefined;

        const data = await chartAnalyticsService(
            userId,
            preset as string | undefined,
            customFrom,
            customTo,
        );

        return res.status(HTTPSTATUS.OK).json({ message: "Chart data fetched successfully", data });
    },
);

// ── Expense Breakdown Controller ───────────────────────────────────────────────

export const expensePieChartBreakdownController = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user?.id;
        if (!userId) return res.status(HTTPSTATUS.UNAUTHORIZED).json({ message: "User not authenticated" });

        const { preset, from, to } = req.query;
        const customFrom = from ? new Date(from as string) : undefined;
        const customTo = to ? new Date(to as string) : undefined;

        const data = await expensePieChartBreakdownService(
            userId,
            preset as string | undefined,
            customFrom,
            customTo,
        );

        return res.status(HTTPSTATUS.OK).json({ message: "Expense breakdown fetched successfully", data });
    },
);
