-- Add displayOrder column to programs table (already exists in database, this is for migration history)
ALTER TABLE "programs" ADD COLUMN IF NOT EXISTS "displayOrder" INTEGER NOT NULL DEFAULT 0;

-- Create skill_applications table (already exists in database, this is for migration history)
CREATE TABLE IF NOT EXISTS "skill_applications" (
    "id" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "dateOfBirth" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "technicalInterest" TEXT NOT NULL,
    "hasPriorExperience" TEXT NOT NULL,
    "priorTechSkills" JSONB,
    "hasLaptop" TEXT NOT NULL,
    "hasReliableInternet" TEXT NOT NULL,
    "whyLearnTechSkill" TEXT NOT NULL,
    "careerGoalsInTech" TEXT NOT NULL,
    "committedToProgram" TEXT NOT NULL,
    "howDidYouHear" TEXT NOT NULL,
    "disabilitiesOrAssistance" TEXT,
    "informationConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "applicationNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skill_applications_pkey" PRIMARY KEY ("id")
);

-- Create indexes (already exist in database, this is for migration history)
CREATE UNIQUE INDEX IF NOT EXISTS "skill_applications_applicationNumber_key" ON "skill_applications"("applicationNumber");
CREATE INDEX IF NOT EXISTS "skill_applications_email_idx" ON "skill_applications"("email");
CREATE INDEX IF NOT EXISTS "skill_applications_status_idx" ON "skill_applications"("status");
CREATE INDEX IF NOT EXISTS "skill_applications_createdAt_idx" ON "skill_applications"("createdAt");

