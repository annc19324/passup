import { Router } from "express";
import { createReport, getAllReports } from "../controllers/report.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

// Gửi báo cáo (cần đăng nhập)
router.post("/create", protect, createReport);

// Xem tất cả báo cáo (tạm thời để test, sau này admin dashboard dùng)
router.get("/all", protect, getAllReports);

export default router;
