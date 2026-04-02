import { Router } from "express";
import { protect } from "../middleware/auth.middleware";
import { getMyConversations, getChatMessages, startConversation, sendChatMessage } from "../controllers/chat.controller";

const router = Router();

// Lấy danh sách cuộc hội thoại
router.get("/conversations", protect, getMyConversations);

// Lấy tin nhắn trong 1 cuộc hội thoại
router.get("/messages/:conversationId", protect, getChatMessages);

// Bắt đầu 1 cuộc hội thoại mới (hoặc lấy cái cũ)
router.post("/start", protect, startConversation);

import { upload } from "../middleware/upload.middleware";

// Gửi tin nhắn (hỗ trợ cả text và image)
router.post("/send", protect, upload.single("image"), sendChatMessage);

export default router;
