// lib/prisma.ts

import { PrismaClient } from '@prisma/client';

declare global {
  // Declare a global var for PrismaClient to reuse across re-renders in development.
  var prisma: PrismaClient | undefined;
}

// Initialize the Prisma client, reusing the global instance if available
export const prisma =
  global.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn'] : ['error'],
  });

// Assign Prisma client instance to the global var in development to prevent reinitialization
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
