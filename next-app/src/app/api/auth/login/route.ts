import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { loginSchema } from '@/lib/validations';
import { rateLimit, rateLimitResponse } from '@/lib/rateLimit';
import { prisma } from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'hyriq_super_secret_key_2026';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rate = rateLimit(ip, 5, 60000); // 5 attempts/min max
    if (!rate.success) {
      return rateLimitResponse(rate.reset);
    }

    const body = await req.json();
    
    // Zod validation
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }
    const { email, password } = parsed.data;

    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } }
    });
    
    if (!user) {
      return NextResponse.json({ error: 'Wrong credentials' }, { status: 400 });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: 'Wrong credentials' }, { status: 400 });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    // Set HTTP-Only Cookie
    const cookieStore = await cookies();
    cookieStore.set('hyriq_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return NextResponse.json({
      user: { id: user.id, email: user.email, role: user.role, name: user.name }
    });
    
  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
