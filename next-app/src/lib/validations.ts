import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

export const signupSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }).or(z.literal('')),
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  role: z.enum(['candidate', 'recruiter']),
  phone: z.string().optional(),
  bio: z.string().optional(),
});
