import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
  pool: pg.Pool | undefined;
};

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  if (!globalForPrisma.pool) {
    globalForPrisma.pool = new pg.Pool({
      connectionString,
      max: 1, // Keep connections to 1 in serverless to prevent Neon pool exhaustion
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  const adapter = new PrismaPg(globalForPrisma.pool);
  prisma = new PrismaClient({ adapter });
} else {
  if (!globalForPrisma.prisma) {
    globalForPrisma.pool = new pg.Pool({
      connectionString,
      max: 1,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
    const adapter = new PrismaPg(globalForPrisma.pool);
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  prisma = globalForPrisma.prisma;
}

export { prisma };
