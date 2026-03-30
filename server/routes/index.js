import { Router } from "express";
import { responseHelper } from "../utils/responseHelper.js";
import authRoutes from "./authRoutes.js";
import adminRoutes from "./adminRoutes.js";
import readerRoutes from "./readerRoutes.js";
import officerRoutes from "./officerRoutes.js";
import publicRoutes from "./publicRoutes.js";
const router = Router();

router.get("/health", (req, res) => {
    return responseHelper.success(res, "Server is healthy!");
});

router.use("/auth",authRoutes);
router.use("/admin", adminRoutes);
router.use("/reader", readerRoutes);
router.use("/officer", officerRoutes);
router.use("/requests", publicRoutes);

export default router;
