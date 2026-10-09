-- CreateTable
CREATE TABLE "application_drafts" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "currentStep" TEXT NOT NULL,
    "acceptedRequirements" BOOLEAN NOT NULL DEFAULT false,
    "paymentCompleted" BOOLEAN NOT NULL DEFAULT false,
    "formData" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "application_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "application_drafts_email_key" ON "application_drafts"("email");
