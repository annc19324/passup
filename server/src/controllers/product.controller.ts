import { Request, Response } from "express";
import * as ProductService from "../services/product.service";

export const createProduct = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id; // Lấy từ Protect Middleware
        const { title, description, price, categoryId, province, district, ward, addressDetail, allowPickup, allowShip, shipPrice } = req.body;

        // Validation nhỏ
        if (!title || !price || !categoryId) {
            res.status(400).json({ success: false, message: "Nhập thiếu thông tin bắt buộc" });
            return;
        }

        // Multer đính kèm file upload vào `req.files` thay vì req.body
        const files = req.files as Express.Multer.File[];

        const newProduct = await ProductService.createProduct(
            userId,
            {
                title,
                description,
                price: parseFloat(price.toString().replace(/,/g, '')), 
                categoryId: parseInt(categoryId.toString(), 10),
                province,
                district,
                ward,
                addressDetail,
                allowPickup: allowPickup === 'true',
                allowShip: allowShip === 'true',
                shipPrice
            },
            files
        );

        res.status(201).json({ success: true, data: newProduct });
    } catch (error: any) {
        console.error("Lỗi đăng SP:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getProducts = async (req: Request, res: Response) => {
    try {
        const { q, categoryId, province, district, ward } = req.query;
        const currentUserId = (req as any).user?.id;
        const products = await ProductService.getAllProducts({
            q: q as string,
            categoryId: categoryId ? parseInt(categoryId as string, 10) : undefined,
            province: province as string,
            district: district as string,
            ward: ward as string,
            currentUserId
        });
        res.status(200).json({ success: true, count: products.length, data: products });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getProduct = async (req: Request, res: Response) => {
    try {
        const idOrSlug = req.params.id as string;
        const isNumericId = /^\d+$/.test(idOrSlug);
        const currentUserId = (req as any).user?.id;
        
        let product;
        if (isNumericId) {
            product = await ProductService.getProductById(parseInt(idOrSlug, 10), currentUserId);
        } else {
            product = await ProductService.getProductBySlug(idOrSlug, currentUserId);
        }

        if (!product) {
            res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
            return;
        }

        res.status(200).json({ success: true, data: product });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getMyProducts = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const products = await ProductService.getProductsBySeller(userId);
        res.status(200).json({ success: true, count: products.length, data: products });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const productId = parseInt(req.params.id as string, 10);
        const userId = (req as any).user.id;

        const product = await ProductService.getProductById(productId);
        if (!product) {
            res.status(404).json({ success: false, message: "Sản phẩm không tồn tại" });
            return;
        }

        if (product.sellerId !== userId && (req as any).user.role !== 'ADMIN') {
            res.status(403).json({ success: false, message: "Bạn không có quyền xóa sản phẩm này" });
            return;
        }

        await ProductService.deleteProduct(productId);
        res.status(200).json({ success: true, message: "Xóa sản phẩm thành công" });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const productId = parseInt(req.params.id as string, 10);
        const userId = (req as any).user.id;
        const { title, description, price, status, province, district, ward, addressDetail } = req.body;

        const product = await ProductService.getProductById(productId);
        if (!product) {
            res.status(404).json({ success: false, message: "Sản phẩm không tồn tại" });
            return;
        }

        if (product.sellerId !== userId && (req as any).user.role !== 'ADMIN') {
            res.status(403).json({ success: false, message: "Bạn không có quyền sửa sản phẩm này" });
            return;
        }

        const updated = await ProductService.updateProduct(productId, {
            title,
            description,
            price: price ? parseFloat(price.toString().replace(/,/g, '')) : undefined,
            status,
            province,
            district,
            ward,
            addressDetail
        });

        res.status(200).json({ success: true, data: updated });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
