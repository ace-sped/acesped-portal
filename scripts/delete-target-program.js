
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const programTitle = "M.Ed Special Education";

    console.log(`Searching for program: "${programTitle}"...`);

    const program = await prisma.program.findFirst({
        where: {
            title: {
                equals: programTitle,
                mode: 'insensitive'
            }
        }
    });

    if (!program) {
        console.log(`Program "${programTitle}" not found.`);
        return;
    }

    console.log(`Found program: ${program.title} (ID: ${program.id})`);

    // 1. Delete Student Programmes
    const spCount = await prisma.studentProgramme.count({
        where: { programId: program.id }
    });

    if (spCount > 0) {
        console.log(`Deleting ${spCount} associated student programme records...`);
        await prisma.studentProgramme.deleteMany({
            where: { programId: program.id }
        });
    }

    // 2. Delete Courses (Cascade handles it, but good to be safe/aware)
    // Schema says: program Program @relation(..., onDelete: Cascade)
    // So courses will go automatically.

    // 3. Delete Program
    console.log('Deleting program...');
    await prisma.program.delete({
        where: { id: program.id }
    });

    console.log(`Successfully deleted "${programTitle}" and its dependencies.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
