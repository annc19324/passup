// server/src/scripts/seed-categories.ts
import { PrismaClient } from '@prisma/client';
import slugify from 'slugify';

const prisma = new PrismaClient();

const defaultCategories = [
    { name: 'Đồ điện tử', icon: 'Smartphone' },
    { name: 'Xe cộ', icon: 'Car' },
    { name: 'Thời trang', icon: 'Shirt' },
    { name: 'Đồ gia dụng', icon: 'Home' },
    { name: 'Bất động sản', icon: 'Building' },
    { name: 'Thú cưng', icon: 'Hamster' },
    { name: 'Giải trí, Thể thao', icon: 'Gamepad' },
    { name: 'Công việc', icon: 'Briefcase' },
    { name: 'Khác', icon: 'LayoutGrid' }
];

async function main() {
    console.log('--- KHỞI TẠO DANH MỤC MẶC ĐỊNH ---');
    
    for (const cat of defaultCategories) {
        const slug = slugify(cat.name, { lower: true, locale: 'vi' });
        await (prisma.category as any).upsert({
            where: { slug: slug },
            update: { icon: cat.icon },
            create: {
                name: cat.name,
                slug: slug,
                icon: cat.icon,
                isActive: true
            }
        });
        console.log(`✅ Đã thêm: ${cat.name}`);
    }
    
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
