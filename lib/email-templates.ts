/**
 * Catalog of automated Resend email templates used by the portal.
 * Keep this in sync with `lib/email.ts` and any inline Resend sends.
 */

export type EmailTemplateId =
  | 'application-received'
  | 'admission-approved'
  | 'admission-exercise-invite'
  | 'student-welcome'
  | 'password-reset';

export interface EmailTemplate {
  id: EmailTemplateId | string;
  name: string;
  subject: string;
  fromDefault: string;
  trigger: string;
  source: string;
  variables: string[];
  /** Plain-text preview with sample values filled in. */
  previewBody: string;
}

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'application-received',
    name: 'Application Received',
    subject: 'Application Received - ACE-SPED',
    fromDefault: 'ACE-SPED Admissions <admissions@acespedunn.edu.ng>',
    trigger: 'Sent automatically when a postgraduate application is submitted successfully.',
    source: 'lib/email.ts → sendApplicationReceivedEmail',
    variables: [
      'firstname',
      'email',
      'programChoice',
      'admissionSession',
      'applicationNumber',
    ],
    previewBody: [
      'Dear {{firstname}},',
      '',
      'Thank you for applying to the Africa Centre of Excellence for Sustainable Power and Energy Development (ACE-SPED).',
      '',
      'We have successfully received your application with the following details:',
      '- Program: {{programChoice}}',
      '- Session: {{admissionSession}}',
      '- Application Number: {{applicationNumber}}',
      '',
      'Your application will now be reviewed by our admissions committee. You will be invited to the admission exercise via email once a date for the exercise has been determined.',
      '',
      'Please log in to the Applicant Portal to complete your application fee payment if required.',
      '',
      'Best regards,',
      'ACE-SPED Admissions Office',
    ].join('\n'),
  },
  {
    id: 'admission-exercise-invite',
    name: 'Admission Exercise Invite',
    subject: 'Invitation to ACE-SPED Admission Exercise',
    fromDefault: 'ACE-SPED Admissions <admissions@acespedunn.edu.ng>',
    trigger:
      'Sent automatically when a deputy center leader invites an applicant to the admission exercise.',
    source: 'lib/email.ts → sendAdmissionExerciseInviteEmail',
    variables: [
      'firstname',
      'email',
      'programChoice',
      'admissionSession',
      'applicationNumber',
      'exerciseDate',
    ],
    previewBody: [
      'Dear {{firstname}},',
      '',
      'You are invited to participate in the admission exercise for the Africa Centre of Excellence for Sustainable Power and Energy Development (ACE-SPED).',
      '',
      'Application details:',
      '- Program: {{programChoice}}',
      '- Session: {{admissionSession}}',
      '- Application Number: {{applicationNumber}}',
      '',
      'Scheduled date: The admission exercise is scheduled for {{exerciseDate}} (14 working days from the date of this invite). Time: 11:00AM',
      '',
      'International Applicants will receive further communication with the time and online meeting link. Please ensure you are available on the scheduled date.',
      '',
      'Best regards,',
      'ACE-SPED Admissions Office',
    ].join('\n'),
  },
  {
    id: 'admission-approved',
    name: 'Admission Approved / Offer',
    subject: 'ACE-SPED Admission Offer & Acceptance Fee Payment',
    fromDefault: 'ACE-SPED Admissions <admissions@acespedunn.edu.ng>',
    trigger:
      'Sent automatically when an application status is set to APPROVED (admin applicants or deputy admission exercise).',
    source: 'lib/email.ts → sendAdmissionApprovedEmail',
    variables: [
      'firstname',
      'email',
      'programChoice',
      'admissionSession',
      'applicationNumber',
    ],
    previewBody: [
      'Dear {{firstname}},',
      '',
      'Congratulations! 🎉',
      'We are pleased to inform you that your application has been APPROVED for the program:',
      '{{programChoice}}',
      '- Session: {{admissionSession}}',
      '- Application Number: {{applicationNumber}}',
      '',
      'IMPORTANT: ACCEPTANCE FEE PAYMENT',
      'To proceed with your admission, you are required to pay an acceptance fee.',
      'You must use your Email Address and Application Number (shown above) to process this payment.',
      '',
      'Please visit ACE-SPED Acceptance Fee Payment Portal (https://aceportal.vercel.app/acceptance) to proceed with the payment using your email and Application number.',
      '',
      'Best regards,',
      'ACE-SPED Admissions Office',
    ].join('\n'),
  },
  {
    id: 'student-welcome',
    name: 'Student Welcome / Portal Login',
    subject: 'Welcome to ACE-SPED - Student Portal Login Details',
    fromDefault: 'ACE-SPED Admissions <admissions@acespedunn.edu.ng>',
    trigger:
      'Sent automatically when an approved applicant is migrated to a student account.',
    source: 'lib/email.ts → sendStudentWelcomeEmail',
    variables: [
      'firstname',
      'email',
      'matricNumber',
      'registrationNumber',
      'password',
      'portalLink',
    ],
    previewBody: [
      'Dear {{firstname}},',
      '',
      'Welcome to the Africa Centre of Excellence for Sustainable Power and Energy Development (ACE-SPED).',
      '',
      'Your student account has been successfully created. You can now access the student portal to register your courses and view your profile.',
      '',
      'Login Details:',
      '- Portal Link: {{portalLink}}',
      '- Matric Number: {{matricNumber}}',
      '- Registration Number: {{registrationNumber}}',
      '- Temporal Password: {{password}}',
      '',
      'Student Information:',
      '- Email: {{email}}',
      '',
      'IMPORTANT: Please change your password immediately after your first login for security purposes.',
      '',
      'Best regards,',
      'ACE-SPED ICT Unit',
    ].join('\n'),
  },
  {
    id: 'password-reset',
    name: 'Student Password Reset',
    subject: 'Password Reset Request - ACE-SPED Student Portal',
    fromDefault: 'ACE-SPED ICT <onboarding@resend.dev>',
    trigger:
      'Sent automatically when a student requests a password reset from the student portal.',
    source: 'app/api/students/forgot-password/route.ts',
    variables: ['firstname', 'email', 'resetLink'],
    previewBody: [
      'Password Reset Request',
      '',
      'Hello {{firstname}},',
      '',
      'We received a request to reset your password for the ACE-SPED Student Portal.',
      '',
      'Click the link below to reset your password. This link acts as a one-time use key and is valid for 1 hour.',
      '',
      'Reset Password: {{resetLink}}',
      '',
      "If you didn't request this, you can safely ignore this email.",
      '',
      'ACE-SPED ICT Unit',
    ].join('\n'),
  },
];
