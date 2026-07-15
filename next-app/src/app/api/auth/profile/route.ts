import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function PUT(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser || !sessionUser.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const user = await prisma.user.findFirst({
      where: { email: { equals: sessionUser.email, mode: 'insensitive' } }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Determine what to update based on user role
    const updateData: any = {};
    
    if (user.role === 'candidate') {
      if (body.name !== undefined) updateData.name = body.name;
      if (body.phone !== undefined) updateData.phone = body.phone;
      if (body.bio !== undefined) updateData.bio = body.bio;
      if (body.skills !== undefined) updateData.skills = body.skills;
      if (body.experience !== undefined) updateData.experience = body.experience;
      if (body.resumeName !== undefined) updateData.resumeName = body.resumeName;
      if (body.onboardingCompleted !== undefined) updateData.onboardingCompleted = body.onboardingCompleted;
      if (body.preferences !== undefined) updateData.preferences = body.preferences;
    } else if (user.role === 'recruiter') {
      if (body.name !== undefined) updateData.name = body.name;
      if (body.companyName !== undefined) updateData.companyName = body.companyName;
      if (body.companyBio !== undefined) updateData.companyBio = body.companyBio;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        name: updatedUser.name,
        phone: updatedUser.phone,
        bio: updatedUser.bio,
        skills: updatedUser.skills,
        experience: updatedUser.experience,
        resumeName: updatedUser.resumeName,
        onboardingCompleted: updatedUser.onboardingCompleted,
        preferences: updatedUser.preferences,
        companyName: updatedUser.companyName,
        companyBio: updatedUser.companyBio
      }
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
