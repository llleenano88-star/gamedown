import type { MetadataRoute } from 'next';
import { getServices } from '@/lib/data';
import { problemsFor } from '@/lib/problems';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const svcs = await getServices();
  return [
    { url: base, changeFrequency: 'always', priority: 1 },
    { url: `${base}/hot`, changeFrequency: 'hourly', priority: 0.6 },
    ...svcs.flatMap((s) => [
      { url: `${base}/status/${s.slug}`, changeFrequency: 'always' as const, priority: 0.9 },
      ...Object.keys(problemsFor(s.slug)).map((p) => ({
        url: `${base}/status/${s.slug}/${p}`, changeFrequency: 'hourly' as const, priority: 0.7,
      })),
    ]),
  ];
}
