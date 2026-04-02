const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    console.log("Start seeding...");

    // Create Admin User
    const adminEmail = "annc19324@gmail.com";
    const hashedPassword = await bcrypt.hash("Zeanokai@1", 10);
    
    try {
        const user = await prisma.user.upsert({
            where: { email: adminEmail },
            update: {
                role: 'ADMIN',
                pushCount: 100,
                postLimit: 100,
                status: 'ACTIVE'
            },
            create: {
                email: adminEmail,
                password: hashedPassword,
                fullName: "Admin PassUp",
                role: "ADMIN",
                pushCount: 100,
                postLimit: 100,
                status: "ACTIVE"
            }
        });
        console.log("Admin user created/updated:", user.email);

        // Seed Categories
        const categories = [
            { name: "Đồ điện tử", slug: "do-dien-tu" },
            { name: "Điện thoại", slug: "dien-thoai" },
            { name: "Đồ 0đ", slug: "do-0-dong" },
            { name: "Sách & Giáo trình", slug: "sach-giao-trinh" },
            { name: "Thời trang", slug: "thoi-trang" },
            { name: "Nội thất", slug: "noi-that" },
            { name: "Phương tiện", slug: "phuong-tien" },
        ];

        for (const cat of categories) {
            await prisma.category.upsert({
                where: { slug: cat.slug },
                update: {},
                create: cat,
            });
        }
        console.log("Categories seeded");

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
