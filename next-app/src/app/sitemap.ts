import { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.hyriq.online';

  // Base routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/auth`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    }
  ];

  try {
    // Fetch active jobs dynamically
    const jobs = await prisma.job.findMany({
      select: { id: true, updatedAt: true },
      take: 500,
    });

    const jobRoutes: MetadataRoute.Sitemap = jobs.map(job => ({
      url: `${baseUrl}/jobs/${job.id}`,
      lastModified: job.updatedAt || new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    }));

    return [...routes, ...jobRoutes];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return routes;
  }
}
