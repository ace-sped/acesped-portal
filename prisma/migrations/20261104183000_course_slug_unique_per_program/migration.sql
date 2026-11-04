-- Allow the same course slug under different programs
DROP INDEX IF EXISTS "courses_slug_key";

CREATE UNIQUE INDEX IF NOT EXISTS "courses_programId_slug_key"
ON "courses"("programId", "slug");
