const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedLecturers() {
    console.log('\n=================================');
    console.log('Seeding Lecturer Users');
    console.log('=================================\n');

    try {
        const lecturers = [
            {
                email: 'john.doe@aceportal.com',
                firstname: 'John',
                surname: 'Doe',
                password: 'lecturer123',
            },
            {
                email: 'jane.smith@aceportal.com',
                firstname: 'Jane',
                surname: 'Smith',
                password: 'lecturer123',
            },
            {
                email: 'michael.brown@aceportal.com',
                firstname: 'Michael',
                surname: 'Brown',
                password: 'lecturer123',
            },
        ];

        let createdCount = 0;
        let existingCount = 0;

        for (const lecturerData of lecturers) {
            const existingUser = await prisma.user.findUnique({
                where: { email: lecturerData.email },
            });

            if (existingUser) {
                console.log(`⚠️  Lecturer already exists: ${lecturerData.email}`);
                existingCount++;
            } else {
                const hashedPassword = await bcrypt.hash(lecturerData.password, 10);
                await prisma.user.create({
                    data: {
                        email: lecturerData.email,
                        firstname: lecturerData.firstname,
                        surname: lecturerData.surname,
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
