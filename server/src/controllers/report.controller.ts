import { Request, Response } from "express";
import prisma from "../config/db";

export const createReport = async (req: Request, res: Response) => {
    try {
        const { targetType, targetId, reason, description } = req.body;
        const reporterId = (req as any).user.id;

        const newReport = await prisma.report.create({
            data: {
                reporterId,
                targetType,
                targetId: Number(targetId),
                reason,
                description
            }
        });

        res.status(201).json({ success: true, message: "Báo cáo đã được gửi. Chúng tôi sẽ xem xét sớm nhất có thể.", data: newReport });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getAllReports = async (req: Request, res: Response) => {
    try {
        // Chỉ admin mới lấy được hết (tạm thời để test)
        const reports = await prisma.report.findMany({
            include: {
                reporter: { select: { fullName: true, email: true } }
            },
            orderBy: { createdAt: "desc" }
        });
        res.json({ success: true, data: reports });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
