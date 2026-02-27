import { prisma } from '@/lib/prisma';

/**
 * Validates an access code and returns what it grants access to
 * @param code - The access code to validate
 * @returns Array of project IDs/resources the code grants access to, or null if invalid
 */
export async function validateAccessCode(code: string): Promise<string[] | null> {
  const accessCode = await prisma.projectAccessCode.findUnique({
    where: {
      code: code.trim(),
    }
  });

  if (!accessCode) {
    return null;
  }

  // Check if active
  if (!accessCode.isActive) {
    return null;
  }

  // Check if max uses reached
  if (accessCode.maxUses !== null && accessCode.usageCount >= accessCode.maxUses) {
    return null;
  }

  return accessCode.accessTo;
}

/**
 * Increments the usage count for an access code
 * @param code - The access code
 */
export async function incrementAccessCodeUsage(code: string) {
  try {
    await prisma.projectAccessCode.update({
      where: {
        code: code.trim(),
      },
      data: {
        usageCount: {
          increment: 1
        }
      }
    });
  } catch (error) {
    console.error('Failed to increment access code usage:', error);
  }
}

/**
 * Creates a new access code
 * @param code - The access code
 * @param accessTo - Array of project IDs or resources this code grants access to
 * @param options - Additional options (maxUses, createdBy)
 */
export async function createAccessCode(
  code: string,
  accessTo: string[],
  options?: {
    maxUses?: number;
    createdBy?: string;
  }
) {
  return await prisma.projectAccessCode.create({
    data: {
      code: code.trim(),
      accessTo,
      maxUses: options?.maxUses,
      createdBy: options?.createdBy
    }
  });
}

/**
 * Gets all access codes
 */
export async function getAllAccessCodes() {
  return await prisma.projectAccessCode.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });
}

/**
 * Deactivates an access code
 * @param id - The access code ID
 */
export async function deactivateAccessCode(id: string) {
  return await prisma.projectAccessCode.update({
    where: { id },
    data: { isActive: false }
  });
}

/**
 * Deletes an access code
 * @param id - The access code ID
 */
export async function deleteAccessCode(id: string) {
  return await prisma.projectAccessCode.delete({
    where: { id }
  });
}

/**
 * Updates an access code
 * @param id - The access code ID
 * @param data - The data to update
 */
export async function updateAccessCode(
  id: string,
  data: {
    code?: string;
    accessTo?: string[];
    isActive?: boolean;
    maxUses?: number | null;
  }
) {
  return await prisma.projectAccessCode.update({
    where: { id },
    data
  });
}
