const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedLecturers() {
    console.log('\n=================================');
    console.log('Seeding Lecturers (Standalone Table)');
    console.log('=================================\n');

    try {
        const password = await bcrypt.hash('lecturer123', 10);
        const email = 'lecturer@aceportal.com';

        // Check if lecturer exists
        const existingLecturer = await prisma.lecturer.findFirst({
            where: { email }
        });

        if (existingLecturer) {
            console.log('Lecturer already exists:', existingLecturer.email);
            // Optional: Update password or details
            await prisma.lecturer.update({
                where: { id: existingLecturer.id },
                data: {
                    password: password,
                    firstname: 'John',
                    surname: 'Doe',
                    // other updates if needed
                }
            });
            console.log('✅ Lecturer updated.');
        } else {
            const lecturer = await prisma.lecturer.create({
                data: {
                    email,
                    password,
                    firstname: 'John',
                    surname: 'Doe',
                    role: 'Lecturer',
                    staffId: 'L001',
                    department: 'Special Education',
                    faculty: 'Education',
                    status: 'ACTIVE',
                    // Professional Details
                    title: 'Dr.',
                    qualification: 'PhD in Special Education',
                    specialization: 'Inclusive Education',
                    employmentType: 'Full Time',
                    appointmentDate: new Date(),
                    bio: 'Experienced lecturer in special needs education.',
                }
            });
            console.log('✅ Lecturer created:', lecturer.email);
        }

        console.log('\n=================================');
        console.log('Lecturer Seeded Successfully!');
        console.log('=================================');
        console.log('\nLogin Credentials:');
        console.log('----------------------------------');
        console.log('Lecturer:');
        console.log('  Email: lecturer@aceportal.com');
        console.log('  Password: lecturer123');
        console.log('  Portal: http://localhost:3000/lecturer-login');
        console.log('=================================\n');

    } catch (error) {
        console.error('\n❌ Error seeding lecturers:', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedLecturers();
