import prisma from "../config/db";

export const getConversations = async (userId: number) => {
    return await prisma.conversation.findMany({
        where: {
            OR: [
                { user1Id: userId },
                { user2Id: userId }
            ]
        },
        include: {
            user1: { select: { id: true, fullName: true, avatar: true } },
            user2: { select: { id: true, fullName: true, avatar: true } },
            product: { select: { id: true, title: true, images: true, price: true } },
            messages: {
                orderBy: { createdAt: 'desc' },
                take: 1
            }
        },
        orderBy: { lastMessageAt: 'desc' }
    });
};

export const getMessages = async (conversationId: number, limit: number = 50, offset: number = 0) => {
    return await prisma.sentMessage.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
            sender: { select: { id: true, fullName: true, avatar: true } }
        }
    });
};

export const sendMessage = async (conversationId: number, senderId: number, text: string, image?: string) => {
    // 1. Tạo tin nhắn mới
    const message = await prisma.sentMessage.create({
        data: {
            conversationId,
            senderId,
            text,
            image
        },
        include: {
            sender: { select: { id: true, fullName: true, avatar: true } }
        }
    });

    // 2. Cập nhật thời gian tin nhắn cuối cùng trong conversation
    await prisma.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: new Date() }
    });

    return message;
};

export const getOrCreateConversation = async (user1Id: number, user2Id: number, productId?: number) => {
    // Tìm cuộc hội thoại đã có giữa 2 người về sản phẩm này
    let conversation = await prisma.conversation.findFirst({
        where: {
            AND: [
                { user1Id: { in: [user1Id, user2Id] } },
                { user2Id: { in: [user1Id, user2Id] } },
                { productId: productId || null }
            ]
        }
    });

    if (!conversation) {
        conversation = await prisma.conversation.create({
            data: {
                user1Id,
                user2Id,
                productId: productId || null
            }
        });
    }

    return conversation;
};
