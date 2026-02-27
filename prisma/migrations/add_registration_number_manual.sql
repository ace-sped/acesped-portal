-- Add registrationNumber column to students table
-- This migration adds a unique registration number field for students
-- Format: PG/ACE-SPED/YEAR/TYPE/SEQUENCE
-- Where TYPE is P for PhD, M for MSc, D for PGD

ALTER TABLE "students" 
ADD COLUMN IF NOT EXISTS "registrationNumber" TEXT;

-- Create unique index for registrationNumber
CREATE UNIQUE INDEX IF NOT EXISTS "students_registrationNumber_key" ON "students"("registrationNumber");
