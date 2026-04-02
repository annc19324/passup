import { Router } from "express";
import { createOrder, getMyOrders, getIncomingOrders, updateOrderStatus } from "../controllers/order.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

// Các route cần đăng nhập
router.use(protect);

router.post("/create", createOrder);
router.get("/me", getMyOrders);
router.get("/incoming", getIncomingOrders);
router.put("/:id/status", updateOrderStatus);

export default router;
