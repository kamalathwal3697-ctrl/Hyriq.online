import { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';

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

    return [...routes, ...jobRoutes];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return routes;
  }
}
