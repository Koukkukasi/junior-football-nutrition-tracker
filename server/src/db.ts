import { PrismaClient } from '@prisma/client';

// Create a singleton instance of PrismaClient
// This prevents multiple database connections and connection pool exhaustion

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Handle cleanup on application shutdown
// Note: beforeExit is not triggered when the process exits explicitly
// We'll handle cleanup in server.ts instead

export default prisma;