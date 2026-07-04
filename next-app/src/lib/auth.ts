import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'hyriq_super_secret_key_2026';

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('hyriq_token')?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded;
  } catch (err) {
    return null;
  }
}
