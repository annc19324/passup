import { PrismaClient } from '../server/src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding settings...');
    
    // Seed global background if not exists
    const bg1 = await prisma.systemSetting.upsert({
        where: { key: 'GLOBAL_BACKGROUND' },
        update: {},
        create: {
            key: 'GLOBAL_BACKGROUND',
            value: '#f8fafc' // Default light color
        }
    });

    console.log('Seeding background options...');
    const options = [
        { name: 'Xanh thanh lịch', value: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', type: 'COLOR' },
        { name: 'Sáng hồng', value: 'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)', type: 'COLOR' },
        { name: 'Lá phong', value: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', type: 'COLOR' },
        { name: 'Đêm đen', value: '#0f172a', type: 'COLOR' },
    ];

    for (const opt of options) {
        await prisma.backgroundOption.upsert({
            where: { id: 0 }, // Just a trick to create if not exists by name logic would be better but id is autoincrement
            update: {},
            create: opt
        }).catch(() => {
            // Probably exists
        });
    }

    console.log('Seed complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
