-- CreateTable
CREATE TABLE "project_access_codes" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maxUses" INTEGER,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_access_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "project_access_codes_code_idx" ON "project_access_codes"("code");

-- CreateIndex
CREATE INDEX "project_access_codes_projectId_idx" ON "project_access_codes"("projectId");

-- CreateIndex
CREATE INDEX "project_access_codes_isActive_idx" ON "project_access_codes"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "project_access_codes_projectId_code_key" ON "project_access_codes"("projectId", "code");

-- AddForeignKey
ALTER TABLE "project_access_codes" ADD CONSTRAINT "project_access_codes_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
