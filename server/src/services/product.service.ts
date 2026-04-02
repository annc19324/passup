import prisma from "../config/db";
import cloudinary from "../utils/cloudinary";
import { slugify } from "../utils/slugify";

// Service Đăng Món Đồ Mới (Create Product)
export const createProduct = async (
    sellerId: number,
    data: { title: string; description: string; price: number; categoryId: number, province?: string, district?: string, ward?: string, addressDetail?: string, allowPickup?: boolean, allowShip?: boolean, shipPrice?: string, stock?: number },
    files: Express.Multer.File[]
) => {
    // 0. Kiểm tra Hạn mức (Monetization)
    const user = await prisma.user.findUnique({ where: { id: sellerId } });
    if (!user) throw new Error("User không tồn tại");

    const now = new Date();
    
    // Giới hạn 5 hình ảnh (Admin được tối đa 10)
    if (files && files.length > (user.role === 'ADMIN' ? 15 : 5)) {
        throw new Error(`Tối đa ${user.role === 'ADMIN' ? 15 : 5} hình ảnh cho mỗi tin đăng`);
    }

    if (user.subscriptionType === "FREE") {
        if (user.postLimit > 0) {
            // Sử dụng lượt đăng tin đã mua
            await prisma.user.update({
                where: { id: sellerId },
                data: { postLimit: { decrement: 1 }, lastPostAt: now }
            });
        } else if (user.role !== 'ADMIN') {
            // Kiểm tra hạn mức 3 ngày 1 tin (Chỉ áp dụng cho User thường)
            if (user.lastPostAt) {
                const diffDays = (now.getTime() - new Date(user.lastPostAt).getTime()) / (1000 * 3600 * 24);
                if (diffDays < 3) throw new Error("Gói MIỄN PHÍ: Bạn chỉ có thể đăng 1 tin mỗi 3 ngày hoặc mua thêm lượt đăng tin.");
            }
            // Cập nhật ngày đăng cuối cho lượt miễn phí
            await prisma.user.update({
                where: { id: sellerId },
                data: { lastPostAt: now }
            });
        }
    } else {
        // Kiểm tra hết hạn PRO
        if (user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt) < now) {
            await prisma.user.update({ where: { id: sellerId }, data: { subscriptionType: "FREE" } });
            throw new Error("Gói PRO của bạn đã hết hạn. Vui lòng gia hạn.");
        }

        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const postCount = await prisma.product.count({
            where: { sellerId, createdAt: { gte: firstDayOfMonth } }
        });

        if (user.subscriptionType === "PRO_30" && postCount >= 30) throw new Error("Gói CHUYÊN NGHIỆP 1: Bạn đã đạt giới hạn 30 tin/tháng.");
        if (user.subscriptionType === "PRO_200" && postCount >= 200) throw new Error("Gói CHUYÊN NGHIỆP 2: Bạn đã đạt giới hạn 200 tin/tháng.");

        // Cập nhật ngày đăng cuối
        await prisma.user.update({
            where: { id: sellerId },
            data: { lastPostAt: now }
        });
    }

    // 1. Upload hình ảnh
    const imageUrls: string[] = [];

    if (files && files.length > 0) {
        for (const file of files) {
            const b64 = Buffer.from(file.buffer).toString("base64");
            const dataURI = "data:" + file.mimetype + ";base64," + b64;

            const uploadResponse = await cloudinary.uploader.upload(dataURI, {
                folder: 'passup_products',
                resource_type: 'image',
                width: 800,
                height: 800,
                crop: 'fill',
                gravity: 'center'
            });
            imageUrls.push(uploadResponse.secure_url);
        }
    }

    // 2. Lưu Database
    const product = await prisma.product.create({
        data: {
            title: data.title,
            description: data.description,
            price: data.price,
            categoryId: data.categoryId, 
            sellerId: sellerId,
            images: imageUrls,
            slug: `${slugify(data.title)}-${Date.now()}`,
            province: data.province,
            district: data.district,
            ward: data.ward,
            addressDetail: data.addressDetail,
            allowPickup: data.allowPickup ?? true,
            allowShip: data.allowShip ?? false,
            shipPrice: data.shipPrice,
            stock: data.stock || 1,
            pushedAt: now
        }
    });

    return product;
};

// Lấy danh sách sản phẩm (có thể lọc theo từ khóa, danh mục, địa điểm)
export const getAllProducts = async (filters: { q?: string; categoryId?: number; province?: string, district?: string, ward?: string, currentUserId?: number }) => {
    const { q, categoryId, province, district, ward, currentUserId } = filters;

    const products = await prisma.product.findMany({
        where: {
            AND: [
                q ? {
                    title: {
                        contains: q,
                        mode: 'insensitive'
                    }
                } : {},
                categoryId ? { categoryId } : {},
                province ? { province } : {},
                district ? { district } : {},
                ward ? { ward } : {}
            ]
        },
        orderBy: [
            { status: 'asc' }, 
            { isHighlight: 'desc' },
            { pushedAt: 'desc' },
            { createdAt: 'desc' }
        ], 
        include: {
            category: { select: { name: true, slug: true } },
            seller: { select: { fullName: true, address: true, avatar: true } }
        }
    });

    if (currentUserId) {
        const wishlist = await prisma.wishlist.findMany({
            where: { userId: currentUserId },
            select: { productId: true }
        });
        const wishlistIds = new Set(wishlist.map(w => w.productId));
        return products.map(p => ({
            ...p,
            isWishlisted: wishlistIds.has(p.id)
        }));
    }

    return products;
};

// ... giữ nguyên các hàm còn lại bên dưới ...
export const getProductById = async (id: number, currentUserId?: number) => {
    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            category: { select: { name: true, slug: true } },
            seller: { select: { id: true, fullName: true, email: true, address: true, avatar: true } }
        }
    });

    if (product && currentUserId) {
        const wish = await prisma.wishlist.findUnique({
            where: { userId_productId: { userId: currentUserId, productId: id } }
        });
        return { ...product, isWishlisted: !!wish };
    }

    return product;
};

export const getProductBySlug = async (slug: string, currentUserId?: number) => {
    const product = await prisma.product.findUnique({
        where: { slug },
        include: {
            category: { select: { name: true, slug: true } },
            seller: { select: { id: true, fullName: true, email: true, address: true, avatar: true } }
        }
    });

    if (product && currentUserId) {
        const wish = await prisma.wishlist.findUnique({
            where: { userId_productId: { userId: currentUserId, productId: product.id } }
        });
        return { ...product, isWishlisted: !!wish };
    }

    return product;
};

export const getProductsBySeller = async (sellerId: number) => {
    return await prisma.product.findMany({
        where: { sellerId },
        orderBy: { createdAt: 'desc' },
        include: {
            category: { select: { name: true } }
        }
    });
};

export const deleteProduct = async (id: number) => {
    return await prisma.product.delete({
        where: { id }
    });
};

export const updateProduct = async (id: number, data: { title?: string, description?: string, price?: number, status?: any, province?: string, district?: string, ward?: string, addressDetail?: string }) => {
    return await prisma.product.update({
        where: { id },
        data
    });
};
