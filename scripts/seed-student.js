
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Seeding Student User...');

        // 1. Create User
        const password = bcrypt.hashSync('student123', 10);
        const user = await prisma.user.upsert({
            where: { email: 'student@aceportal.com' },
            update: {},
            create: {
                email: 'student@aceportal.com',
                firstname: 'Test',
                surname: 'Student',
                password: password,
                role: 'Student'
            }
        });
        console.log(`User created: ${user.email}`);

        // 2. Ensure Program
        let service = await prisma.service.findFirst({ where: { slug: 'postgraduate' } });
        if (!service) {
            service = await prisma.service.create({
                data: {
                    title: 'Postgraduate Studies',
                    slug: 'postgraduate',
                    description: 'PG Studies'
                }
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

        // 3. Ensure Courses
        const coursesData = [
            { code: 'ACE 701', title: 'Advanced Research Methods', units: 3, type: 'Core' },
            { code: 'ACE 712', title: 'Innovation in Special Education', units: 2, type: 'Elective' },
            { code: 'ACE 725', title: 'Inclusive Classroom Practices', units: 3, type: 'Core' }
        ];

        for (const c of coursesData) {
            await prisma.course.upsert({
                where: { slug: c.code.toLowerCase().replace(' ', '-') },
                update: {},
                create: {
                    title: c.title,
                    slug: c.code.toLowerCase().replace(' ', '-'),
                    courseCode: c.code,
                    creditHours: c.units,
                    courseType: c.type,
                    programId: program.id,
                    overview: '.',
                    displayOrder: 1
                }
            });
        }

        // 4. Create Student Record
        const student = await prisma.student.upsert({
            where: { userId: user.id },
            update: {},
            create: {
                userId: user.id,
                personalInfo: {
                    create: {
                        email: user.email,
                        firstname: user.firstname,
                        surname: user.surname,
                        dateOfBirth: '2000-01-01',
                        gender: 'Male',
                        nationality: 'Nigerian',
                        phoneNumber: '08000000000',
                        address: 'Lagos',
                        homeAddress: 'Lagos',
                        homeTown: 'Lagos',
                        city: 'Lagos',
                        state: 'Lagos',
                        country: 'Nigeria',
                        religion: 'Christianity'
                    }
                }
            }
        });

        // 5. Link Program
        // Check if already linked
        const existingProg = await prisma.studentProgramme.findFirst({ where: { studentId: student.id } });
        if (!existingProg) {
            await prisma.studentProgramme.create({
                data: {
                    studentId: student.id,
                    programId: program.id,
                    admissionSession: '2024/2025',
                    modeOfStudy: 'Full-time',
                    status: 'ADMITTED'
                }
            });
        }

        console.log('✅ Student seeded successfully!');
        console.log('Login: student@aceportal.com / student123');

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
