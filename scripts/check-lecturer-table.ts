import { prisma } from '@/lib/prisma';

async function main() {
    try {
        // Try to count lecturers
        const count = await prisma.lecturer.count();
        console.log(`Lecturer table exists. Total lecturers: ${count}`);

        // Try to fetch all lecturers
        const lecturers = await prisma.lecturer.findMany({
            take: 5,
        });
        console.log('Sample lecturers:', JSON.stringify(lecturers, null, 2));
    } catch (error: any) {
        console.error('Error accessing Lecturer table:', error.message);
        console.error('Full error:', error);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
