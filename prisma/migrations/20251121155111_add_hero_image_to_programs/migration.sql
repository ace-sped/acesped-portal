/*
  Warnings:

  - Added the required column `homeAddress` to the `applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `homeTown` to the `applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maritalStatus` to the `applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nationalId` to the `applications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `religion` to the `applications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "homeAddress" TEXT NOT NULL,
ADD COLUMN     "homeTown" TEXT NOT NULL,
ADD COLUMN     "maidenName" TEXT,
ADD COLUMN     "maritalStatus" TEXT NOT NULL,
ADD COLUMN     "nationalId" TEXT NOT NULL,
ADD COLUMN     "nationalIdFile" TEXT,
ADD COLUMN     "religion" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "programs" ADD COLUMN     "heroImage" TEXT;

-- CreateIndex
CREATE INDEX "programs_slug_idx" ON "programs"("slug");

-- CreateIndex
CREATE INDEX "programs_isActive_idx" ON "programs"("isActive");
