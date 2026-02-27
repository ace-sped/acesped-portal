require('dotenv').config();

const { PrismaClient } = require('@prisma/client');

/**
 * One-time migration helper:
 * Copies bcrypt passwords from legacy `users` records into `students.password`,
 * based on an older DB column `students.userId`.
 *
 * This uses raw SQL so it can run even after you've removed `userId` from Prisma schema.
 *
 * Safe-by-default behavior:
 * - Only updates students where `students.password` is null/empty
 * - Only copies when user.password looks like bcrypt
 * - Does NOT delete users or change user roles
 *
 * Usage:
 *   node scripts/migrate-students-off-users.js
 */
async function main() {
  const prisma = new PrismaClient();

  try {
    console.log('Migrating students off users (copy passwords)…');

    const hasUserIdColumn = await prisma.$queryRawUnsafe(
      `
      select 1
      from information_schema.columns
      where table_name = 'students'
        and column_name = 'userId'
      limit 1
      `
    );

    if (!Array.isArray(hasUserIdColumn) || hasUserIdColumn.length === 0) {
      console.log('No legacy students.userId column found. Nothing to migrate.');
      return;
    }

    const legacyStudents = await prisma.$queryRawUnsafe(
      `
      select id, "userId", password
      from students
      where "userId" is not null
        and (password is null or password = '')
      `
    );

    let updated = 0;
    let skipped = 0;

    for (const s of legacyStudents) {
      const studentId = s?.id;
      const userId = s?.userId;
      if (!studentId || !userId) {
        skipped++;
        continue;
      }

      const userRows = await prisma.$queryRawUnsafe(
        `select password from users where id = $1 limit 1`,
        userId
      );

      const userPassword = Array.isArray(userRows) ? userRows?.[0]?.password : undefined;
      const isBcrypt = typeof userPassword === 'string' && /^\$2[aby]\$/.test(userPassword);
      if (!isBcrypt) {
        skipped++;
        continue;
      }

      await prisma.$executeRawUnsafe(
        `update students set password = $1 where id = $2`,
        userPassword,
        studentId
      );
      updated++;
    }

    console.log(`Done. Updated: ${updated}, skipped: ${skipped}`);
    console.log('Next: run a DB migration to drop students.userId if it still exists.');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});

