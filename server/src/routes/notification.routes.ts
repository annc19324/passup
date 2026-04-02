import { Router } from "express";
import { getMyNotifications, markAsRead } from "../controllers/notification.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.get("/", protect, getMyNotifications);
router.put("/:id/read", protect, markAsRead);

export default router;
