
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Checking for Student users without Student records...');

        // 1. Find users with role 'Student' (or similar if you use lower case) - checking both
        // 1. Find users with role 'Student'
        const users = await prisma.user.findMany({
            where: {
                role: { in: ['Student', 'student', 'STUDENT'] }
            }
        });

        console.log(`Found ${users.length} users with 'Student' role.`);

        let countFixed = 0;

        // 2. Ensure we have a Program
        let program = await prisma.program.findFirst();
        if (!program) {
            // ... simplify program creation logic if needed, or assume it exists/create simple one
            console.log('No programs found. Please ensure programs exist.');
            return;
        }

        // 3. Process users
        for (const user of users) {
            // Check if student record exists via personalInfo email
            const existingStudent = await prisma.student.findFirst({
                where: {
                    personalInfo: {
                        email: user.email
                    }
                }
            });

            if (!existingStudent) {
                console.log(`Fixing user: ${user.email} (No Student record found)...`);

                const student = await prisma.student.create({
                    data: {
                        personalInfo: {
                            create: {
                                email: user.email,
                                firstname: user.firstname || 'Student',
                                surname: user.surname || 'User',
                                dateOfBirth: '2000-01-01',
                                gender: 'Not Specified',
                                nationality: 'Nigerian',
                                phoneNumber: user.phoneNumber || '0000000000',
                                address: 'Campus',
                                homeAddress: 'Home',
                                homeTown: 'Town',
                                city: 'City',
                                state: 'State',
                                country: 'Country',
                                religion: 'Christianity',
                                postalCode: '000000',

                            }
                        }
                    }
                });

                // Link to Program
                await prisma.studentProgramme.create({
                    data: {
                        studentId: student.id,
                        programId: program.id,
                        admissionSession: '2024/2025',
                        modeOfStudy: 'Full-time',
                        status: 'ADMITTED'
                    }
                });

                countFixed++;
                console.log(`  -> Created Student record (${student.id}).`);
            }
        }

        console.log(`Fixed ${countFixed} student records.`);

        console.log('Done!');

    } catch (error) {
        console.error('Error fixing student records:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
