import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const lecturers = await prisma.user.findMany({
        where: { role: 'Lecturer' },
        select: {
            id: true,
            email: true,
            firstname: true,
            surname: true,
            role: true,
            createdAt: true,
        }
    });

    console.log(`Found ${lecturers.length} lecturer(s) in the database:`);
    console.log(JSON.stringify(lecturers, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
