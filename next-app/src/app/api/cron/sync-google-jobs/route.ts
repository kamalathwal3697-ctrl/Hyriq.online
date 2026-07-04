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

export async function GET(req: Request) {
  try {
    // Basic security for cron (in production, use authorization header)
    const authHeader = req.headers.get('authorization');
    const isCron = req.headers.get('x-vercel-cron') === '1' || authHeader === `Bearer ${process.env.CRON_SECRET}`;
    
    // Allow manual trigger without auth only in development
    if (process.env.NODE_ENV === 'production' && !isCron) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    const GOOGLE_CX = process.env.GOOGLE_CX;

    if (!GOOGLE_API_KEY || !GOOGLE_CX) {
      return NextResponse.json({ error: 'Google Search API keys missing' }, { status: 500 });
    }

    // specific query provided by user (jobs in bathinda)
    const location = 'Bathinda';
    const queries = [
      'jobs in bathinda',
      'latest jobs in bathinda 2026',
      'hiring now bathinda',
      'fresher jobs in bathinda'
    ];

    const allResults: any[] = [];

    for (const query of queries) {
      try {
        const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&q=${encodeURIComponent(query)}&num=5&dateRestrict=w1`;
        const apiRes = await fetch(searchUrl);
        if (!apiRes.ok) continue;
        const data = await apiRes.json();
        if (data.items) {
          allResults.push(...data.items);
        }
      } catch (e) {
        console.error('Google Search API error:', e);
      }
    }

    if (allResults.length === 0) {
      return NextResponse.json({ message: 'No new Google results found', count: 0 });
    }

    // Deduplicate by URL
    const seen = new Set();
    const uniqueResults = allResults.filter(item => {
      if (seen.has(item.link)) return false;
      seen.add(item.link);
      return true;
    });

    const jobsToImport = uniqueResults.slice(0, 10);
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

    for (let i = 0; i < jobsToImport.length; i++) {
      const item = jobsToImport[i];
      let cleanTitle = item.title || 'Job Opening in Bathinda';
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

      // Check if job with this exact title and company exists recently (prevent dupes across cron runs)
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
          location: 'Bathinda, Punjab',
          type: 'Full-time',
          salary: salaryRanges[i % salaryRanges.length],
          description: `${cleanDesc}\n\nOriginal Source: ${item.link}`,
          requirements: ['Relevant experience as per original post', 'Willingness to work in Bathinda'],
          responsibilities: ['Refer to original post for complete details'],
          tags: ['External', 'Google Import', 'Bathinda'],
          logo: companyName,
          postedById: recruiter.id,
        }
      });

      insertedJobs.push(newJob);
    }

    return NextResponse.json({ 
      message: 'Successfully synced with Google Jobs', 
      found: uniqueResults.length,
      inserted: insertedJobs.length,
      jobs: insertedJobs 
    });

  } catch (error: any) {
    console.error('Cron Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
