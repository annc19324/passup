import { Router } from "express";
import { protect } from "../middleware/auth.middleware";
import { upload } from "../middleware/upload.middleware";
import { getMe, updateMe, getPublicProfile, updateBackground } from "../controllers/user.controller";

const router = Router();

// Lấy thông tin cá nhân
router.get("/me", protect, getMe);

// Lấy thông tin công khai của User khác
router.get("/:id", getPublicProfile);

// Cập nhật thông tin cá nhân (hỗ trợ upload 1 ảnh avatar)
router.put("/me", protect, upload.single("avatar"), updateMe);

// Cập nhật background
router.put("/me/background", protect, updateBackground);

export default router;
