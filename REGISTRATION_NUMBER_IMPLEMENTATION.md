# Registration Number Auto-Assignment Implementation

## Overview
When an applicant is migrated to student status, the system now automatically assigns a registration number based on the program type.

## Registration Number Format

The registration number follows this format:
- **PhD Programs**: `PG/ACE-SPED/{YEAR}/P/001`
- **MSc Programs**: `PG/ACE-SPED/{YEAR}/M/001`
- **PGD Programs**: `PG/ACE-SPED/{YEAR}/D/001`

Where:
- `{YEAR}` is the current year (e.g., 2026)
- The last segment (001) is a sequential number that increments for each student of the same program type in the same year
- `P` = PhD
- `M` = MSc/MASTERS/MASTERS_AND_PHD
- `D` = PGD

## Implementation Details

### 1. Database Schema Changes

**File**: `prisma/schema.prisma`

Added `registrationNumber` field to the `Student` model:
```prisma
model Student {
  ...
  registrationNumber String? @unique
  ...
}
```

### 2. Migration Endpoint

**File**: `app/api/deputy-center-leader/applicants/migrate/route.ts`

The migration endpoint now:
1. Determines program type from `program.level`:
   - `PHD` → uses code `P`
   - `MSC`, `MASTERS`, or `MASTERS_AND_PHD` → uses code `M`
   - `PGD` → uses code `D`
   - Defaults to `M` for other postgraduate programs

2. Generates registration number:
   - Finds the last registration number for the same program type and year
   - Increments the sequence number
   - Formats as: `PG/ACE-SPED/{YEAR}/{TYPE}/{SEQUENCE}`

3. Stores the registration number in the student record

### 3. UI Updates

**File**: `app/deputy-center-leader/applicants/page.tsx`

- Updated `StudentInfo` interface to include `registrationNumber`
- Displays registration number in the student info card
- Shows registration number in success alert after migration

## Database Migration

To apply the database changes, you need to run a migration:

### Option 1: Using Prisma Migrate (Recommended)
```bash
npx prisma migrate dev --name add_registration_number_to_student
```

### Option 2: Using Prisma DB Push (Development)
```bash
npx prisma db push
```

### Option 3: Manual SQL (if migrations fail)
Run the SQL in `prisma/migrations/add_registration_number_manual.sql`:
```sql
ALTER TABLE "students" 
ADD COLUMN IF NOT EXISTS "registrationNumber" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "students_registrationNumber_key" ON "students"("registrationNumber");
```

## Examples

### PhD Student
- Program Level: `PHD`
- Year: `2026`
- Sequence: `1`
- **Registration Number**: `PG/ACE-SPED/2026/P/001`

### MSc Student
- Program Level: `MSC`
- Year: `2026`
- Sequence: `1`
- **Registration Number**: `PG/ACE-SPED/2026/M/001`

### PGD Student
- Program Level: `PGD`
- Year: `2026`
- Sequence: `1`
- **Registration Number**: `PG/ACE-SPED/2026/D/001`

## Sequence Number Logic

The sequence number increments independently for each program type and year:
- All PhD students in 2026: P/001, P/002, P/003, ...
- All MSc students in 2026: M/001, M/002, M/003, ...
- All PGD students in 2026: D/001, D/002, D/003, ...

The system finds the highest existing sequence number for the same program type and year, then increments it by 1.

## Testing

To test the implementation:
1. Ensure database migration is applied
2. Migrate an approved applicant who has paid acceptance fee
3. Verify the registration number is generated correctly
4. Check that the registration number is displayed in the UI
5. Migrate another applicant with the same program type to verify sequence increment

## Notes

- Registration numbers are unique (enforced by database constraint)
- The registration number is generated automatically during migration
- If a program level doesn't match PHD, MSC/MASTERS, or PGD, it defaults to `M` (MSc)
- The sequence resets each year (new year = new sequence starting from 001)
