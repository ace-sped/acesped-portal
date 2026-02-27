
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const applications = await prisma.application.findMany({
            select: {
                programType: true,
            },
            distinct: ['programType'],
        });

        console.log('Distinct Program Types in Application:', applications.map(a => a.programType));

        // Also check students and their related application programTypes
        const students = await prisma.student.findMany({
            select: {
                matricNumber: true,
                application: {
                    select: {
                        programType: true
                    }
                }
            },
            take: 10
        });
        console.log('Sample Students app program types:', students);

    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
