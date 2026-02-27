
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- Synchronizing Students with Applications & Programs ---');

        // 1. Get all Users who are 'Student' or have linked Student records
        // 1. Get all Users who are 'Student' or have linked Student records
        const students = await prisma.student.findMany({
            include: {
                personalInfo: true,
                programmes: true
            }
        });

        console.log(`Found ${students.length} student records.`);

        // 2. Ensure a default Service exists (needed for creating Programs)
        let service = await prisma.service.findFirst({ where: { slug: 'postgraduate' } });
        if (!service) {
            service = await prisma.service.create({
                data: { title: 'Postgraduate Studies', slug: 'postgraduate', description: 'PG Studies' }
            });
        }

        for (const student of students) {
            if (!student.personalInfo?.email) continue;
            console.log(`\nProcessing Student: ${student.personalInfo.email}`);

            // 3. Find matching Application to get Program details
            const application = await prisma.application.findFirst({
                where: { email: { equals: student.personalInfo.email, mode: 'insensitive' } }
            });

            let programTitle = 'M.Ed Special Education'; // Default fallback
            let programLevel = 'MASTERS';

            if (application) {
                console.log(`   found application: ${application.programChoice} (${application.programType})`);
                if (application.programChoice) programTitle = application.programChoice;
                if (application.programType) programLevel = application.programType.toUpperCase();

                // Update student matric if available in application (or generate one)
                // if (application.applicationNumber && !student.matricNumber) {
                //    try {
                //        await prisma.student.update({
                //            where: { id: student.id },
                //            data: { matricNumber: application.applicationNumber }
                //        });
                //        console.log(`   updated matric to: ${application.applicationNumber}`);
                //    } catch (e) { console.log('   could not update matric (duplicate?)'); }
                // }
            } else {
                console.log('   no application found. using default program.');
            }

            // 4. Find or Create the Program
            const slug = programTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

            let program = await prisma.program.findFirst({
                where: {
                    OR: [
                        { slug: slug },
                        { title: { equals: programTitle, mode: 'insensitive' } }
                    ]
                }
            });

            if (!program) {
                console.log(`   creating new program: ${programTitle}`);
                program = await prisma.program.create({
                    data: {
                        title: programTitle,
                        slug: slug,
                        level: programLevel as any,
                        overview: `Curriculum for ${programTitle}`,
                        serviceId: service.id,
                        studyMode: 'Full-time'
                    }
                });
            }

            // 5. Ensure Courses exist for this Program
            const courseCount = await prisma.course.count({ where: { programId: program.id } });
            if (courseCount === 0) {
                console.log(`   Creating default courses for ${programTitle}...`);
                await prisma.course.createMany({
                    data: [
                        {
                            title: `Research Methods in ${programTitle.split(' ')[0]}`,
                            slug: `research-${slug}`,
                            courseCode: 'RES 801',
                            creditHours: 3,
                            courseType: 'Core',
                            programId: program.id,
                            overview: 'Research methodology'
                        },
                        {
                            title: `Advanced Concepts in ${programTitle.split(' ')[0]}`,
                            slug: `adv-concepts-${slug}`,
                            courseCode: 'ADV 802',
                            creditHours: 3,
                            courseType: 'Core',
                            programId: program.id,
                            overview: 'Advanced concepts'
                        },
                        {
                            title: 'Elective Seminar',
                            slug: `elective-${slug}`,
                            courseCode: 'SEM 805',
                            creditHours: 2,
                            courseType: 'Elective',
                            programId: program.id,
                            overview: 'Seminar'
                        }
                    ]
                });
            }

            // 6. Link Student to Program if not already linked
            const isLinked = student.programmes.some(p => p.programId === program!.id);
            if (!isLinked) {
                await prisma.studentProgramme.create({
                    data: {
                        studentId: student.id,
                        programId: program.id,
                        admissionSession: application?.admissionSession || '2024/2025',
                        modeOfStudy: 'Full-time',
                        status: 'REGISTERED'
                    }
                });
                console.log(`   Linked to program: ${programTitle}`);
            } else {
                console.log(`   Already linked to program: ${programTitle}`);
            }
        }

        console.log('\n--- Sync Complete ---');

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
