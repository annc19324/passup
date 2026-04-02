import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";
import prisma from "../config/db";

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(" ")[1];

            // Verify token
            const decoded: any = verifyToken(token);

            // Get user from the token
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { id: true, email: true, fullName: true, role: true, avatar: true, background: true, pushCount: true, postLimit: true, status: true }
            });

            if (!user) {
                res.status(401).json({ success: false, message: "User không tồn tại" });
                return;
            }

            (req as any).user = user;

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ success: false, message: "Không có quyền truy cập, token không hợp lệ" });
            return;
        }
    }

    if (!token) {
        res.status(401).json({ success: false, message: "Không có quyền truy cập, token không tồn tại" });
        return;
    }
};

export const optionalProtect = async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded: any = verifyToken(token);
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { id: true, email: true, fullName: true, role: true, avatar: true, background: true, pushCount: true, postLimit: true, status: true }
            });

            if (user) {
                (req as any).user = user;
            }
            next();
        } catch (error) {
            // Nếu lỗi token thì cứ cho đi tiếp như Guest
            next();
        }
    } else {
        next();
    }
};
export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
    if ((req as any).user && (req as any).user.role === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ success: false, message: "Không có quyền truy cập trang quản trị" });
    }
};
