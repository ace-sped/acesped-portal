import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { sendStudentWelcomeEmail } from '@/lib/email';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const userRole = payload.role as string;

      // Check if user has Deputy Center Leader role
      if (userRole !== 'Deputy_Center_Leader' && userRole !== 'SUPER_ADMIN' && userRole !== 'Center_Leader') {
        return NextResponse.json(
          { success: false, message: 'Unauthorized. Deputy Center Leader access required.' },
          { status: 403 }
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { applicationId } = body;

    if (!applicationId) {
      return NextResponse.json(
        { success: false, message: 'Application ID is required' },
        { status: 400 }
      );
    }

    // Fetch the application
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      return NextResponse.json(
        { success: false, message: 'Application not found' },
        { status: 404 }
      );
    }

    // Check if application is approved
    if (application.status !== 'APPROVED') {
      return NextResponse.json(
        { success: false, message: 'Only approved applications can be migrated to student' },
        { status: 400 }
      );
    }

    // Check if acceptance fee has been paid
    if (!application.acceptanceFeePaid) {
      return NextResponse.json(
        { success: false, message: 'Acceptance fee must be paid before migrating applicant to student' },
        { status: 400 }
      );
    }

    // Check if student record already exists for this application
    const existingStudent = await prisma.student.findUnique({
      where: { applicationId: application.id },
    });

    if (existingStudent) {
      return NextResponse.json(
        { success: false, message: 'Student record already exists for this application' },
        { status: 400 }
      );
    }

    // Students are stored in the `students` table (NOT `users`).
    // Generate a one-time password for the student portal (they should reset it after first login).
    const bcrypt = require('bcryptjs');
    const temporalPassword = Math.random().toString(36).slice(-8);
    const hashedStudentPassword = await bcrypt.hash(temporalPassword, 10);

    // Find the program by title matching programChoice
    const program = await prisma.program.findFirst({
      where: {
        title: {
          contains: application.programChoice,
          mode: 'insensitive',
        },
      },
    });

    if (!program) {
      return NextResponse.json(
        { success: false, message: `Program not found for: ${application.programChoice}` },
        { status: 404 }
      );
    }

    // Generate matric number (format: PG/ACE-SPED/YEAR/TYPE/SEQUENCE)
    // P for PhD, M for MSc/MASTERS, D for PGD
    const year = new Date().getFullYear();
    let programTypeCode = '';

    // First try to determine based on application's programChoice/programType
    const appProgramType = application.programType.toUpperCase();
    if (appProgramType.includes('PHD') || appProgramType.includes('DOCTOR') || appProgramType.includes('PH.D')) {
      programTypeCode = 'P';
    } else if (appProgramType.includes('MSC') || appProgramType.includes('MASTER') || appProgramType.includes('M.SC')) {
      programTypeCode = 'M';
    } else if (appProgramType.includes('PGD') || appProgramType.includes('DIPLOMA')) {
      programTypeCode = 'D';
    } else {
      // Fallback to program level
      if (program.level === 'PHD') {
        programTypeCode = 'P';
      } else if (program.level === 'MSC' || program.level === 'MASTERS' || program.level === 'MASTERS_AND_PHD') {
        programTypeCode = 'M';
      } else if (program.level === 'PGD') {
        programTypeCode = 'D';
      } else {
        // Default to M for other postgraduate programs
        programTypeCode = 'M';
      }
    }

    const matricPrefix = `PG/ACE-SPED/${year}/${programTypeCode}/`;

    // Find the last matric number with this prefix
    // OPTIMIZATION: Sort by matricNumber instead of createdAt to use the index
    console.log('[Migrate] Fetching last student for matric prefix:', matricPrefix);
    const lastStudent = await prisma.student.findFirst({
      where: {
        matricNumber: {
          startsWith: matricPrefix,
        },
      },
      orderBy: {
        matricNumber: 'desc',
      },
    });
    console.log('[Migrate] Last student fetched');

    let sequence = 1;
    if (lastStudent && lastStudent.matricNumber) {
      // Extract the sequence number from the end
      const parts = lastStudent.matricNumber.split('/');
      const lastSequenceStr = parts[parts.length - 1];
      const lastSequence = parseInt(lastSequenceStr || '0');

      if (!isNaN(lastSequence)) {
        sequence = lastSequence + 1;
      }
    }
    const matricNumber = `${matricPrefix}${sequence.toString().padStart(4, '0')}`;
    console.log('[Migrate] Generated matric number:', matricNumber);

    // Legacy registration number support (can be same as matric or null)
    let registrationNumber: string | null = null;

    // Create student record with all related data in a transaction
    console.log('[Migrate] Checking application data size...');
    console.log('[Migrate] Transcript size:', application.transcriptFile?.length || 0);
    console.log('[Migrate] Certificate size:', application.certificateFile?.length || 0);
    console.log('[Migrate] ID File size:', application.nationalIdFile?.length || 0);

    console.log('[Migrate] Starting transaction to create student...');
    const student = await prisma.$transaction(async (tx) => {
      // Create student
      console.log('[Migrate] Creating student record...');
      const studentData: any = {
        applicationId: application.id,
        matricNumber: matricNumber,
        status: 'ACTIVE',
        password: hashedStudentPassword,
      };

      if (registrationNumber) {
        studentData.registrationNumber = registrationNumber;
      }

      const newStudent = await tx.student.create({
        data: studentData,
      });
      console.log('[Migrate] Student record created. ID:', newStudent.id);

      // Create personal info
      console.log('[Migrate] Creating personal info...');
      await tx.studentPersonalInfo.create({
        data: {
          studentId: newStudent.id,
          email: application.email,
          firstname: application.firstname,
          surname: application.surname,
          middlename: application.middlename,
          maidenName: application.maidenName,
          nationalId: application.nationalId,
          nationalIdFile: application.nationalIdFile,
          maritalStatus: application.maritalStatus,
          dateOfBirth: application.dateOfBirth,
          gender: application.gender,
          nationality: application.nationality,
          phoneNumber: application.phoneNumber,
          alternatePhone: application.alternatePhone,
          address: application.address,
          homeAddress: application.homeAddress,
          homeTown: application.homeTown,
          city: application.city,
          state: application.state,
          country: application.country,
          postalCode: application.postalCode,
          religion: application.religion,
          avatar: application.avatar,
        },
      });
      console.log('[Migrate] Personal info created');

      // Create student programme
      console.log('[Migrate] Creating student programme...');
      await tx.studentProgramme.create({
        data: {
          studentId: newStudent.id,
          programId: program.id,
          admissionSession: application.admissionSession,
          modeOfStudy: application.modeOfStudy,
          status: 'ADMITTED',
        },
      });
      console.log('[Migrate] Student programme created');

      // Create next of kin
      console.log('[Migrate] Creating next of kin...');
      await tx.studentNextOfKin.create({
        data: {
          studentId: newStudent.id,
          firstname: application.kinFirstname,
          surname: application.kinSurname,
          relationship: application.kinRelationship,
          phone: application.kinPhone,
          email: application.kinEmail,
          address: application.kinAddress,
        },
      });
      console.log('[Migrate] Next of kin created');

      // Create education history
      console.log('[Migrate] Creating education history...');
      await tx.studentEducationHistory.create({
        data: {
          studentId: newStudent.id,
          institutionName: application.previousInstitution,
          qualification: application.previousDegree,
          fieldOfStudy: application.previousFieldOfStudy,
          endYear: application.previousGraduationYear,
          grade: application.previousGPA,
          transcriptFile: application.transcriptFile,
          certificateFile: application.certificateFile,
        },
      });
      console.log('[Migrate] Education history created');

      // Create employment history if employed
      if (application.employmentStatus === 'EMPLOYED' && application.currentEmployer) {
        console.log('[Migrate] Creating employment history...');
        await tx.studentEmploymentHistory.create({
          data: {
            studentId: newStudent.id,
            employerName: application.currentEmployer,
            jobTitle: application.jobTitle,
            employmentStatus: application.employmentStatus,
            startDate: application.employmentStartDate,
            endDate: application.employmentEndDate,
          },
        });
        console.log('[Migrate] Employment history created');
      }

      return newStudent;
    }, {
      maxWait: 5000,
      timeout: 20000,
    });
    console.log('[Migrate] Transaction completed successfully');

    // Send welcome email with login details
    try {
      const portalLink = `${request.nextUrl.origin}/login`; // Or specific student portal link if different
      await sendStudentWelcomeEmail({
        email: application.email,
        firstname: application.firstname,
        surname: application.surname,
        matricNumber: matricNumber,
        registrationNumber: student.registrationNumber || null,
        password: temporalPassword,
        portalLink,
      });
      console.log('[Migrate] Welcome email sent to:', application.email);
    } catch (emailError) {
      console.error('[Migrate] Failed to send welcome email:', emailError);
      // Don't fail the request if email fails, but log it
    }

    return NextResponse.json({
      success: true,
      message: 'Applicant successfully migrated to student',
      student: {
        id: student.id,
        matricNumber: student.matricNumber,
        registrationNumber: student.registrationNumber,
      },
    });
  } catch (error) {
    console.error('Error migrating applicant to student:', error);
    return NextResponse.json(
      {
        success: false,
        message: `Failed to migrate applicant: ${error instanceof Error ? error.message : String(error)}`,
      },
      { status: 500 }
    );
  }
}
