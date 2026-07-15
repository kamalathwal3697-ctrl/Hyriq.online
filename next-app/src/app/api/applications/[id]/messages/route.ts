import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || !sessionUser.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: appId } = await params;
    const body = await req.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

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

    // Security check & receiver identification
    let receiverId = '';
    if (app.applicantId === user.id) {
      receiverId = app.job.postedById;
    } else if (app.job.postedById === user.id) {
      receiverId = app.applicantId;
    } else if (user.role === 'admin') {
      receiverId = app.applicantId; // default fallback for admin test sends
    } else {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const message = await prisma.message.create({
      data: {
        applicationId: appId,
        senderId: user.id,
        receiverId,
        content: text
      }
    });

    return NextResponse.json({ success: true, message });

  } catch (error) {
    console.error('Error sending application message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
