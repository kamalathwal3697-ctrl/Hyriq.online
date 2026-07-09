import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'hyriq_super_secret_key_2026';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('hyriq_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized. No session token found.' }, { status: 401 });
    }

    // Verify token (even if expired, we can extract details and re-issue a rotated token)
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET) as any;
    } catch (err: any) {
      // If token is expired, we can still rotate it if it was signed with our secret
      if (err.name === 'TokenExpiredError') {
        decoded = jwt.decode(token);
      } else {
        return NextResponse.json({ error: 'Unauthorized. Invalid token.' }, { status: 401 });
      }
    }

    if (!decoded || !decoded.id) {
      return NextResponse.json({ error: 'Unauthorized. Malformed token.' }, { status: 401 });
    }

    // Rotate/Sign a new token
    const newToken = jwt.sign(
      { id: decoded.id, email: decoded.email, role: decoded.role },
      JWT_SECRET,
      { expiresIn: '7d' } // Rotates expiration forward
    );

    // Set updated cookie
    cookieStore.set('hyriq_token', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return NextResponse.json({
      success: true,
      user: { id: decoded.id, email: decoded.email, role: decoded.role }
    });

  } catch (error: any) {
    console.error('Refresh Token Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
