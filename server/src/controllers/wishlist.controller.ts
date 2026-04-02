import { Request, Response } from "express";
import * as WishlistService from "../services/wishlist.service";

// Thêm/Xóa sản phẩm yêu thích (Toggle)
export const toggleWishlist = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const productId = parseInt(req.body.productId, 10);

        if (!productId) {
            res.status(400).json({ success: false, message: "Thiếu ID sản phẩm" });
            return;
        }

        const result = await WishlistService.toggleWishlist(userId, productId);
        res.status(200).json({ success: true, data: result });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Lấy danh sách yêu thích
export const getMyWishlist = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const wishlist = await WishlistService.getWishlistByUser(userId);
        
        // Map lại kết quả trả về đúng format sản phẩm
        const products = wishlist.map(item => ({
            ...item.product,
            wishlistDate: item.createdAt
        }));

        res.status(200).json({ success: true, count: products.length, data: products });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Kiểm tra trạng thái yêu thích của 1 sản phẩm
export const checkWishlistStatus = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const productId = parseInt(req.params.id as string, 10);

        const isWishlisted = await WishlistService.checkIsWishlisted(userId, productId);
        res.status(200).json({ success: true, data: { isWishlist: isWishlisted } });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
