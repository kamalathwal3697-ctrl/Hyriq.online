import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { signupSchema } from '@/lib/validations';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { rateLimit, rateLimitResponse } from '@/lib/rateLimit';

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

const JWT_SECRET = process.env.JWT_SECRET || 'hyriq_super_secret_key_2026';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rate = rateLimit(ip, 3, 60000); // Max 3 registrations per minute per IP
    if (!rate.success) {
      return rateLimitResponse(rate.reset);
    }

    const body = await req.json();
    
    // Zod validation
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input data' }, { status: 400 });
    }
    const { email, password, role, name, phone, bio } = parsed.data;
    const { paymentId } = body; // Not in standard schema because of oauth/coupon overrides

    const exists = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } }
    });
    
    if (exists) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    if (role === 'candidate') {
      if (!paymentId) {
        return NextResponse.json({
          error: 'Registration fee required for job seekers.',
          requiresPayment: true,
          amount: 99,
          message: 'A one-time registration fee of ₹99 is required for job seekers. Valid for 1 year.'
        }, { status: 402 });
      }

      // Prevent payment replay attack: check if payment ID was already used
      if (!paymentId.startsWith('pay_mock_')) {
        const paymentExists = await prisma.user.findFirst({
          where: { paymentId }
        });
        if (paymentExists) {
          return NextResponse.json({ error: 'This Payment ID has already been used to register an account.' }, { status: 400 });
        }
      }
    }

    const salt = bcrypt.genSaltSync(10);
    const actualPassword = password || (Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10));
    const passwordHash = bcrypt.hashSync(actualPassword, salt);
    const userId = `user-${Date.now()}`;

    const subscriptionExpiry = role === 'candidate'
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      : null;

    const newUser = await prisma.user.create({
      data: {
        id: userId,
        email: email.toLowerCase(),
        passwordHash,
        role,
        name,
        phone: phone || null,
        bio: bio || null,
        skills: [],
        experience: role === 'candidate' ? 'Entry-level' : null,
        resumeName: role === 'candidate' ? 'No resume uploaded' : null,
        onboardingCompleted: false,
        subscriptionExpiry,
        paymentId: paymentId || null,
        companyName: role === 'recruiter' ? `${name}'s Organization` : null,
        companyBio: role === 'recruiter' ? 'We are hiring progressive talent.' : null
      }
    });

    const token = jwt.sign({ id: userId, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

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
      user: { id: userId, email: newUser.email, role: newUser.role, name: newUser.name, subscriptionExpiry }
    }, { status: 201 });
    
  } catch (error) {
    console.error('Signup Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
