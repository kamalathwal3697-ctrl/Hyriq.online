import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

// Helper to map DB message structure to frontend chatHistory shape
function mapMessagesToChatHistory(messages: any[], applicantId: string) {
  return messages.map(msg => ({
    id: msg.id,
    sender: msg.senderId === applicantId ? 'candidate' : 'recruiter',
    text: msg.content,
    timestamp: msg.createdAt.toISOString()
  }));
}

export async function GET() {
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

    let applications;

    if (user.role === 'candidate') {
      // Find candidate's applications
      const dbApps = await prisma.application.findMany({
        where: { applicantId: user.id },
        include: {
          job: {
            include: {
              postedBy: true
            }
          },
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        },
        orderBy: { appliedAt: 'desc' }
      });

      applications = dbApps.map(app => ({
        id: app.id,
        jobId: app.jobId,
        applicantId: app.applicantId,
        status: app.status,
        coverLetter: app.coverLetter,
        screeningAnswers: app.screeningAnswers,
        candidateSignature: app.candidateSignature,
        candidateSignedAt: app.candidateSignedAt?.toISOString() || null,
        recruiterSignature: app.recruiterSignature,
        recruiterSignedAt: app.recruiterSignedAt?.toISOString() || null,
        appliedAt: app.appliedAt.toISOString(),
        job: {
          id: app.job.id,
          title: app.job.title,
          company: app.job.company,
          location: app.job.location,
          type: app.job.type,
          salary: app.job.salary,
          description: app.job.description,
          logo: app.job.logo
        },
        recruiterName: app.job.postedBy?.name || 'Recruiter',
        chatHistory: mapMessagesToChatHistory(app.messages, app.applicantId)
      }));

    } else if (user.role === 'recruiter') {
      // Find applications for jobs posted by this recruiter
      const dbApps = await prisma.application.findMany({
        where: {
          job: {
            postedById: user.id
          }
        },
        include: {
          job: true,
          applicant: true,
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        },
        orderBy: { appliedAt: 'desc' }
      });

      applications = dbApps.map(app => ({
        id: app.id,
        jobId: app.jobId,
        applicantId: app.applicantId,
        status: app.status,
        coverLetter: app.coverLetter,
        screeningAnswers: app.screeningAnswers,
        candidateSignature: app.candidateSignature,
        candidateSignedAt: app.candidateSignedAt?.toISOString() || null,
        recruiterSignature: app.recruiterSignature,
        recruiterSignedAt: app.recruiterSignedAt?.toISOString() || null,
        appliedAt: app.appliedAt.toISOString(),
        job: {
          id: app.job.id,
          title: app.job.title,
          company: app.job.company,
          location: app.job.location,
          type: app.job.type,
          salary: app.job.salary,
          description: app.job.description,
          logo: app.job.logo
        },
        applicant: {
          id: app.applicant.id,
          name: app.applicant.name,
          email: app.applicant.email,
          phone: app.applicant.phone,
          bio: app.applicant.bio,
          skills: app.applicant.skills,
          experience: app.applicant.experience,
          resumeName: app.applicant.resumeName
        },
        recruiterName: user.name || 'Recruiter',
        chatHistory: mapMessagesToChatHistory(app.messages, app.applicantId)
      }));

    } else {
      // Admin/Moderator/Support see all
      const dbApps = await prisma.application.findMany({
        include: {
          job: true,
          applicant: true,
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        },
        orderBy: { appliedAt: 'desc' }
      });

      applications = dbApps.map(app => ({
        id: app.id,
        jobId: app.jobId,
        applicantId: app.applicantId,
        status: app.status,
        coverLetter: app.coverLetter,
        screeningAnswers: app.screeningAnswers,
        candidateSignature: app.candidateSignature,
        candidateSignedAt: app.candidateSignedAt?.toISOString() || null,
        recruiterSignature: app.recruiterSignature,
        recruiterSignedAt: app.recruiterSignedAt?.toISOString() || null,
        appliedAt: app.appliedAt.toISOString(),
        job: app.job,
        applicant: app.applicant,
        chatHistory: mapMessagesToChatHistory(app.messages, app.applicantId)
      }));
    }

    return NextResponse.json(applications);

  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
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

    if (user.role !== 'candidate') {
      return NextResponse.json({ error: 'Only candidates can apply to jobs' }, { status: 403 });
    }

    const body = await req.json();
    const { jobId, candidateSignature } = body;

    if (!jobId) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    // Check if already applied
    const existingApp = await prisma.application.findFirst({
      where: {
        jobId,
        applicantId: user.id
      }
    });

    if (existingApp) {
      return NextResponse.json({ error: 'Already applied to this job' }, { status: 400 });
    }

    // Create the application
    const newApp = await prisma.application.create({
      data: {
        jobId,
        applicantId: user.id,
        candidateSignature: candidateSignature || null,
        candidateSignedAt: candidateSignature ? new Date() : null,
        status: 'pending'
      }
    });

    return NextResponse.json(newApp);

  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
