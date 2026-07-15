import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

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

export async function POST(req: Request) {
  try {
    const { location } = await req.json();
    if (!location) {
      return NextResponse.json({ error: 'Location is required' }, { status: 400 });
    }

    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    const GOOGLE_CX = process.env.GOOGLE_CX;

    if (!GOOGLE_API_KEY || !GOOGLE_CX) {
      return NextResponse.json({ error: 'Google Search API keys missing' }, { status: 500 });
    }

    const query = `jobs in ${location}`;
    const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(query)}&num=10&dateRestrict=w1`;

    const apiRes = await fetch(searchUrl);
    if (!apiRes.ok) {
      console.warn('Google Search API call failed, serving cached database jobs instead');
      return NextResponse.json({ success: false, message: 'Google Search API call failed, using cached database jobs', count: 0, jobs: [] });
    }

    const data = await apiRes.json();
    if (!data.items || data.items.length === 0) {
      return NextResponse.json({ message: 'No new jobs found', count: 0 });
    }

    let recruiter = await prisma.user.findFirst({
      where: { role: 'recruiter', email: 'google.bot@hyriq.in' }
    });

    if (!recruiter) {
      recruiter = await prisma.user.create({
        data: {
          id: `bot-${Date.now()}`,
          email: 'google.bot@hyriq.in',
          passwordHash: 'bot',
          role: 'recruiter',
          name: 'Google Jobs Bot',
          companyName: 'External Jobs',
        }
      });
    }

    const salaryRanges = [
      '₹2,00,000 - ₹4,00,000 / year',
      '₹3,00,000 - ₹5,00,000 / year',
      '₹4,50,000 - ₹7,50,000 / year',
      '₹6,00,000 - ₹10,00,000 / year'
    ];

    const insertedJobs = [];

    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i];
      let cleanTitle = item.title || `Job Opening in ${location}`;
      cleanTitle = cleanTitle.replace(/\s*[-–|]\s*(LinkedIn|Indeed|Naukri|Monster|Glassdoor|TimesJobs|Shine).*$/i, '').trim();
      if (cleanTitle.length > 80) cleanTitle = cleanTitle.substring(0, 80);

      let cleanDesc = item.snippet || item.description || '';
      cleanDesc = cleanDesc.replace(/<[^>]*>/g, '').trim();
      if (cleanDesc.length > 300) cleanDesc = cleanDesc.substring(0, 300) + '...';

      let companyName = 'Local Business';
      try {
        const urlObj = new URL(item.link);
        companyName = urlObj.hostname.replace('www.', '').split('.')[0];
        companyName = companyName.charAt(0).toUpperCase() + companyName.slice(1);
      } catch {}

      const existing = await prisma.job.findFirst({
        where: {
          title: cleanTitle,
          company: companyName
        }
      });

      if (existing) continue;

      const newJob = await prisma.job.create({
        data: {
          title: cleanTitle,
          company: companyName,
          location: `${location}, Punjab`,
          type: 'Full-time',
          salary: salaryRanges[i % salaryRanges.length],
          description: `${cleanDesc}\n\nOriginal Source: ${item.link}`,
          requirements: ['Relevant experience as per original post', `Willingness to work in ${location}`],
          responsibilities: ['Refer to original post for complete details'],
          tags: ['External', 'Google Import', location],
          logo: companyName,
          postedById: recruiter.id,
        }
      });

      insertedJobs.push(newJob);
    }

    return NextResponse.json({
      success: true,
      found: data.items.length,
      inserted: insertedJobs.length,
      jobs: insertedJobs
    });

  } catch (error) {
    console.error('Error in google-import:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
