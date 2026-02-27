
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
    try {
        // Fetch all registrations with course & lecturer details
        // optimized: only fetch what we need
        const registrations = await prisma.studentCourseRegistration.findMany({
            where: {
                // We typically only care about registrations that have some grade activity
                // But for now, let's fetch all to show even empty courses if needed?
                // The user prompt implies "View results submitted by lecturers", so we probably
                // only care about those with status != 'REGISTERED' or grade != null
                // specific logic: where status is NOT 'REGISTERED' implies submission started.
                // OR we can just fetch all and filter in memory.
            },
            include: {
                course: {
                    include: {
                        lecturers: {
                            select: {
                                firstname: true,
                                surname: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });

        // Group by courseId + session + semester
        const grouped = new Map<string, any>();

        for (const reg of registrations) {
            const key = `${reg.courseId}-${reg.session}-${reg.semester}`;

            if (!grouped.has(key)) {
                grouped.set(key, {
                    id: key,
                    courseId: reg.courseId,
                    courseCode: reg.course.courseCode || 'N/A',
                    courseTitle: reg.course.title,
                    lecturer: reg.course.lecturers.map(l => `${l.firstname} ${l.surname}`).join(', ') || 'Unassigned',
                    session: reg.session,
                    semester: reg.semester,
                    studentsCount: 0,
                    submittedDate: reg.updatedAt, // Initialize with first encountered
                    statuses: new Set<string>()
                });
            }

            const group = grouped.get(key);
            group.studentsCount++;
            group.statuses.add(reg.status);
            // Keep the most recent date
            if (new Date(reg.updatedAt) > new Date(group.submittedDate)) {
                group.submittedDate = reg.updatedAt;
            }
        }

        // Determine Aggregate Status
        const results = Array.from(grouped.values()).map(group => {
            const statuses = group.statuses;
            let finalStatus = 'Pending'; // Default

            // Logic hierarchy
            if (statuses.has('RELEASED')) {
                finalStatus = 'Released';
            } else if (statuses.has('APPROVED')) {
                finalStatus = 'Approved';
            } else if (statuses.has('REJECTED')) {
                finalStatus = 'Rejected';
            } else if (statuses.has('SUBMITTED')) {
                finalStatus = 'Pending';
            } else {
                // If only REGISTERED, maybe exclude? 
                // Or call it "No Submission".
                // The request says "View results submitted", so strictly we should filter out just 'REGISTERED'.
                finalStatus = 'Draft';
            }

            return {
                ...group,
                status: finalStatus,
                submittedDate: new Date(group.submittedDate).toISOString().split('T')[0]
            };
        }).filter(r => r.status !== 'Draft'); // Filter out those that are purely just registered students with no marks

        return NextResponse.json({
            success: true,
            results
        });

    } catch (error) {
        console.error('Error fetching results:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch results' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { courseId, session, semester, action } = body;

        if (!courseId || !session || !semester || !action) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields' },
                { status: 400 }
            );
        }

        let newStatus = '';
        switch (action) {
            case 'approve':
                newStatus = 'APPROVED';
                break;
            case 'reject':
                newStatus = 'REJECTED';
                break;
            case 'release':
                newStatus = 'RELEASED';
                break;
            default:
                return NextResponse.json(
                    { success: false, message: 'Invalid action' },
                    { status: 400 }
                );
        }

        // Update all registrations matching the criteria
        await prisma.studentCourseRegistration.updateMany({
            where: {
                courseId,
                session,
                semester,
                // Only update records that are in a valid state to be moved?
                // For now, force update all in that batch.
            },
            data: {
                status: newStatus,
                updatedAt: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            message: `Results ${newStatus.toLowerCase()} successfully`
        });

    } catch (error) {
        console.error('Error updating results:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update results' },
            { status: 500 }
        );
    }
}
