const { PrismaClient } = require('./server/src/generated/prisma');

const prisma = new PrismaClient();

async function checkAdmins() {
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: { id: true, email: true, fullName: true }
  });
  console.log('--- ADMIN LIST ---');
  console.log(JSON.stringify(admins, null, 2));
}

checkAdmins()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
