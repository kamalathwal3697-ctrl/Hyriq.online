import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

import 'dotenv/config';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting data migration from db.json to PostgreSQL...');
  const dbPath = path.join(process.cwd(), 'db.json');
  if (!fs.existsSync(dbPath)) {
    console.error('db.json not found!');
    return;
  }

  const rawData = fs.readFileSync(dbPath, 'utf8');
  const data = JSON.parse(rawData);

  // Migrate Users
  if (data.users && Array.isArray(data.users)) {
    console.log(`Migrating ${data.users.length} users...`);
    for (const user of data.users) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: {},
        create: {
          id: user.id,
          email: user.email,
          passwordHash: user.passwordHash,
          role: user.role || 'candidate',
          name: user.name || null,
          phone: user.phone || null,
          bio: user.bio || null,
          skills: user.skills || [],
          experience: user.experience || null,
          resumeName: user.resumeName || null,
          onboardingCompleted: user.onboardingCompleted || false,
          subscriptionExpiry: user.subscriptionExpiry ? new Date(user.subscriptionExpiry) : null,
          preferences: user.preferences || null,
          companyName: user.companyName || null,
          companyBio: user.companyBio || null,
        },
      });
    }
  }

  // Migrate Jobs
  if (data.jobs && Array.isArray(data.jobs)) {
    console.log(`Migrating ${data.jobs.length} jobs...`);
    for (const job of data.jobs) {
      await prisma.job.upsert({
        where: { id: job.id },
        update: {},
        create: {
          id: job.id,
          title: job.title,
          company: job.company || 'Unknown Company',
          location: job.location,
          type: job.type || 'Full-time',
          salary: job.salary || null,
          description: job.description || '',
          requirements: job.requirements || [],
          responsibilities: job.responsibilities || [],
          tags: job.tags || [],
          logo: job.logo || null,
          postedById: job.postedBy || 'user-recruiter-1', // Fallback to a recruiter ID
          createdAt: job.createdAt ? new Date(job.createdAt) : new Date(),
        },
      });
    }
  }

  // Migrate Applications
  if (data.applications && Array.isArray(data.applications)) {
    console.log(`Migrating ${data.applications.length} applications...`);
    for (const app of data.applications) {
      await prisma.application.upsert({
        where: { id: app.id },
        update: {},
        create: {
          id: app.id,
          jobId: app.jobId,
          applicantId: app.candidateId || 'user-candidate-1', // default fallback
          status: app.status || 'pending',
          coverLetter: app.coverLetter || null,
          appliedAt: app.appliedAt ? new Date(app.appliedAt) : new Date(),
        },
      });
    }
  }

  // Migrate Messages
  if (data.messages && Array.isArray(data.messages)) {
    console.log(`Migrating ${data.messages.length} messages...`);
    for (const msg of data.messages) {
      await prisma.message.upsert({
        where: { id: msg.id },
        update: {},
        create: {
          id: msg.id,
          senderId: msg.sender === 'candidate' ? 'user-candidate-1' : 'user-recruiter-1',
          receiverId: msg.sender === 'candidate' ? 'user-recruiter-1' : 'user-candidate-1',
          content: msg.text || '',
          read: msg.read || false,
          createdAt: new Date(),
        },
      });
    }
  }

  console.log('Migration completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
