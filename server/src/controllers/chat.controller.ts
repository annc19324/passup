import { Request, Response } from "express";
import * as ChatService from "../services/chat.service";
import { getIO } from "../config/socket";

export const getMyConversations = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const conversations = await ChatService.getConversations(userId);
        res.status(200).json({ success: true, data: conversations });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getChatMessages = async (req: Request, res: Response) => {
    try {
        const conversationId = parseInt(req.params.conversationId as string, 10);
        const limit = parseInt(req.query["limit"] as string, 10) || 50;
        const offset = parseInt(req.query["offset"] as string, 10) || 0;

        const messages = await ChatService.getMessages(conversationId, limit, offset);
        // Trả về theo thứ tự thời gian tăng dần cho frontend dễ vẽ (mới nhất ở cuối list)
        res.status(200).json({ success: true, data: [...messages].reverse() });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const startConversation = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { sellerId, productId } = req.body;

        if (userId === sellerId) {
            res.status(400).json({ success: false, message: "Bạn không thể tự chat với chính mình" });
            return;
        }

        const conversation = await ChatService.getOrCreateConversation(userId, sellerId, productId);
        res.status(200).json({ success: true, data: conversation });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

import cloudinary from "../utils/cloudinary";

export const sendChatMessage = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { conversationId, text, receiverId } = req.body;

        if (!conversationId || isNaN(parseInt(conversationId))) {
            return res.status(400).json({ success: false, message: "Thiếu mã cuộc hội thoại hợp lệ" });
        }

        let imageUrl: string | undefined = undefined;

        if (req.file) {
            const b64 = Buffer.from(req.file.buffer).toString("base64");
            const dataURI = "data:" + req.file.mimetype + ";base64," + b64;
            const uploadResponse = await cloudinary.uploader.upload(dataURI, {
                folder: 'chat_images',
                resource_type: 'image'
            });
            imageUrl = uploadResponse.secure_url;
        }

        const message = await ChatService.sendMessage(parseInt(conversationId), userId, text || "", imageUrl);

        // Phát tín hiệu real-time qua Socket.io
        const io = getIO();
        const payload = { ...message, sender: (req as any).user };
        
        if (receiverId) {
            io.to(`user_${receiverId}`).emit("new_message", payload);
        }
        io.to(`user_${userId}`).emit("new_message", payload);

        res.status(201).json({ success: true, data: message });
    } catch (error: any) {
        console.error("LỖI GỬI TIN NHẮN:", error);
        res.status(500).json({ success: false, message: error.message || "Lỗi máy chủ nội bộ" });
    }
};
