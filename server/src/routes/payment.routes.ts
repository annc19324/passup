import { Router } from "express";
import { createPaymentLink, handleWebhook, pushProduct, checkPayment } from "../controllers/payment.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

// PayOS: Create Link (Phải đăng nhập)
router.post("/create-link", protect, createPaymentLink);

// PayOS: Check status thủ công (Khi webhook không tới được localhost)
router.get("/check/:orderCode", protect, checkPayment);

// PayOS: Webhook (Không được dùng protect vì PayOS gọi trực tiếp từ Server của họ)
router.post("/webhook", handleWebhook);

// Logic đẩy tin
router.post("/push", protect, pushProduct);

export default router;
