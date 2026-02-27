import 'server-only';
import { Resend } from 'resend';

// Initialize Resend with API key from environment variables
const getResend = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY is not set. Email sending will be skipped.');
    return null;
  }
  return new Resend(apiKey);
};

interface AdmissionEmailParams {
  email: string;
  firstname: string;
  surname: string;
  programChoice: string;
  admissionSession: string;
  applicationNumber?: string | null;
}

export async function sendAdmissionApprovedEmail(params: AdmissionEmailParams) {
  const resend = getResend();
  if (!resend) return;

  const from = process.env.EMAIL_FROM || 'ACE-SPED Admissions <onboarding@resend.dev>';

  const subject = 'ACE-SPED Admission Offer & Acceptance Fee Payment';
  const greetingName = params.firstname || params.email;

  const lines: string[] = [];
  lines.push(`Dear ${greetingName},`);
  lines.push('');
  lines.push('Congratulations! 🎉');
  lines.push(
    `We are pleased to inform you that your application has been APPROVED for the program:`
  );
  lines.push(`${params.programChoice}`);
  lines.push(`- Session: ${params.admissionSession}`);
  if (params.applicationNumber) {
    lines.push(`- Application Number: ${params.applicationNumber}`);
  }
  lines.push('');
  lines.push('IMPORTANT: ACCEPTANCE FEE PAYMENT');
  lines.push('To proceed with your admission, you are required to pay an acceptance fee.');
  lines.push('You must use your Email Address and Application Number (shown above) to process this payment.');
  lines.push('');
  lines.push(
    'Please visit <a href="https://aceportal.vercel.app/acceptance">ACE-SPED Acceptance Fee Payment Portal</a> to proceed with the payment using your email and Application number.'
  );
  lines.push('');
  lines.push('Best regards,');
  lines.push('ACE-SPED Admissions Office');

  const text = lines.join('\n');
  const htmlContent = text
    .replace(/\n/g, '<br/>')
    .replace('Congratulations! 🎉', '<strong>Congratulations! 🎉</strong>')
    .replace('IMPORTANT: ACCEPTANCE FEE PAYMENT', '<strong>IMPORTANT: ACCEPTANCE FEE PAYMENT</strong>')
    .replace('Email Address and Application Number', '<strong>Email Address and Application Number</strong>');

  const html = `<div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; line-height: 1.6;">${htmlContent}</div>`;

  try {
    const data = await resend.emails.send({
      from,
      to: params.email,
      subject,
      html,
    });
    console.log('Admission approval email sent:', data);
  } catch (error) {
    console.error('Failed to send admission approval email', error);
  }
}

interface ApplicationReceivedEmailParams {
  email: string;
  firstname: string;
  surname: string;
  programChoice: string;
  admissionSession: string;
  applicationNumber: string;
}

export async function sendApplicationReceivedEmail(params: ApplicationReceivedEmailParams) {
  const resend = getResend();
  if (!resend) return;

  const from = process.env.EMAIL_FROM || 'ACE-SPED Admissions <onboarding@resend.dev>';

  const subject = 'Application Received - ACE-SPED';
  const greetingName = params.firstname || params.email;

  const lines: string[] = [];
  lines.push(`Dear ${greetingName},`);
  lines.push('');
  lines.push('Thank you for applying to the Africa Centre of Excellence for Sustainable Power and Energy Development (ACE-SPED).');
  lines.push('');
  lines.push('We have successfully received your application with the following details:');
  lines.push(`- Program: ${params.programChoice}`);
  lines.push(`- Session: ${params.admissionSession}`);
  lines.push('');
  lines.push('Your application will now be reviewed by our admissions committee. You will be invited to the admission exercise via email once a date for the exercise has been determined.');
  lines.push('');
  lines.push('Best regards,');
  lines.push('ACE-SPED Admissions Office');

  const text = lines.join('\n');
  const htmlContent = text.replace(/\n/g, '<br/>');

  const html = `<div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; line-height: 1.6;">${htmlContent}</div>`;

  try {
    const data = await resend.emails.send({
      from,
      to: params.email,
      subject,
      html,
    });
    console.log('Application received email sent:', data);
  } catch (error) {
    console.error('Failed to send application received email', error);
  }
}

