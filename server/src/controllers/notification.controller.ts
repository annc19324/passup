import { Request, Response } from "express";
import * as NotificationService from "../services/notification.service";

export const getMyNotifications = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const notifications = await NotificationService.getMyNotifications(userId);
        res.json({ success: true, data: notifications });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const markAsRead = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await NotificationService.markAsRead(Number(id));
        res.json({ success: true, message: "Đã đánh dấu đã đọc" });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
