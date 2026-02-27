
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Fetching lecturers...');
    const lecturers = await prisma.user.findMany({
        where: {
            OR: [
                { role: { equals: 'Lecturer', mode: 'insensitive' } },
                { role: { equals: 'Faculty', mode: 'insensitive' } }
            ]
        },
        select: {
            id: true,
            email: true,
            firstname: true,
            surname: true,
            role: true
        }
    });

    console.log(`Found ${lecturers.length} lecturers/faculty users:`);
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
