import { MetadataRoute } from 'next';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://hyriq.online';

  // Base routes
  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/auth`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }
  ];

  try {
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    // Fetch jobs to add to sitemap dynamically
    const jobs = await prisma.job.findMany({
      select: { id: true, updatedAt: true }
    });

    const jobRoutes = jobs.map(job => ({
      url: `${baseUrl}/jobs/${job.id}`,
      lastModified: job.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    await prisma.$disconnect();
    return [...routes, ...jobRoutes];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return routes;
  }
}
