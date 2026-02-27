const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testFetchStudents() {
    console.log('Testing Fetch Students...');
    try {
        const where = {};
        const skip = 0;
        const limit = 10;

        console.log('Querying students in transaction...');
        const [students, total] = await prisma.$transaction([
            prisma.student.findMany({
                where,
                select: {
                    id: true,
                    userId: true,
                    matricNumber: true,
                    registrationNumber: true,
                    status: true,
                    personalInfo: {
                        select: {
                            firstname: true,
                            surname: true,
                            email: true
                        }
                    },
                    application: {
                        select: {
                            applicationNumber: true,
                            programType: true
                        }
                    },
                    programmes: {
                        where: { status: 'ADMITTED' },
                        include: {
                            program: {
                                select: {
                                    title: true,
                                    level: true
                                }
                            }
                        },
                        take: 1
                    },
                    user: {
                        select: {
                            email: true,
                            role: true
                        }
                    }
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.student.count({ where })
        ]);

        console.log('Students fetched successfully:', students.length);
        console.log('Total count:', total);
        console.log(JSON.stringify(students, null, 2));

    } catch (error) {
        console.error('❌ Error fetching students:', error.message);
        if (error.code) console.error('Code:', error.code);
        if (error.meta) console.error('Meta:', error.meta);
    } finally {
        await prisma.$disconnect();
    }
}

testFetchStudents();
