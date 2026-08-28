import type { MetadataRoute } from 'next';
import { getServiceSupabase } from '@/lib/supabaseService';
import { isPublicNoticeVisible, type PublicNotice } from '@/lib/notices';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.donggori.com';

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/factories`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/matching`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/service`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/work-order`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/design-request`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/faq`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/notices`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/terms/service`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms/privacy`, changeFrequency: 'yearly', priority: 0.3 },
  ];

  try {
    const supabase = getServiceSupabase();
    const [factoriesResult, noticesResult] = await Promise.all([
      supabase.from('donggori').select('id,company_name').neq('company_name', '희망사'),
      supabase.from('notices').select('id,start_at,end_at,updated_at').eq('is_active', true),
    ]);

    const factoryRoutes: MetadataRoute.Sitemap = (factoriesResult.data || []).map((factory: { id: string | number }) => ({
      url: `${baseUrl}/factories/${encodeURIComponent(String(factory.id))}`,
      changeFrequency: 'weekly',
      priority: 0.7,
    }));
    const noticeRoutes: MetadataRoute.Sitemap = ((noticesResult.data || []) as Array<PublicNotice & { updated_at?: string | null }>)
      .filter((notice) => isPublicNoticeVisible(notice))
      .map((notice) => ({
        url: `${baseUrl}/notices/${encodeURIComponent(String(notice.id))}`,
        lastModified: notice.updated_at ? new Date(notice.updated_at) : undefined,
        changeFrequency: 'monthly',
        priority: 0.5,
      }));

    return [...staticRoutes, ...factoryRoutes, ...noticeRoutes];
  } catch {
    return staticRoutes;
  }
}
