import { Router } from "express";
import { createRating, getUserRatings } from "../controllers/rating.controller";
import { protect, optionalProtect } from "../middleware/auth.middleware";

const router = Router();

// Route lấy đánh giá công khai
router.get("/user/:userId", optionalProtect, getUserRatings);

// Các route cần đăng nhập
router.post("/create", protect, createRating);

export default router;
