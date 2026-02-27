
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        // Note: User model has no 'student' relation in this schema; listing users with role Student
        console.log('Listing users with role Student...');
        const users = await prisma.user.findMany({
            where: {
                role: 'Student',
            },
            select: {
                email: true,
                role: true,
                id: true,
            },
        });

        console.log(`Found ${users.length} users with role Student.`);
        users.forEach(u => console.log(` - ${u.email} [${u.role}]`));

        // Fix logic: Fix the first one that looks like a regular user or student
        const target = users.find(u => u.role === 'Student' || u.role === 'User' || u.email.includes('student'));

        if (target) {
            console.log(`\nFixing user: ${target.email}...`);
            // Ensure Program exists
            let program = await prisma.program.findFirst();
            if (!program) {
                // Simplified creation if not exists (relying on previous script or manual check if previous run didn't create it due to early return)
                // But previous script setup program logic was sound, just didn't run because no user matched.
                // Let's just grab the first service and create a program if needed.
                const service = await prisma.service.findFirst() || await prisma.service.create({ data: { title: 'Service', slug: 'srv', description: 'Desc' } });
                program = await prisma.program.create({
                    data: { title: 'M.Ed Special Education', slug: 'med-special-ed-2', level: 'MASTERS' as any, overview: '.', serviceId: service.id }
                });
            }

            // Ensure courses
            const coursesCount = await prisma.course.count({ where: { programId: program.id } });
            if (coursesCount === 0) {
                await prisma.course.create({
                    data: { title: 'Intro Course', slug: 'intro-101', programId: program.id, courseCode: 'INT 101', creditHours: 3, courseType: 'Core', overview: 'Intro overview' }
                });
            }

            // Create Student (no userId on Student in this schema)
            const student = await prisma.student.create({
                data: {
                    personalInfo: {
                        create: {
                            email: target.email,
                            firstname: 'Fixed',
                            surname: 'Student',
                            dateOfBirth: '2000-01-01',
                            gender: 'M',
                            nationality: 'NG',
                            phoneNumber: '123',
                            address: 'Addr',
                            homeAddress: 'Home',
                            homeTown: 'Town',
                            city: 'City',
                            state: 'State',
                            country: 'Country',
                            religion: 'Religion'
                        }
                    }
                }
            });

            await prisma.studentProgramme.create({
                data: {
                    studentId: student.id,
                    programId: program.id,
                    admissionSession: '2024/2025',
                    modeOfStudy: 'Full-time'
                }
            });
            console.log('Fixed!');
        } else {
            console.log('No suitable target found to fix automatically.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
