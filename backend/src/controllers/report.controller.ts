import type { Request, Response } from "express";
import { HTTPSTATUS } from "../configs/http.config";
import { asyncHandler } from "../middlewares/asyncHandler.middlerware";
import {
	generateReportService,
	getAllReportsService,
	updateReportSettingService,
} from "../services/report.service";
import { updateReportSettingSchema } from "../validators/report.validator";

// Get All Reports Controller
export const getAllReportsController = asyncHandler(
	async (req: Request, res: Response) => {
		const userId = req.user?.id;
		if (!userId)
			return res
				.status(HTTPSTATUS.UNAUTHORIZED)
				.json({ message: "User not authenticated" });

		const pagination = {
			pageSize: parseInt(req.query.pageSize as string, 10) || 20,
			pageNumber: parseInt(req.query.pageNumber as string, 10) || 1,
		};

		const result = await getAllReportsService(userId, pagination);

		return res
			.status(HTTPSTATUS.OK)
			.json({ message: "Reports history fetched successfully", ...result });
	},
);

// Generate Report Controller
export const generateReportController = asyncHandler(
	async (req: Request, res: Response) => {
		const userId = req.user?.id;
		if (!userId)
			return res
				.status(HTTPSTATUS.UNAUTHORIZED)
				.json({ message: "User not authenticated" });

		const { from, to } = req.query;
		const fromDate = new Date(from as string);
		const toDate = new Date(to as string);

		const result = await generateReportService(userId, fromDate, toDate);

		return res
			.status(HTTPSTATUS.OK)
			.json({ message: "Report generated successfully", ...result });
	},
);

// Update Report Setting Controller
export const updateReportSettingController = asyncHandler(
	async (req: Request, res: Response) => {
		const userId = req.user?.id;
		if (!userId)
			return res
				.status(HTTPSTATUS.UNAUTHORIZED)
				.json({ message: "User not authenticated" });

		const body = updateReportSettingSchema.parse(req.body);

		await updateReportSettingService(userId, body);

		return res
			.status(HTTPSTATUS.OK)
			.json({ message: "Reports setting updated successfully" });
	},
);
