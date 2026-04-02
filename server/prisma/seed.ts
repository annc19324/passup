import prisma from "../src/config/db";
import bcrypt from "bcrypt";

async function main() {
    console.log("Start seeding...");

    // Create Admin User
    const adminEmail = "annc19324@gmail.com";
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
    
    if (!existingAdmin) {
        console.log("Creating admin user...");
        const hashedPassword = await bcrypt.hash("Zeanokai@1", 10);
        await prisma.user.create({
            data: {
                email: adminEmail,
                password: hashedPassword,
                fullName: "Admin PassUp",
                role: "ADMIN",
                pushCount: 100, // Give some default
                postLimit: 100,
                status: "ACTIVE"
            }
        });
    }

    console.log("Seeding categories...");
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

    console.log("Seeding finished.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
