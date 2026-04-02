import { Router } from "express";
import { register, login, getMe, forgotPassword, resetPassword, changePassword } from "../controllers/auth.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/change-password", protect, changePassword);

export default router;
