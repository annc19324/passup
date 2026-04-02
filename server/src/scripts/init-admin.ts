// server/src/scripts/init-admin.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const adminEmail = 'annc19324@gmail.com';
    const adminPass = '123456';
    const hashedPassword = await bcrypt.hash(adminPass, 10);

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            role: 'ADMIN',
            password: hashedPassword,
            fullName: 'Admin PassUp'
        },
        create: {
            email: adminEmail,
            password: hashedPassword,
            fullName: 'Admin PassUp',
            role: 'ADMIN'
        }
    });

    console.log('--- KHỞI TẠO ADMIN THÀNH CÔNG ---');
    console.log(`Email: ${admin.email}`);
    console.log(`Mật khẩu: ${adminPass}`);
    console.log('--------------------------------');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
