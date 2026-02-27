-- Convert users.role from enum UserRole to text to allow dynamic roles from roles table
-- 1) Drop enum default (if present), change type, then set text default.
ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE TEXT USING "role"::text;
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'Student';

-- 2) Drop the enum type if nothing else uses it.
DROP TYPE IF EXISTS "UserRole";






