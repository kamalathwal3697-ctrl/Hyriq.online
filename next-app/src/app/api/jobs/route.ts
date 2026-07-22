import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

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
        postedDate: job.createdAt.toISOString(),
        recruiterId: job.postedById
      };
    });

    return NextResponse.json(mappedJobs);
  } catch (error: any) {
    console.error('Jobs GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || !sessionUser.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { email: { equals: sessionUser.email, mode: 'insensitive' } }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.role !== 'recruiter') {
      return NextResponse.json({ error: 'Forbidden: Only recruiters can post jobs' }, { status: 403 });
    }

    const body = await req.json();
    const { title, companyName, location, type, salary, description, skills, requirements } = body;

    if (!title || !salary || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newJob = await prisma.job.create({
      data: {
        title,
        company: companyName || user.companyName || 'Hyriq Employer',
        location: location || 'Remote',
        type: type || 'Full-time',
        salary,
        description,
        tags: skills || [],
        requirements: requirements || [],
        responsibilities: [],
        postedById: user.id
      }
    });

    // Return the mapped job matching frontend expectations
    const mappedJob = {
      id: newJob.id,
      title: newJob.title,
      company: newJob.company,
      companyName: newJob.company,
      location: newJob.location,
      mode: newJob.location.toLowerCase().includes('remote') ? 'Remote' : (newJob.location.toLowerCase().includes('hybrid') ? 'Hybrid' : 'On-site'),
      type: newJob.type,
      salary: newJob.salary,
      description: newJob.description,
      requirements: newJob.requirements,
      responsibilities: newJob.responsibilities,
      benefits: [],
      tags: newJob.tags,
      skills: newJob.tags,
      logoSeed: newJob.logo || newJob.company || 'H',
      postedDate: newJob.createdAt.toISOString(),
      recruiterId: newJob.postedById
    };

    return NextResponse.json(mappedJob);
  } catch (error: any) {
    console.error('Jobs POST Error:', error);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }
}
