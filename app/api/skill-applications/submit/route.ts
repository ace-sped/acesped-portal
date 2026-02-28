import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadBase64 } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    let data;
    try {
      data = await request.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid request data. Please check your form submission.',
          error: 'INVALID_REQUEST',
        },
        { status: 400 }
      );
    }

    console.log('Received skill application data:', {
      hasData: !!data,
      fields: data ? Object.keys(data) : [],
      email: data?.email,
      technicalInterest: data?.technicalInterest,
    });

    // Handle profile photo upload to Cloudinary if it's base64
    let avatarUrl = data.avatar || null;
    if (avatarUrl && avatarUrl.startsWith('data:image')) {
      const uploadResult = await uploadBase64(avatarUrl, 'skill-applications/portraits');
      if (uploadResult.success) {
        avatarUrl = uploadResult.path;
      }
    }

    // Generate a unique application number
    const applicationNumber = `SKILL${new Date().getFullYear()}${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Prepare data for database - map form fields to SkillApplication model schema
    // Note: courseId is filtered out as it's frontend-only (we store technicalInterest instead)
    // Note: status, applicationNumber, createdAt, updatedAt are auto-generated
    const dbData = {
      // Personal Information (required fields)
      surname: data.surname,
      firstname: data.firstname,
      email: data.email,
      phone: data.phone,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      address: data.address,
      avatar: avatarUrl,

      // Technical Interest (required)
      technicalInterest: data.technicalInterest,

      // Technical Experience (required)
      hasPriorExperience: data.hasPriorExperience,
      priorTechSkills: data.priorTechSkills && Array.isArray(data.priorTechSkills) && data.priorTechSkills.length > 0
        ? data.priorTechSkills  // Convert array to Json for database
        : null, // Optional field

      // Device and Internet Access (required)
      hasLaptop: data.hasLaptop,
      hasReliableInternet: data.hasReliableInternet,

      // Motivation and Commitment (required, @db.Text)
      whyLearnTechSkill: data.whyLearnTechSkill,
      careerGoalsInTech: data.careerGoalsInTech,
      committedToProgram: data.committedToProgram,

      // Additional Information
      howDidYouHear: data.howDidYouHear, // required, @db.Text
      disabilitiesOrAssistance: data.disabilitiesOrAssistance?.trim() || null, // optional, @db.Text

      // Declaration (required, Boolean)
      informationConfirmed: data.informationConfirmed || false,

      // Payment Information (optional)
      paymentReference: data.paymentReference || null,

      // Auto-generated fields
      applicationNumber,
      status: 'PENDING' as const,
    };

    // Validate required fields
    const requiredFields = [
      'surname', 'firstname', 'email', 'phone', 'dateOfBirth',
      'gender', 'address', 'technicalInterest', 'hasPriorExperience',
      'hasLaptop', 'hasReliableInternet', 'whyLearnTechSkill',
      'careerGoalsInTech', 'committedToProgram', 'howDidYouHear'
    ];

    const missingFields = requiredFields.filter(field => !dbData[field as keyof typeof dbData]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`,
          error: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Create the skill application in the database
    const application = await prisma.skillApplication.create({
      data: dbData,
    });

    // Log payment reference if provided
    if (data.paymentReference) {
      console.log(`Skill application ${application.applicationNumber} submitted with payment reference: ${data.paymentReference}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Skill application submitted successfully',
      applicationNumber: application.applicationNumber,
      applicationId: application.id,
    });
  } catch (error: any) {
    console.error('Error submitting skill application:', error);
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      meta: error?.meta,
      stack: error?.stack,
      name: error?.name,
    });

    // Provide more specific error messages
    let errorMessage = 'Failed to submit skill application';
    let statusCode = 500;

    if (error?.code === 'P2002') {
      errorMessage = 'An application with this information already exists';
      statusCode = 409; // Conflict
    } else if (error?.code === 'P2003') {
      errorMessage = 'Invalid data reference. Please check your form data.';
      statusCode = 400;
    } else if (error?.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
        error: error instanceof Error ? error.message : String(error || 'Unknown error'),
        code: error?.code || 'UNKNOWN_ERROR',
      },
      { status: statusCode }
    );
  }
}

