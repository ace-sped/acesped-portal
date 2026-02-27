const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createStudent() {
    console.log('Creating Student...');
    try {
        const student = await prisma.student.create({
            data: {
                matricNumber: 'TEST/2026/001',
                status: 'ACTIVE',
                personalInfo: {
                    create: {
                        email: 'student@test.com',
                        firstname: 'Test',
                        surname: 'Student',
                        dateOfBirth: '1990-01-01',
                        gender: 'Male',
                        address: 'Test Address',
                        nationality: 'Test',
                        phoneNumber: '1234567890',
                        homeAddress: 'Test',
                        homeTown: 'Test',
                        city: 'Test',
                        state: 'Test',
                        country: 'Test',
                        religion: 'Test'
                    }
                }
            }
        });

        console.log('✅ Student created:', student.id);
    } catch (error) {
        console.error('❌ Error creating student:', error);
    } finally {
        await prisma.$disconnect();
    }
}

createStudent();
