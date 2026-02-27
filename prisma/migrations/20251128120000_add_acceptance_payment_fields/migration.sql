-- Add acceptance fee tracking fields to applications
ALTER TABLE "applications"
  ADD COLUMN "acceptanceFeePaid" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "acceptancePaymentReference" TEXT,
  ADD COLUMN "acceptancePaidAt" TIMESTAMP(3);

CREATE UNIQUE INDEX IF NOT EXISTS "applications_acceptancePaymentReference_key"
  ON "applications"("acceptancePaymentReference")
  WHERE "acceptancePaymentReference" IS NOT NULL;


