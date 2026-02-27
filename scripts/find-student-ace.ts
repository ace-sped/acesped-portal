
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const id = 'ACE2025232RFRG';
    console.log(`Searching for student with Identifier: ${id}`);

    // Check Student model (matric or app id)
    const student = await prisma.student.findFirst({
        where: {
            OR: [
                { matricNumber: id },
                { applicationId: id }, // unlikely to match direct string if it's a UUID link, but maybe schema differs
                { application: { applicationNumber: id } } // if linked via relations check
            ]
        },
        include: {
            personalInfo: true,
            programmes: { include: { program: true } }
        }
    });

    if (student) {
        console.log(`Found Student: ID=${student.id}`);
        console.log(`User Email: ${student.personalInfo?.email}`);
        console.log(`Matric: ${student.matricNumber}`);
        console.log(`Programmes: ${student.programmes.length}`);
        student.programmes.forEach(p => console.log(` - ${p.program.title} (${p.status})`));
    } else {
        console.log('Student not found with this identifier.');
    }

    // Also check keys in Application table directly
    const app = await prisma.application.findFirst({
        where: { applicationNumber: id }
    });
    if (app) {
        console.log(`Found Application with number ${id}: ${app.firstname} ${app.surname}`);
    } else {
        console.log(`No Application found with number ${id}`);
    }

}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
