// server/src/controllers/auth.controller.ts

import type { Request, Response } from "express";
import { registerUser, loginUser, requestResetOTP, resetPasswordWithOTP, changeUserPassword } from "../services/auth.service";
import { sendOTP } from "../utils/mailer";

// POST /api/auth/forgot-password
export async function forgotPassword(req: Request, res: Response) {
    try {
        const { email } = req.body;
        const otp = await requestResetOTP(email);
        await sendOTP(email, otp);
        res.json({ success: true, message: "Mã OTP đã được gửi về email" });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
}

// POST /api/auth/reset-password
export async function resetPassword(req: Request, res: Response) {
    try {
        const { email, otp, newPass } = req.body;
        await resetPasswordWithOTP({ email, otp, newPass });
        res.json({ success: true, message: "Đổi mật khẩu thành công" });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
}

// POST /api/auth/change-password
export async function changePassword(req: Request, res: Response) {
    try {
        const user = (req as any).user;
        const { oldPass, newPass } = req.body;
        await changeUserPassword(user.id, { oldPass, newPass });
        res.json({ success: true, message: "Cập nhật mật khẩu thành công" });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
}

// POST /api/auth/register
export async function register(req: Request, res: Response) {
    try {
        const { email, password, fullName, username, phone } = req.body;

        // Validate đơn giản phía backend
        if (!email || !password || !fullName || !username || !phone) {
            res.status(400).json({
                success: false,
                message: "Vui lòng điền đầy đủ thông tin!",
            });
            return;
        }

        // Gọi service xử lý logic
        const result = await registerUser({ email, password, fullName, username, phone });

        // Trả về kết quả
        res.status(201).json({
            success: true,
            message: "Đăng ký thành công!",
            data: result,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message || "Đã có lỗi xảy ra!",
        });
    }
}

// POST /api/auth/login
export async function login(req: Request, res: Response) {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            res.status(400).json({
                success: false,
                message: "Vui lòng nhập tài khoản và mật khẩu!",
            });
            return;
        }

        const result = await loginUser({ identifier, password });

        res.status(200).json({
            success: true,
            message: "Đăng nhập thành công!",
            data: result,
        });
    } catch (error: any) {
        res.status(401).json({
            success: false,
            message: error.message || "Đăng nhập thất bại!",
        });
    }
}

// GET /api/auth/me
export async function getMe(req: Request, res: Response) {
    try {
        // req.user sẽ đươc thêm từ auth.middleware
        const user = (req as any).user;

        if (!user) {
            res.status(401).json({
                success: false,
                message: "Chưa đăng nhập",
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: { user },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Lỗi Server",
        });
    }
}