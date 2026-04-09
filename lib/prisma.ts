import { PrismaClient } from '@prisma/client';

// Prevent exhausting database connections during Next.js hot-reloads in development.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function buildDatasourceUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;
  return url.includes('connection_limit')
    ? url
    : `${url}${url.includes('?') ? '&' : '?'}connection_limit=10&pool_timeout=30`;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    ...(buildDatasourceUrl() ? { datasourceUrl: buildDatasourceUrl() } : {}),
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