export interface AdmissionExerciseInviteEmailParams {
  email: string;
  firstname: string;
  surname: string;
  programChoice: string;
  admissionSession: string;
  applicationNumber?: string | null;
  /** Admission exercise date (14 working days from invite date). */
  exerciseDate: Date;
}

function formatExerciseDate(d: Date): string {
  return d.toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export async function sendAdmissionExerciseInviteEmail(params: AdmissionExerciseInviteEmailParams) {
  const resend = getResend();
  if (!resend) return;

  const from = process.env.EMAIL_FROM || 'ACE-SPED Admissions <onboarding@resend.dev>';

  const subject = 'Invitation to ACE-SPED Admission Exercise';
  const greetingName = params.firstname || params.email;
  const exerciseDateFormatted = formatExerciseDate(params.exerciseDate);

  const lines: string[] = [];
  lines.push(`Dear ${greetingName},`);
  lines.push('');
  lines.push('You are invited to participate in the admission exercise for the Africa Centre of Excellence for Sustainable Power and Energy Development (ACE-SPED).');
  lines.push('');
  lines.push('<strong>Application details:</strong>');
  lines.push(`- Program: ${params.programChoice}`);
  lines.push(`- Session: ${params.admissionSession}`);
  if (params.applicationNumber) {
    lines.push(`- Application Number: ${params.applicationNumber}`);
  }
  lines.push('');
  lines.push(`<strong>Scheduled date:</strong> The admission exercise is scheduled for ${exerciseDateFormatted} (14 working days from the date of this invite). Time: 11:00AM`);
  lines.push('');
  lines.push('International Applicants will receive further communication with the time and online meeting link. Please ensure you are available on the scheduled date.');
  lines.push('');
  lines.push('Best regards,');
  lines.push('ACE-SPED Admissions Office');

  const text = lines.join('\n');
  const htmlContent = text.replace(/\n/g, '<br/>');

  const html = `<div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; line-height: 1.6;">${htmlContent}</div>`;

  try {
    const data = await resend.emails.send({
      from,
      to: params.email,
      subject,
      html,
    });
    console.log('Admission exercise invite email sent:', data);
  } catch (error) {
    console.error('Failed to send admission exercise invite email', error);
    throw error;
  }
}

interface StudentWelcomeEmailParams {
  email: string;
  firstname: string;
  surname: string;
  matricNumber: string;
  registrationNumber: string | null;
  password?: string;
  portalLink: string;
}

export async function sendStudentWelcomeEmail(params: StudentWelcomeEmailParams) {
  const resend = getResend();
  if (!resend) return;

  const from = process.env.EMAIL_FROM || 'ACE-SPED Admissions <onboarding@resend.dev>';

  const subject = 'Welcome to ACE-SPED - Student Portal Login Details';
  const greetingName = params.firstname || params.email;

  const lines: string[] = [];
  lines.push(`Dear ${greetingName},`);
  lines.push('');
  lines.push('Welcome to the Africa Centre of Excellence for Sustainable Power and Energy Development (ACE-SPED).');
  lines.push('');
  lines.push('Your student account has been successfully created. You can now access the student portal to register your courses and view your profile.');
  lines.push('');
  lines.push('<strong>Login Details:</strong>');
  lines.push(`- <strong>Portal Link:</strong> <a href="${params.portalLink}">${params.portalLink}</a>`);
  lines.push(`- <strong>Matric Number:</strong> ${params.matricNumber}`);
  if (params.registrationNumber) {
    lines.push(`- <strong>Registration Number:</strong> ${params.registrationNumber}`);
  }  
  if (params.password) {
    lines.push(`- <strong>Temporal Password:</strong> ${params.password}`);
  }
  lines.push('');
  lines.push('<strong>Student Information:</strong>');
  lines.push(`- <strong>Email:</strong> ${params.email}`);
  lines.push('');
  lines.push('IMPORTANT: Please change your password immediately after your first login for security purposes.');
  lines.push('');
  lines.push('Best regards,');
  lines.push('ACE-SPED ICT Unit');

  const text = lines.join('\n');
  const htmlContent = text.replace(/\n/g, '<br/>');

  const html = `<div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: 14px; line-height: 1.6;">${htmlContent}</div>`;

  try {
    const data = await resend.emails.send({
      from,
      to: params.email,
      subject,
      html,
    });
    console.log('Student welcome email sent:', data);
  } catch (error) {
    console.error('Failed to send student welcome email', error);
  }
}
