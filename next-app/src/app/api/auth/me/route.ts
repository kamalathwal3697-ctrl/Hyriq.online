import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

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

    return NextResponse.json({
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        name: user.name, 
        phone: user.phone,
        bio: user.bio,
        skills: user.skills,
        experience: user.experience,
        resumeName: user.resumeName,
        onboardingCompleted: user.onboardingCompleted,
        subscriptionExpiry: user.subscriptionExpiry?.toISOString() || null,
        preferences: user.preferences,
        companyName: user.companyName,
        companyBio: user.companyBio
      }
    });
  } catch (error) {
    console.error('Error in GET /api/auth/me:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
