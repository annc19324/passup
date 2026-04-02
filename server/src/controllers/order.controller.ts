import { Request, Response } from "express";
import prisma from "../config/db";
import { createNotification } from "../services/notification.service";

export const createOrder = async (req: Request, res: Response) => {
    try {
        const { productId, shippingPhone, shippingAddress, totalAmount } = req.body;
        const buyerId = (req as any).user.id;

        const product = await prisma.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            return res.status(404).json({ success: false, message: "Sản phẩm không tồn tại" });
        }

        if (product.sellerId === buyerId) {
            return res.status(400).json({ success: false, message: "Bạn không thể mua sản phẩm của chính mình" });
        }

        // Kiểm tra xem sản phẩm còn hàng không
        if (product.status === "SOLD" || product.stock <= 0) {
            return res.status(400).json({ success: false, message: "Sản phẩm đã bán hết" });
        }

        const order = await prisma.order.create({
            data: {
                buyerId,
                productId,
                shippingPhone,
                shippingAddress,
                totalAmount: totalAmount || product.price,
                status: "PENDING"
            }
        });

        // 1. Thông báo cho người bán
        await createNotification({
            userId: product.sellerId,
            title: "Bạn có đơn hàng mới!",
            content: `Khách hàng vừa đặt mua "${product.title}". Vui lòng xác nhận đơn hàng.`,
            type: "ORDER_NEW",
            link: "/orders"
        });

        // KHÔNG chuyển trạng thái RESERVED ở đây để nhiều người có thể đặt hàng

        res.status(201).json({ success: true, data: order });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getMyOrders = async (req: Request, res: Response) => {
    try {
        const buyerId = (req as any).user.id;
        const orders = await prisma.order.findMany({
            where: { buyerId },
            include: {
                product: {
                    include: {
                        seller: {
                            select: { fullName: true, phone: true }
                        }
                    }
                },
                rating: true
            },
            orderBy: { createdAt: "desc" }
        });
        res.json({ success: true, data: orders });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getIncomingOrders = async (req: Request, res: Response) => {
    try {
        const sellerId = (req as any).user.id;
        const orders = await prisma.order.findMany({
            where: {
                product: {
                    sellerId
                }
            },
            include: {
                product: true,
                buyer: {
                    select: { fullName: true, phone: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });
        res.json({ success: true, data: orders });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = (req as any).user.id;

        const order = await prisma.order.findUnique({
            where: { id: Number(id) },
            include: { product: true }
        });

        if (!order) {
            return res.status(404).json({ success: false, message: "Đơn hàng không tồn tại" });
        }

        if (order.product.sellerId !== userId && order.buyerId !== userId) {
            return res.status(403).json({ success: false, message: "Bạn không có quyền cập nhật đơn hàng này" });
        }

        // Logic Xác nhận độc quyền
        if (status === "CONFIRMED") {
            const product = await prisma.product.findUnique({ where: { id: order.productId } });
            if (!product || product.status === "SOLD" || product.stock <= 0) {
                return res.status(400).json({ success: false, message: "Sản phẩm này đã bán hết, không thể xác nhận thêm đơn hàng này." });
            }

            // Giảm stock, nếu hết thì chuyển sang RESERVED (chờ giao xong mới SOLD)
            await prisma.product.update({
                where: { id: order.productId },
                data: {
                    stock: { decrement: 1 },
                    status: (product.stock - 1 <= 0) ? "RESERVED" : "AVAILABLE"
                }
            });
        }

        // Logic Hủy đơn
        if (status === "CANCELLED" && order.status === "CONFIRMED") {
            // Nếu đã xác nhận mà hủy thì phải hoàn lại stock
            await prisma.product.update({
                where: { id: order.productId },
                data: {
                    stock: { increment: 1 },
                    status: "AVAILABLE"
                }
            });
        }

        const updatedOrder = await prisma.order.update({
            where: { id: Number(id) },
            data: { status }
        });

        // Thông báo
        await createNotification({
            userId: order.buyerId,
            title: "Trạng thái đơn hàng thay đổi",
            content: `Đơn hàng cho "${order.product.title}" hiện là: ${status}`,
            type: "ORDER_STATUS",
            link: "/orders"
        });

        // Nếu hoàn tất, chuyển sản phẩm sang SOLD nếu không còn stock
        if (status === "COMPLETED") {
             const product = await prisma.product.findUnique({ where: { id: order.productId } });
             if (product && product.stock <= 0) {
                await prisma.product.update({
                    where: { id: order.productId },
                    data: { status: "SOLD" }
                });
             }
        }

        res.json({ success: true, data: updatedOrder });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
