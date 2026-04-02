import prisma from "../config/db";

// Thêm hoặc Xóa sản phẩm khỏi danh sách yêu thích
export const toggleWishlist = async (userId: number, productId: number) => {
    // 1. Kiểm tra xem đã có trong Wishlist chưa
    const existing = await prisma.wishlist.findUnique({
        where: {
            userId_productId: { userId, productId }
        }
    });

    if (existing) {
        // Nếu đã có -> Xóa
        await prisma.wishlist.delete({
            where: { id: existing.id }
        });
        return { isWishlisted: false };
    } else {
        // Nếu chưa có -> Thêm mới
        await prisma.wishlist.create({
            data: { userId, productId }
        });
        return { isWishlisted: true };
    }
};

// Lấy danh sách sản phẩm yêu thích của người dùng
export const getWishlistByUser = async (userId: number) => {
    return await prisma.wishlist.findMany({
        where: { userId },
        include: {
            product: {
                include: {
                    category: { select: { name: true } },
                    seller: { select: { fullName: true, address: true } }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
};

// Kiểm tra nhanh xem 1 sản phẩm có được user này thích không
export const checkIsWishlisted = async (userId: number, productId: number) => {
    const item = await prisma.wishlist.findUnique({
        where: {
            userId_productId: { userId, productId }
        }
    });
    return !!item;
};
