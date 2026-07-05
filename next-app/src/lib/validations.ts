import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().default(''),
  password: z.string().default(''),
});

export const signupSchema = z.object({
  email: z.string().default(''),
  password: z.string().default(''),
  name: z.string().default(''),
  role: z.enum(['candidate', 'recruiter']),
  phone: z.string().default(''),
  bio: z.string().default(''),
});
