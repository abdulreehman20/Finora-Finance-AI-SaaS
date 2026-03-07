import type { NextFunction, Request, Response } from "express";
import logger from "../lib/logger";

export const requestLogger = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const startTime = Date.now();

	// Log the incoming request
	logger.info(`Incoming Request: ${req.method} ${req.url}`);

	// Capture the finish event to log the response
	res.on("finish", () => {
		const duration = Date.now() - startTime;
		const { statusCode } = res;

		let level: "info" | "warn" | "error" = "info";
		if (statusCode >= 500) level = "error";
		else if (statusCode >= 400) level = "warn";

		logger.log(
			level,
			`Response Sent: ${req.method} ${req.url} [${statusCode}] - ${duration}ms`,
		);
	});

	next();
};
