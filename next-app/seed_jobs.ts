import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // We need a recruiter user to attach the jobs to.
  // If none exists, we'll create a dummy one.
  let recruiter = await prisma.user.findFirst({
    where: { role: 'recruiter' }
  });

  if (!recruiter) {
    recruiter = await prisma.user.create({
      data: {
        id: `recruiter-${Date.now()}`,
        email: 'hr@hyriq.in',
        passwordHash: 'dummy',
        role: 'recruiter',
        name: 'Hyriq HR',
        companyName: 'Hyriq Official',
      }
    });
  }

  // Create the two jobs
  const job1 = await prisma.job.create({
    data: {
      title: 'Sales Executive (Boy/Girl)',
      company: 'Hyriq Official',
      location: 'Pan India (Remote/On-site)',
      type: 'Full-time',
      salary: '₹8,000 - ₹15,000',
      description: 'We are looking for dynamic, motivated, and energetic individuals to fill immediate openings in our growing team. Both freshers and experienced candidates are welcome to apply! 3 Openings available.',
      requirements: ['12th Pass or above', 'Good communication & confidence'],
      responsibilities: ['Interact with customers and explain product/service benefits.', 'Meet daily/weekly sales targets.', 'Maintain a positive and professional attitude.'],
      tags: ['Sales', 'Executive', 'Fresher'],
      logo: 'Hyriq',
      postedById: recruiter.id,
      createdAt: new Date() // Current time, so it stays on top
    }
  });

  const job2 = await prisma.job.create({
    data: {
      title: 'Team Leader (TL - Male)',
      company: 'Hyriq Official',
      location: 'Pan India (Remote/On-site)',
      type: 'Full-time',
      salary: '₹15,000 - ₹20,000',
      description: 'We are looking for a dynamic and motivated Team Leader to fill immediate openings in our growing team. Experienced candidates only. 1 Opening available.',
      requirements: ['Graduate / Experienced', 'Leadership skills & sales experience'],
      responsibilities: ['Manage, motivate, and guide a team of 3-4 sales executives.', 'Track team performance and ensure targets are met.', 'Provide daily reporting to management.'],
      tags: ['Sales', 'Team Leader', 'Management'],
      logo: 'Hyriq',
      postedById: recruiter.id,
      createdAt: new Date(Date.now() + 1000) // Ensure it is literally the latest
    }
  });

  console.log('Successfully seeded jobs:', job1.title, job2.title);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
