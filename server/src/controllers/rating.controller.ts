// server/src/controllers/rating.controller.ts

import { Request, Response } from "express";
import prisma from "../config/db";
import { createNotification } from "../services/notification.service";

export const createRating = async (req: Request, res: Response) => {
    try {
        const { orderId, rating, comment } = req.body;
        const reviewerId = (req as any).user.id;

        const order = await prisma.order.findUnique({
            where: { id: Number(orderId) },
            include: { product: true }
        });

        if (!order) {
            return res.status(404).json({ success: false, message: "Đơn hàng không tồn tại" });
        }

        if (order.buyerId !== reviewerId) {
            return res.status(403).json({ success: false, message: "Chỉ người mua mới có quyền đánh giá" });
        }

        if (order.status !== "COMPLETED") {
            return res.status(400).json({ success: false, message: "Bạn chỉ có thể đánh giá sau khi đơn hàng hoàn tất" });
        }

        // Kiểm tra xem đã đánh giá chưa
        const existingRating = await prisma.rating.findUnique({
            where: { orderId: Number(orderId) }
        });

        if (existingRating) {
            return res.status(400).json({ success: false, message: "Bạn đã đánh giá đơn hàng này rồi" });
        }

        const newRating = await prisma.rating.create({
            data: {
                orderId: Number(orderId),
                reviewerId,
                revieweeId: order.product.sellerId,
                rating: Number(rating),
                comment
            }
        });

        // Thông báo cho người được đánh giá (Reviewee)
        await createNotification({
            userId: order.product.sellerId,
            title: "Bạn có đánh giá mới ⭐",
            content: `Khách hàng vừa đánh giá ${rating} sao cho giao dịch món đồ "${order.product.title}".`,
            type: "RATING_NEW",
            link: `/seller/${order.product.sellerId}`
        });

        res.status(201).json({ success: true, data: newRating });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getUserRatings = async (req: Request, res: Response) => {
    try {
        const userId = Number(req.params.userId);
        const ratings = await prisma.rating.findMany({
            where: { revieweeId: userId },
            include: {
                reviewer: {
                    select: { fullName: true, avatar: true }
                },
                order: {
                    include: { product: { select: { title: true } } }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        // Tính trung bình cộng
        const avg = ratings.length > 0 ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0;

        res.json({ 
            success: true, 
            data: ratings,
            average: avg.toFixed(1),
            count: ratings.length
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
