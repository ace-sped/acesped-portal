const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * This script creates sample access codes from project.accessCode fields
 * Note: Access codes are now global with accessTo specifying which projects they grant access to
 * Run with: node scripts/seed-access-codes.js
 */

async function main() {
  console.log('Starting to seed access codes...\n');

  // Get all projects with access codes
  const projects = await prisma.project.findMany({
    where: {
      accessCode: {
        not: null
      }
    }
  });

  console.log(`Found ${projects.length} projects with access codes\n`);

  // Group projects by access code
  const codeToProjectIds = new Map();

  for (const project of projects) {
    if (!project.accessCode) continue;

    if (!codeToProjectIds.has(project.accessCode)) {
      codeToProjectIds.set(project.accessCode, []);
    }
    codeToProjectIds.get(project.accessCode).push(project.id);
  }

  console.log(`Found ${codeToProjectIds.size} unique access codes\n`);

  let createdCount = 0;

  for (const [code, projectIds] of codeToProjectIds.entries()) {
    console.log(`Processing code: ${code}`);
    
    // Check if this code already exists
    const existingCode = await prisma.projectAccessCode.findUnique({
      where: { code }
    });

    if (existingCode) {
      console.log(`  ✓ Access code "${code}" already exists, grants access to ${existingCode.accessTo.length} project(s)`);
      continue;
    }

    // Create the access code with accessTo array
    try {
      await prisma.projectAccessCode.create({
        data: {
          code,
          accessTo: projectIds,
          isActive: true
        }
      });
      createdCount++;
      console.log(`  ✓ Created access code: ${code} (grants access to ${projectIds.length} project(s))`);
    } catch (error) {
      console.log(`  ✗ Failed to create code: ${error.message}`);
    }
  }

  console.log(`\n✨ Seeding completed! Created ${createdCount} access codes.`);
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
