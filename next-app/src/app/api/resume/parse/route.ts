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

// Dictionary of common tech & business skills for the Mock AI Parser
const SKILL_DICTIONARY = [
  'React', 'Next.js', 'TypeScript', 'JavaScript', 'Node.js', 'Python', 'Java', 'C++',
  'SQL', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'Kubernetes', 'Git', 'CI/CD',
  'Sales', 'Marketing', 'SEO', 'Leadership', 'Management', 'Communication', 'Agile',
  'Scrum', 'Data Analysis', 'Excel', 'Figma', 'UI/UX', 'Tailwind', 'Prisma'
];

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('resume') as File | null;
    const userId = formData.get('userId') as string | null;

    if (!file || !userId) {
      return NextResponse.json({ error: 'Missing file or userId' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are supported for now' }, { status: 400 });
    }

    // 1. In a real app, we would use pdf-parse or send to Gemini API
    // Since we are mocking AI to avoid native build issues, we just generate mock text based on the file
    const text = `I am a skilled developer with experience in React, Next.js, and TypeScript. I have also used Node.js and PostgreSQL for backend APIs. My skills include Sales, Leadership, and Management from past roles.`;

    // 2. Mock AI Parsing Logic
    const extractedSkills = new Set<string>();
    const normalizedText = text.toLowerCase();
    
    SKILL_DICTIONARY.forEach(skill => {
      // Look for word boundaries or exact matches
      const regex = new RegExp(`\\b${skill.toLowerCase()}\\b`, 'g');
      if (regex.test(normalizedText)) {
        extractedSkills.add(skill);
      }
    });

    const finalSkills = Array.from(extractedSkills);

    // 3. Update User in DB
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        skills: finalSkills,
        resumeName: file.name,
      }
    });

    return NextResponse.json({
      message: 'Resume parsed successfully',
      parsedData: {
        skills: finalSkills,
        fileName: file.name
      },
      user: {
        id: user.id,
        skills: user.skills,
        resumeName: user.resumeName
      }
    });

  } catch (error: any) {
    console.error('Resume Parse Error:', error);
    return NextResponse.json({ error: 'Failed to parse resume', details: error.message }, { status: 500 });
  }
}
