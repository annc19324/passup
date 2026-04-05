import bcrypt from "bcrypt";
import prisma from "../config/db";

async function seed() {
    console.log("🌱 Seeding database...");

    const hashedPassword = await bcrypt.hash("12345", 10);

    // Tạo tài khoản Admin
    const admin = await prisma.user.upsert({
        where: { email: "admin" },
        update: {},
        create: {
            email: "admin",
            password: hashedPassword,
            fullName: "Quản trị viên",
            role: "ADMIN",
        },
    });
    console.log(`✅ Admin created: email=admin, password=12345 (id=${admin.id})`);

    // Tạo tài khoản User
    const user = await prisma.user.upsert({
        where: { email: "user" },
        update: {},
        create: {
            email: "user",
            password: hashedPassword,
            fullName: "Người dùng mẫu",
            role: "USER",
        },
    });
    console.log(`✅ User created: email=user, password=12345 (id=${user.id})`);

    console.log("🌱 Seed completed!");
}

seed()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
