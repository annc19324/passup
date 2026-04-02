import prisma from "../config/db";
import { getIO } from "../config/socket";

export const createNotification = async (data: {
    userId: number;
    title: string;
    content: string;
    type: string;
    link?: string;
}) => {
    try {
        // 1. Lưu vào Database
        const notification = await prisma.notification.create({
            data: {
                userId: data.userId,
                title: data.title,
                content: data.content,
                type: data.type,
                link: data.link
            }
        });

        // 2. Gửi qua Socket.io (Real-time)
        const io = getIO();
        io.to(`user_${data.userId}`).emit("notification", notification);

        return notification;
    } catch (error) {
        console.error("Lỗi tạo thông báo:", error);
    }
};

export const getMyNotifications = async (userId: number) => {
    return await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 20
    });
};

export const markAsRead = async (notificationId: number) => {
    return await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true }
    });
};
