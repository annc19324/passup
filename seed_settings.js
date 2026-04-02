const { PrismaClient } = require('./server/src/generated/prisma');

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding settings via JS...');
    
    // Seed global background if not exists
    await prisma.systemSetting.upsert({
        where: { key: 'GLOBAL_BACKGROUND' },
        update: {},
        create: {
            key: 'GLOBAL_BACKGROUND',
            value: '#f8fafc'
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
        // Find by value instead of increment ID for idempotency
        const existing = await prisma.backgroundOption.findFirst({
            where: { value: opt.value }
        });
        if (!existing) {
            await prisma.backgroundOption.create({
                data: opt
            });
        }
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
