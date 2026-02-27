
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const targetMatric = 'ACE2025232RFRG';
    console.log(`Setting up student with Matric Number: ${targetMatric}`);

    try {
        // 1. Get the Service and Program
        let service = await prisma.service.findFirst({ where: { slug: 'postgraduate' } });
        if (!service) {
            service = await prisma.service.create({
                data: { title: 'Postgraduate Studies', slug: 'postgraduate', description: 'PG' }
            });
        }

        let program = await prisma.program.upsert({
            where: { slug: 'med-special-education' },
            update: {},
            create: {
                title: 'M.Ed Special Education',
                slug: 'med-special-education',
                level: 'MASTERS',
                overview: 'Overview',
                serviceId: service.id,
                studyMode: 'Full-time'
            }
        });
        console.log(`Program: ${program.title} (${program.id})`);

        // 2. Ensure Courses exist
        const courses = [
            { code: 'ACE 801', title: 'Advanced Research Design', units: 3, type: 'Core' },
            { code: 'ACE 802', title: 'Statistical Methods in Education', units: 3, type: 'Core' },
            { code: 'ACE 815', title: 'Seminar in Special Education', units: 2, type: 'Core' },
            { code: 'ACE 822', title: 'Assistive Technologies', units: 2, type: 'Elective' }
        ];

        for (const c of courses) {
            await prisma.course.upsert({
                where: { slug: c.title.toLowerCase().replace(/ /g, '-') },
                update: {
                    programId: program.id
                },
                create: {
                    title: c.title,
                    slug: c.title.toLowerCase().replace(/ /g, '-'),
                    courseCode: c.code,
                    creditHours: c.units,
                    courseType: c.type,
                    programId: program.id,
                    overview: '...',
                    displayOrder: 1
                }
            });
        }
        console.log('Courses ensured.');

        // 3. Update the Test Student to use this Matric Number
        // We use the 'student@aceportal.com' user we created/know exists
        // 3. Update the Test Student to use this Matric Number
        // We use the 'student@aceportal.com' user we created/know exists
        const user = await prisma.user.findUnique({ where: { email: 'student@aceportal.com' } });
        if (!user) {
            console.error('Test user student@aceportal.com not found. Please run seed-student.js first.');
            // Fallback creation logic if needed, but let's assume it exists from previous step
            return;
        }

        // Find existing student by email (via PersonalInfo) or Matric
        let student = await prisma.student.findFirst({
            where: {
                OR: [
                    { matricNumber: targetMatric },
                    { personalInfo: { email: user.email } }
                ]
            }
        });

        if (student) {
            // Update existng student
            student = await prisma.student.update({
                where: { id: student.id },
                data: {
                    matricNumber: targetMatric
                }
            });
            console.log(`Student record updated for user ${user.email} with Matric ${targetMatric}`);
        } else {
            // Create new student
            student = await prisma.student.create({
                data: {
                    matricNumber: targetMatric,
                    personalInfo: {
                        create: {
                            email: user.email,
                            firstname: 'Target',
                            surname: 'Student',
                            dateOfBirth: '2000-01-01',
                            gender: 'M',
                            nationality: 'NG',
                            phoneNumber: '0000000000',
                            address: 'Addr',
                            homeAddress: 'Home',
                            homeTown: 'Town',
                            city: 'City',
                            state: 'State',
                            country: 'Country',
                            religion: 'Christianity'
                        }
                    }
                }
            });
            console.log(`Student record created for user ${user.email} with Matric ${targetMatric}`);
        }

        // 4. Ensure Program Link
        const progLink = await prisma.studentProgramme.findFirst({
            where: { studentId: student.id, programId: program.id }
        });

        if (!progLink) {
            await prisma.studentProgramme.create({
                data: {
                    studentId: student.id,
                    programId: program.id,
                    admissionSession: '2024/2025',
                    modeOfStudy: 'Full-time',
                    status: 'REGISTERED'
                }
            });
            console.log('Linked program to student.');
        } else {
            console.log('Student already linked to program.');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
