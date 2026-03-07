import { Router } from "express";
import adminRoutes from "./admin.route";
import reportRoutes from "./report.route";
import transactionRoutes from "./transaction.route";

const router = Router();

router.use("/transaction", transactionRoutes);
router.use("/report", reportRoutes);

// ⚠️ Admin / dev-only routes — manual job triggers for testing
// These are NEVER mounted in production.
if (process.env.NODE_ENV !== "production") {
	router.use("/admin", adminRoutes);
}

export default router;
