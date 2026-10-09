import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

const APPLICATION_STEPS = new Set([
  'requirements',
  'personal',
  'nextOfKin',
  'program',
  'education',
  'employment',
  'research',
  'recommendations',
  'review',
  'payment',
]);

const FORM_FIELDS = [
  'email',
  'firstname',
  'surname',
  'middlename',
  'maidenName',
  'nationalId',
  'nationalIdFile',
  'maritalStatus',
  'dateOfBirth',
  'gender',
  'nationality',
  'phoneNumber',
  'alternatePhone',
  'address',
  'homeAddress',
  'homeTown',
  'city',
  'state',
  'country',
  'postalCode',
  'religion',
  'avatar',
  'kinFirstname',
  'kinSurname',
  'kinRelationship',
  'kinPhone',
  'kinEmail',
  'kinAddress',
  'programType',
  'programChoice',
  'admissionSession',
  'modeOfStudy',
  'previousDegree',
  'previousInstitution',
  'previousGraduationYear',
  'previousGPA',
  'previousFieldOfStudy',
  'transcriptFile',
  'certificateFile',
  'employmentStatus',
  'currentEmployer',
  'jobTitle',
  'employmentStartDate',
  'employmentEndDate',
  'reasonForPursuing',
  'researchTitle',
  'researchAbstract',
  'researchObjectives',
  'researchMethodology',
  'proposalFile',
  'referee1Name',
  'referee1Email',
  'referee1Phone',
  'referee1Institution',
  'referee2Name',
  'referee2Email',
  'referee2Phone',
  'referee2Institution',
  'paymentMethod',
  'paymentReference',
  'paymentProof',
] as const;

function normalizeEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  if (!email) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

function sanitizeFormData(value: unknown, email: string | null): Prisma.InputJsonObject {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  const formData: Record<string, string> = {};

  for (const field of FORM_FIELDS) {
    const raw = source[field];
    if (typeof raw !== 'string') {
      formData[field] = '';
      continue;
    }
    // Keep Cloudinary URLs. Drop inline file payloads so drafts stay small.
    if (raw.startsWith('data:')) {
      formData[field] = '';
      continue;
    }
    formData[field] = raw;
  }

  if (email) {
    formData.email = email;
  }

  return formData;
}

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')?.trim();
    const email = normalizeEmail(request.nextUrl.searchParams.get('email'));
    if (!id && !email) {
      return NextResponse.json(
        { success: false, message: 'Draft id or email is required.' },
        { status: 400 }
      );
    }

    const draft = id
      ? await prisma.applicationDraft.findUnique({ where: { id } })
      : await prisma.applicationDraft.findUnique({ where: { email: email as string } });
    if (!draft) {
      return NextResponse.json({ success: false, message: 'Draft not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, draft });
  } catch (error) {
    console.error('Error loading application draft:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load application draft.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const currentStep = typeof body?.currentStep === 'string' ? body.currentStep : '';
    if (!APPLICATION_STEPS.has(currentStep)) {
      return NextResponse.json({ success: false, message: 'Invalid application stage.' }, { status: 400 });
    }

    const requestedId = typeof body?.id === 'string' ? body.id.trim() : '';
    const id = requestedId || undefined;
    const email = normalizeEmail(body?.email ?? body?.formData?.email);
    const formData = sanitizeFormData(body?.formData, email);

    const data = {
      email,
      currentStep,
      acceptedRequirements: Boolean(body?.acceptedRequirements),
      paymentCompleted: Boolean(body?.paymentCompleted),
      formData,
    };

    if (email) {
      const existingByEmail = await prisma.applicationDraft.findUnique({ where: { email } });
      if (existingByEmail && existingByEmail.id !== id) {
        const draft = await prisma.applicationDraft.update({
          where: { id: existingByEmail.id },
          data,
        });
        if (id && id !== existingByEmail.id) {
          await prisma.applicationDraft.deleteMany({ where: { id } });
        }
        return NextResponse.json({ success: true, id: draft.id });
      }
    }

    const draft = id
      ? await prisma.applicationDraft.upsert({
          where: { id },
          create: { id, ...data },
          update: data,
        })
      : await prisma.applicationDraft.create({ data });

    return NextResponse.json({ success: true, id: draft.id });
  } catch (error) {
    console.error('Error saving application draft:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to save application draft.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id')?.trim();
    const email = normalizeEmail(request.nextUrl.searchParams.get('email'));

    if (!id && !email) {
      return NextResponse.json({ success: false, message: 'Draft id or email is required.' }, { status: 400 });
    }

    await prisma.applicationDraft.deleteMany({
      where: {
        OR: [
          ...(id ? [{ id }] : []),
          ...(email ? [{ email }] : []),
        ],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting application draft:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete application draft.' },
      { status: 500 }
    );
  }
}
