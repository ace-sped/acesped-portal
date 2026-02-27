const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedLecturers() {
    console.log('\n=================================');
    console.log('Seeding Lecturers');
    console.log('=================================\n');

    try {
        const lecturers = [
            {
                email: 'dr.john.doe@aceportal.com',
                firstname: 'John',
                surname: 'Doe',
                password: 'lecturer123',
                title: 'Dr.',
                staffId: 'LEC001',
                department: 'Special Education',
                faculty: 'Education',
                qualification: 'PhD in Special Education',
                specialization: 'Inclusive Education',
                employmentType: 'Full Time',
                status: 'ACTIVE',
            },
            {
                email: 'prof.jane.smith@aceportal.com',
                firstname: 'Jane',
                surname: 'Smith',
                password: 'lecturer123',
                title: 'Prof.',
                staffId: 'LEC002',
                department: 'Special Education',
                faculty: 'Education',
                qualification: 'PhD in Educational Psychology',
                specialization: 'Learning Disabilities',
                employmentType: 'Full Time',
                status: 'ACTIVE',
            },
            {
                email: 'dr.michael.brown@aceportal.com',
                firstname: 'Michael',
                surname: 'Brown',
                password: 'lecturer123',
                title: 'Dr.',
                staffId: 'LEC003',
                department: 'Special Education',
                faculty: 'Education',
                qualification: 'PhD in Autism Studies',
                specialization: 'Autism Spectrum Disorders',
                employmentType: 'Part Time',
                status: 'ACTIVE',
            },
        ];

        let createdCount = 0;
        let existingCount = 0;

        for (const lecturerData of lecturers) {
            const existingLecturer = await prisma.lecturer.findUnique({
                where: { email: lecturerData.email },
            });

            if (existingLecturer) {
                console.log(`⚠️  Lecturer already exists: ${lecturerData.email}`);
                existingCount++;
            } else {
                const hashedPassword = await bcrypt.hash(lecturerData.password, 10);
                await prisma.lecturer.create({
                    data: {
                        ...lecturerData,
                        password: hashedPassword,
                        role: 'Lecturer',
                    },
                });
                console.log(`✅ Created lecturer: ${lecturerData.email}`);
                createdCount++;
            }
        }

        console.log('\n=================================');
        console.log('Lecturer Seeding Complete!');
        console.log('=================================');
        console.log(`Created: ${createdCount} lecturer(s)`);
        console.log(`Already existed: ${existingCount} lecturer(s)`);
        console.log(`Total: ${lecturers.length} lecturer(s)`);
        console.log('\nDefault Password: lecturer123');
        console.log('=================================\n');

    } catch (error) {
        console.error('\n❌ Error seeding lecturers:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seedLecturers();
