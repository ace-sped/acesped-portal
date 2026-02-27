-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'AWAITING_PAYMENT');

-- CreateEnum
CREATE TYPE "CourseLevel" AS ENUM ('CERTIFICATE', 'DIPLOMA', 'BACHELORS', 'MASTERS', 'PHD', 'MASTERS_AND_PHD');

-- CreateEnum
CREATE TYPE "NewsCategory" AS ENUM ('RESEARCH', 'ACHIEVEMENT', 'EVENT', 'ANNOUNCEMENT', 'COLLABORATION');

-- CreateEnum
CREATE TYPE "TeamRole" AS ENUM ('LEADERSHIP', 'FACULTY', 'STAFF', 'RESEARCH');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'PG_Rep';

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstname" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "middlename" TEXT,
    "dateOfBirth" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "alternatePhone" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "postalCode" TEXT,
    "avatar" TEXT,
    "kinFirstname" TEXT NOT NULL,
    "kinSurname" TEXT NOT NULL,
    "kinRelationship" TEXT NOT NULL,
    "kinPhone" TEXT NOT NULL,
    "kinEmail" TEXT NOT NULL,
    "kinAddress" TEXT NOT NULL,
    "programType" TEXT NOT NULL,
    "programChoice" TEXT NOT NULL,
    "admissionSession" TEXT NOT NULL,
    "modeOfStudy" TEXT NOT NULL,
    "previousDegree" TEXT NOT NULL,
    "previousInstitution" TEXT NOT NULL,
    "previousGraduationYear" TEXT NOT NULL,
    "previousGPA" TEXT NOT NULL,
    "previousFieldOfStudy" TEXT NOT NULL,
    "transcriptFile" TEXT,
    "certificateFile" TEXT,
    "employmentStatus" TEXT NOT NULL,
    "currentEmployer" TEXT,
    "jobTitle" TEXT,
    "employmentStartDate" TEXT,
    "employmentEndDate" TEXT,
    "reasonForPursuing" TEXT NOT NULL,
    "researchTitle" TEXT,
    "researchAbstract" TEXT,
    "researchObjectives" TEXT,
    "researchMethodology" TEXT,
    "proposalFile" TEXT,
    "referee1Name" TEXT NOT NULL,
    "referee1Email" TEXT NOT NULL,
    "referee1Phone" TEXT NOT NULL,
    "referee1Institution" TEXT NOT NULL,
    "referee2Name" TEXT NOT NULL,
    "referee2Email" TEXT NOT NULL,
    "referee2Phone" TEXT NOT NULL,
    "referee2Institution" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "paymentReference" TEXT NOT NULL,
    "paymentProof" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "applicationNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "programs" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "duration" TEXT,
    "studyMode" TEXT,
    "totalCourses" INTEGER NOT NULL DEFAULT 0,
    "fee" TEXT,
    "applicationDeadline" TEXT,
    "requirements" JSONB,
    "careerProspects" JSONB,
    "thematicAreas" JSONB,
    "services" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "level" "CourseLevel" NOT NULL,
    "duration" TEXT,
    "studyMode" TEXT,
    "fee" TEXT,
    "overview" TEXT NOT NULL,
    "objectives" JSONB,
    "curriculum" JSONB,
    "requirements" JSONB,
    "careerPaths" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "category" "NewsCategory" NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "tags" JSONB,
    "publishedAt" TIMESTAMP(3),
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "role" "TeamRole" NOT NULL,
    "title" TEXT NOT NULL,
    "department" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "image" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "qualifications" JSONB NOT NULL,
    "researchAreas" JSONB,
    "linkedin" TEXT,
    "twitter" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "team_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "applications_applicationNumber_key" ON "applications"("applicationNumber");

-- CreateIndex
CREATE UNIQUE INDEX "programs_slug_key" ON "programs"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "courses_slug_key" ON "courses"("slug");

-- CreateIndex
CREATE INDEX "courses_programId_idx" ON "courses"("programId");

-- CreateIndex
CREATE INDEX "courses_slug_idx" ON "courses"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "news_slug_key" ON "news"("slug");

-- CreateIndex
CREATE INDEX "news_slug_idx" ON "news"("slug");

-- CreateIndex
CREATE INDEX "news_category_idx" ON "news"("category");

-- CreateIndex
CREATE INDEX "news_isPublished_idx" ON "news"("isPublished");

-- CreateIndex
CREATE INDEX "news_isFeatured_idx" ON "news"("isFeatured");

-- CreateIndex
CREATE INDEX "news_publishedAt_idx" ON "news"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "team_slug_key" ON "team"("slug");

-- CreateIndex
CREATE INDEX "team_slug_idx" ON "team"("slug");

-- CreateIndex
CREATE INDEX "team_role_idx" ON "team"("role");

-- CreateIndex
CREATE INDEX "team_isActive_idx" ON "team"("isActive");

-- CreateIndex
CREATE INDEX "team_displayOrder_idx" ON "team"("displayOrder");

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
