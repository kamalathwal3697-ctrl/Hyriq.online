import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;

const globalForPrisma = global as unknown as { prisma: PrismaClient };

let prisma: PrismaClient;
if (process.env.NODE_ENV === 'production') {
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
} else {
  if (!globalForPrisma.prisma) {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    globalForPrisma.prisma = new PrismaClient({ adapter });
  }
  prisma = globalForPrisma.prisma;
}

export async function GET() {
  try {
    const candidateCount = await prisma.user.count({
      where: { role: 'candidate' }
    });
    
    // Default launch promotion starts at 500 slots. Minimum stays at 14 to maintain urgency.
    const slotsLeft = Math.max(14, 500 - candidateCount);

    return NextResponse.json({ slotsLeft });
  } catch (error) {
    console.error('Error fetching promo slots:', error);
    // Fallback value to avoid frontend error
    return NextResponse.json({ slotsLeft: 147 });
  }
}
