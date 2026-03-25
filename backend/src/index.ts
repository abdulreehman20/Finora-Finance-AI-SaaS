import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";
import { initializeCrons } from "./cron";
import { auth } from "./lib/auth";
import logger from "./lib/logger";
import { attachUserFromSession } from "./middlewares/auth.middleware";
import { errorHandler } from "./middlewares/error.middleware";
import router from "./routes";
import docsRouter from "./routes/docs.route";

const app = express();
const PORT = 7000;

logger.info("Starting Express server initialization");

app.use(
  cors({
    origin: process.env.NEXT_PUBLIC_APP_URL, // React app URL
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
    credentials: true, // allow cookies
  }),
);
logger.info(`CORS configured with origin: ${process.env.NEXT_PUBLIC_APP_URL}`);

app.all("/api/auth/*splat", toNodeHandler(auth));
logger.info("Better Auth middleware configured for /api/auth/*");

// Mount express json middleware after Better Auth handler
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
logger.info("JSON middleware configured");

// Attach Better Auth user to req.user for all subsequent routes
app.use(attachUserFromSession);

// API Docs (Scalar UI) — available in all environments
app.use("/api/docs", docsRouter);

// routes
app.use("/api", router);

// Home Api for welcoming
app.get("/", (_req, res) => {
  logger.info("Received request at /");
  res.json({ message: "Welcome to Finora Finance AI SaaS API!" });
});

// Api for Health Test
app.get("/api/health", (_req, res) => {
  logger.info("Received request at /api/health");
  res.json({ message: "API is working!" });
});

// Error handling middleware (should be last)
app.use(errorHandler);

if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
  const server = app.listen(PORT, async () => {
    logger.info(`Server running at http://localhost:${PORT}`);

    if (process.env.NODE_ENV === "development") {
      await initializeCrons();
    }
  });

  server.on("error", (error) => {
    logger.error("Server error:", error);
  });

  process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection at:", promise, "reason:", reason);
  });

  process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception:", error);
  });
}

export default app;
