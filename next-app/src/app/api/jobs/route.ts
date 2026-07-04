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
    const jobs = await prisma.job.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        postedBy: {
          select: { name: true, companyName: true, companyBio: true }
        }
      }
    });

    // Map Prisma jobs to match frontend expectations
    const mappedJobs = jobs.map(job => ({
      id: job.id,
      title: job.title,
      company: job.company || job.postedBy?.companyName || 'Hyriq Employer',
      location: job.location,
      type: job.type,
      salary: job.salary,
      description: job.description,
      requirements: job.requirements,
      responsibilities: job.responsibilities,
      tags: job.tags,
      logoSeed: job.logo || job.company || 'H',
      postedDate: job.createdAt.toISOString()
    }));

    return NextResponse.json(mappedJobs);
  } catch (error: any) {
    console.error('Jobs GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}
