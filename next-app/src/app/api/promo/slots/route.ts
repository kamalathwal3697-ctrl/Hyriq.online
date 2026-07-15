import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

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
