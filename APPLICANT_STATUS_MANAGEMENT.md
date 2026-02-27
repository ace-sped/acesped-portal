# Applicant Status Management Feature

## Overview
Added a new "Applicant Status" section to the Application Details modal in the Deputy Center Leader's applicants page. This feature enables Deputy Center Leaders to:
1. **Migrate approved applicants to student records**
2. **Graduate students** (mark them as graduated)

## Implementation Details

### Frontend Changes

#### File: `app/deputy-center-leader/applicants/page.tsx`

**New Features Added:**
1. **New Icons Imported:**
   - `UserCheck` - for migrate to student action
   - `GraduationCap` - for graduate student action
   - `ArrowRight` - for visual indicators

2. **New State Variables:**
   - `migrating` - tracks migration operation status
   - `graduating` - tracks graduation operation status

3. **New Handler Functions:**
   - `handleMigrateToStudent()` - Handles migration of approved applicants to student records
   - `handleGraduateStudent()` - Handles graduation of students

4. **New UI Section:**
   - Added "Applicant Status" section after "Payment Status" section in the modal
   - Two action cards:
     - **Migrate to Student Card** (blue theme)
       - Converts approved applicants into student records
       - Disabled if applicant is not approved
       - Shows loading state during operation
     - **Graduate Student Card** (purple theme)
       - Marks students as graduated
       - Disabled if applicant is not approved
       - Shows loading state during operation

### Backend API Endpoints

#### 1. Migrate Applicant to Student
**Endpoint:** `POST /api/deputy-center-leader/applicants/migrate`
**File:** `app/api/deputy-center-leader/applicants/migrate/route.ts`

**Functionality:**
- Verifies user authentication and authorization (Deputy Center Leader, Center Leader, or Super Admin)
- Validates that the application is approved
- Checks if student record doesn't already exist
- Creates or retrieves user account for the applicant
- Finds the matching program
- Generates a unique matriculation number (format: `ACE/PG/YEAR/SEQUENCE`)
- Creates complete student record in a transaction:
  - Student record
  - Personal information
  - Student programme enrollment
  - Next of kin information
  - Education history
  - Employment history (if applicable)

**Response:**
```json
{
  "success": true,
  "message": "Applicant successfully migrated to student",
  "student": {
    "id": "student_id",
    "matricNumber": "ACE/PG/2026/0001",
    "userId": "user_id"
  }
}
```

**Error Handling:**
- Returns 401 if not authenticated
- Returns 403 if unauthorized (wrong role)
- Returns 400 if application not approved or student already exists
- Returns 404 if application or program not found
- Returns 500 for server errors

#### 2. Graduate Student
**Endpoint:** `POST /api/deputy-center-leader/applicants/graduate`
**File:** `app/api/deputy-center-leader/applicants/graduate/route.ts`

**Functionality:**
- Verifies user authentication and authorization
- Validates that the application is approved
- Checks if student record exists for the application
- Checks if student is not already graduated
- Updates student and programme status in a transaction:
  - Sets student status to `GRADUATED`
  - Sets all active programme enrollments to `COMPLETED`
  - Sets programme end date to current date

**Response:**
```json
{
  "success": true,
  "message": "Student successfully graduated",
  "student": {
    "id": "student_id",
    "matricNumber": "ACE/PG/2026/0001",
    "status": "GRADUATED"
  }
}
```

**Error Handling:**
- Returns 401 if not authenticated
- Returns 403 if unauthorized
- Returns 400 if application not approved, no student record exists, or already graduated
- Returns 404 if application not found
- Returns 500 for server errors

## User Experience

### Migration Flow
1. Deputy Center Leader opens an application details modal
2. Scrolls to "Applicant Status" section (after Payment Status)
3. Clicks "Migrate" button on the blue card
4. Confirms the action in a dialog
5. System creates complete student record
6. Success message is shown
7. Modal closes and application list refreshes

### Graduation Flow
1. Deputy Center Leader opens an application details modal
2. Scrolls to "Applicant Status" section
3. Clicks "Graduate" button on the purple card
4. Confirms the action in a dialog
5. System updates student status to GRADUATED
6. Success message is shown
7. Modal closes and application list refreshes

## Security & Permissions

### Role-Based Access Control
Both endpoints verify that the user has one of these roles:
- `Deputy_Center_Leader`
- `Center_Leader`
- `SUPER_ADMIN`

### Data Validation
- Validates application status (must be APPROVED)
- Prevents duplicate student records
- Prevents graduating non-existent or already graduated students
- Uses database transactions to ensure data integrity

## Database Schema Utilization

### Models Used:
- `Application` - Source application data
- `User` - User account for student login
- `Student` - Main student record
- `StudentPersonalInfo` - Personal information
- `StudentProgramme` - Programme enrollment
- `StudentNextOfKin` - Emergency contact
- `StudentEducationHistory` - Previous education
- `StudentEmploymentHistory` - Work experience
- `Program` - Academic programme details

### Status Enums:
- `StudentStatus`: ACTIVE, INACTIVE, GRADUATED, SUSPENDED, WITHDRAWN, DEFERRED
- `StudentProgrammeStatus`: ADMITTED, REGISTERED, IN_PROGRESS, COMPLETED, WITHDRAWN, DEFERRED

## Visual Design

### Applicant Status Section
- Clean, modern card-based layout
- Color-coded actions:
  - Blue for migration (new student)
  - Purple for graduation
- Icons for visual clarity
- Disabled state with helpful hints
- Loading states during operations
- Responsive design with proper spacing

## Future Enhancements

Potential improvements:
1. Add email notifications for migration and graduation
2. Generate admission letters automatically on migration
3. Add bulk migration/graduation capabilities
4. Include audit trail for status changes
5. Add rollback capability for accidental graduations
6. Generate graduation certificates

## Testing Recommendations

1. **Migration Testing:**
   - Test with approved application
   - Test with non-approved application (should fail)
   - Test with already migrated application (should fail)
   - Test matric number generation sequence
   - Test with non-existent program

2. **Graduation Testing:**
   - Test with migrated student
   - Test with non-migrated applicant (should fail)
   - Test with already graduated student (should fail)
   - Verify programme status updates

3. **Permission Testing:**
   - Test with Deputy Center Leader role
   - Test with unauthorized roles (should fail)
   - Test without authentication (should fail)
