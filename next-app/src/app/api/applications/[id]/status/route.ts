import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || !sessionUser.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: appId } = await params;
    const body = await req.json();
    const { status, recruiterSignature } = body;

    const user = await prisma.user.findFirst({
      where: { email: { equals: sessionUser.email, mode: 'insensitive' } }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify application exists
    const app = await prisma.application.findUnique({
      where: { id: appId },
      include: { job: true }
    });

    if (!app) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Security check: Only candidate of this application or poster of the job can modify it
    const isApplicant = app.applicantId === user.id;
    const isJobPoster = app.job.postedById === user.id;

    if (!isApplicant && !isJobPoster && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    
    if (recruiterSignature !== undefined) {
      updateData.recruiterSignature = recruiterSignature;
      updateData.recruiterSignedAt = new Date();
    }

    const updatedApp = await prisma.application.update({
      where: { id: appId },
      data: updateData
    });

    return NextResponse.json({ success: true, application: updatedApp });

  } catch (error) {
    console.error('Error updating application status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
