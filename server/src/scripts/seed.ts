import bcrypt from "bcrypt";
import prisma from "../config/db";

async function seed() {
    console.log("🌱 Seeding database...");

    const hashedPassword = await bcrypt.hash("12345", 10);

    // 1. Clear existing data
    await prisma.wishlist.deleteMany();
    await prisma.sentMessage.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.report.deleteMany();
    await prisma.user.deleteMany();

    // 2. Create Users
    // Lưu ý: Phone buộc phải unique do schema.prisma cấu hình @unique
    // Tôi sẽ dùng các đuôi số khác nhau cho từng tài khoản để không bị lỗi database.

    const admin = await prisma.user.create({
        data: {
            email: "admin@passup.com",
            username: "admin",
            phone: "0123456789",
            password: hashedPassword,
            fullName: "admin",
            role: "ADMIN",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
        },
    });

    const userDefault = await prisma.user.create({
        data: {
            email: "user@gmail.com",
            username: "user",
            phone: "0123456788",
            password: hashedPassword,
            fullName: "user",
            role: "USER",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=User"
        },
    });

    const userAn = await prisma.user.create({
        data: {
            email: "lethienan@gmail.com",
            username: "lethienan",
            phone: "0123456787",
            password: hashedPassword,
            fullName: "Lê Thiên An",
            role: "USER",
            avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=An"
        },
    });

    // 3. Create Categories
    const categories = [
        { name: "Đồ điện tử", slug: "do-dien-tu", icon: "Smartphone" },
        { name: "Thời trang", slug: "thoi-trang", icon: "Shirt" },
        { name: "Đồ gia dụng", slug: "do-gia-dung", icon: "Home" },
        { name: "Sách & Sở thích", slug: "sach-va-so-thich", icon: "Book" },
        { name: "Xe cộ", slug: "xe-co", icon: "Car" },
    ];

    for (const cat of categories) {
        await prisma.category.create({ data: cat });
    }

    const electronics = await prisma.category.findUnique({ where: { slug: "do-dien-tu" } });

    // 4. Create Products
    if (electronics) {
        await prisma.product.create({
            data: {
                title: "iPhone 13 Pro Max 256GB - Còn bảo hành",
                description: "Máy nữ dùng kỹ, không một vết xước. Full box đầy đủ phụ kiện.",
                price: 15500000,
                images: ["https://images.unsplash.com/photo-1632661674596-df8be070a5c5?q=80&w=1000"],
                sellerId: userAn.id,
                categoryId: electronics.id,
                status: "AVAILABLE",
                province: "Hồ Chí Minh",
                district: "Quận 1",
                slug: "iphone-13-pro-max-" + Date.now(),
                isHighlight: true
            }
        });

        await prisma.product.create({
            data: {
                title: "Bàn phím cơ AKKO 3068v2",
                description: "Switch Blue, gõ rất sướng tay. Phù hợp cho dân văn phòng hoặc gamer.",
                price: 1200000,
                images: ["https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?q=80&w=1000"],
                sellerId: userDefault.id,
                categoryId: electronics.id,
                status: "AVAILABLE",
                province: "Hà Nội",
                district: "Cầu Giấy",
                slug: "ban-phim-akko-" + Date.now()
            }
        });
    }

    console.log("🌱 Seed completed successfully!");
}

seed()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
