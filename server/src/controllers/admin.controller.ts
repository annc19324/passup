import { Request, Response } from "express";
import prisma from "../config/db";

export const getStats = async (req: Request, res: Response) => {
    try {
        const totalUsers = await prisma.user.count();
        const totalProducts = await prisma.product.count();
        const totalReports = await prisma.report.count({ where: { status: "PENDING" } });

        res.json({
            success: true,
            data: {
                totalUsers,
                totalProducts,
                totalReports,
            }
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: "desc" }
        });
        res.json({ success: true, data: users });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const products = await prisma.product.findMany({
            include: {
                seller: { select: { fullName: true, email: true } },
                category: true
            },
            orderBy: { createdAt: "desc" }
        });
        res.json({ success: true, data: products });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};



export const updateReportStatus = async (req: Request, res: Response) => {
    try {
        const reportId = Number(req.params.id);
        const { status, action, targetId, targetType } = req.body; // status: RESOLVED, DISMISSED. action: DEACTIVATE, BAN

        const updatedReport = await prisma.report.update({
            where: { id: reportId },
            data: { status }
        });

        // Nếu có hành động đi kèm
        if (status === 'RESOLVED' && action) {
            if (action === 'DEACTIVATE' && targetType === 'PRODUCT') {
                await prisma.product.update({
                    where: { id: Number(targetId) },
                    data: { status: 'SOLD' } // Chuyển sang SOLD hoặc DEACTIVATED tùy nghiệp vụ, ở đây dùng SOLD để ẩn bài
                });
            } else if (action === 'BAN' && targetType === 'USER') {
                await prisma.user.update({
                    where: { id: Number(targetId) },
                    data: { role: 'USER' } // Hoặc set status: BANNED nếu có
                });
            }
        }

        res.json({ success: true, data: updatedReport });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateGenericSetting = async (req: Request, res: Response) => {
    try {
        const { key, value } = req.body;
        const setting = await prisma.systemSetting.upsert({
            where: { key },
            update: { value: String(value) },
            create: { key, value: String(value) }
        });
        res.json({ success: true, data: setting });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateProductByAdmin = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;
        const updated = await prisma.product.update({
            where: { id: Number(id) },
            data
        });
        res.json({ success: true, data: updated });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};


export const updateUserByAdmin = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const data = req.body;
        
        // Chuyển đổi pushCount và postLimit sang Number nếu có
        if (data.pushCount !== undefined) data.pushCount = Number(data.pushCount);
        if (data.postLimit !== undefined) data.postLimit = Number(data.postLimit);

        const updated = await prisma.user.update({
            where: { id: Number(id) },
            data
        });
        res.json({ success: true, data: updated });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
