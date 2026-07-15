import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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
    const mappedJobs = jobs.map(job => {
      const isRemote = job.location.toLowerCase().includes('remote') || job.title.toLowerCase().includes('remote');
      const isHybrid = job.location.toLowerCase().includes('hybrid') || job.title.toLowerCase().includes('hybrid');
      const mode = isRemote ? 'Remote' : (isHybrid ? 'Hybrid' : 'On-site');

      return {
        id: job.id,
        title: job.title,
        company: job.company || job.postedBy?.companyName || 'Hyriq Employer',
        companyName: job.company || job.postedBy?.companyName || 'Hyriq Employer',
        location: job.location,
        mode: mode,
        type: job.type,
        salary: job.salary,
        description: job.description,
        requirements: job.requirements,
        responsibilities: job.responsibilities,
        benefits: [],
        tags: job.tags,
        skills: job.tags || [],
        logoSeed: job.logo || job.company || 'H',
        postedDate: job.createdAt.toISOString()
      };
    });

    return NextResponse.json(mappedJobs);
  } catch (error: any) {
    console.error('Jobs GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}
