# Application System Documentation

## Overview
The application system has been redesigned as a comprehensive multi-step form that guides applicants through the complete application process.

## Features

### Multi-Step Application Process
The application consists of 9 distinct steps:

1. **Application Requirements** - Overview of required documents and information
2. **Personal Information** - Basic applicant details with photo upload
3. **Next of Kin Information** - Emergency contact details
4. **Program Selection** - Choose program type, field, and mode of study
5. **Educational Background** - Previous academic qualifications with document uploads
6. **Employment Details** - Current employment status and career information
7. **Research Proposal** - Research plans for graduate programs
8. **Recommendations** - Two academic/professional referee contacts
9. **Payment Information** - Application fee payment details and proof

## Navigation Flow

### User Journey
1. User clicks "Apply Now" on the home page
2. Redirected to `/application` page
3. Progress through 9 steps using "Next" and "Previous" buttons
4. Visual progress indicator shows current step
5. Submit application at the final step

## Data Structure

### Application Model (Prisma Schema)
```prisma
model Application {
  id                      String   @id @default(cuid())
  
  // Personal Information (11 fields)
  // Next of Kin (6 fields)
  // Program Selection (4 fields)
  // Educational Background (7 fields)
  // Employment Details (6 fields)
  // Research Proposal (5 fields)
  // Recommendations (8 fields)
  // Payment (3 fields)
  
  status                  ApplicationStatus @default(PENDING)
  applicationNumber       String?          @unique
  
  createdAt               DateTime          @default(now())
  updatedAt               DateTime          @updatedAt
}

enum ApplicationStatus {
  PENDING
  UNDER_REVIEW
  APPROVED
  REJECTED
  AWAITING_PAYMENT
}
```

## API Endpoints

### POST `/api/applications/submit`
Submits a complete application form.

**Request Body:** Complete ApplicationData object

**Response:**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "applicationNumber": "ACE2025XXXX",
  "applicationId": "cuid123"
}
```

## File Uploads
- **Avatar:** Max 2MB, JPG/PNG formats
- **Transcripts/Certificates:** Max 5MB, PDF format
- **Research Proposal:** Max 5MB, PDF/Word formats
- **Payment Proof:** Max 5MB, Images/PDF

## Database Migration

After updating the schema, run:
```bash
npx prisma migrate dev --name add_application_model
npx prisma generate
```

## Key Changes

### Removed
- `app/components/ApplicantModal.tsx` - Modal-based application form

### Added
- `app/application/page.tsx` - Dedicated application page with multi-step form
- `app/api/applications/submit/route.ts` - Application submission API
- Application model in Prisma schema

### Modified
- `app/page.tsx` - Updated to navigate to application page instead of opening modal
- `prisma/schema.prisma` - Added Application model and ApplicationStatus enum

## User Experience Improvements

1. **Clear Progress Tracking** - Visual stepper shows current position
2. **Step Validation** - Required fields prevent progression
3. **File Upload Feedback** - Preview for images, clear size limits
4. **Responsive Design** - Works on all device sizes
5. **Comprehensive Information** - Collects all necessary application data
6. **Better Organization** - Logical grouping of related information

## Next Steps

Consider implementing:
- Form validation with error messages
- Auto-save draft functionality
- Email notifications to applicants and referees
- Admin dashboard for reviewing applications
- Application status tracking for applicants
- Payment gateway integration
- Document verification system

