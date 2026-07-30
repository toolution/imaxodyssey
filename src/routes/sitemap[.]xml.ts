import { createFileRoute } from '@tanstack/react-router';

import { localizedUrl } from '@/lib/seo';
import { baseLocale, locales, type Locale } from '@/paraglide/runtime.js';
import { getLocalPosts, mergePosts } from '@/content/posts';

type ChangeFrequency =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never';

type Entry = {
  path: string;
  lastModified?: string;
  changeFrequency: ChangeFrequency;
  priority: number;
  availableLocales?: readonly Locale[];
};

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    switch (character) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return '&apos;';
    }
  });
}

function validLastModified(value: string | undefined): string | undefined {
  if (!value || Number.isNaN(Date.parse(value))) return undefined;
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? value
    : new Date(value).toISOString();
}

function entryXml(entry: Entry): string {
  const availableLocales = entry.availableLocales ?? locales;
  const defaultLocale = availableLocales.includes(baseLocale)
    ? baseLocale
    : availableLocales[0];
  const alternates = [
    ...availableLocales.map(
      (locale) =>
        `    <xhtml:link rel="alternate" hreflang="${locale}" href="${escapeXml(localizedUrl(entry.path, locale))}"/>`
    ),
    ...(defaultLocale
      ? [
          `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(localizedUrl(entry.path, defaultLocale))}"/>`,
        ]
      : []),
  ].join('\n');
  const lastModified = validLastModified(entry.lastModified);

  return [
    '  <url>',
    `    <loc>${escapeXml(localizedUrl(entry.path, defaultLocale ?? baseLocale))}</loc>`,
    alternates,
    lastModified ? `    <lastmod>${escapeXml(lastModified)}</lastmod>` : null,
    `    <changefreq>${entry.changeFrequency}</changefreq>`,
    `    <priority>${entry.priority}</priority>`,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n');
}

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () => {
        const entries: Entry[] = [
          { path: '/', changeFrequency: 'weekly', priority: 1 },
          { path: '/pricing', changeFrequency: 'monthly', priority: 0.7 },
          { path: '/blog', changeFrequency: 'weekly', priority: 0.8 },
          {
            path: '/privacy-policy',
            lastModified: '2026-05-21',
            changeFrequency: 'yearly',
            priority: 0.3,
          },
          {
            path: '/terms-of-service',
            lastModified: '2026-05-21',
            changeFrequency: 'yearly',
            priority: 0.3,
          },
        ];

        let localPosts = getLocalPosts(baseLocale);
        try {
          const { listPublishedArticles } =
            await import('@/modules/posts/service');
          const dbPosts = (await listPublishedArticles({ limit: 50_000 })).map(
            (post) => ({
              slug: post.slug,
              title: post.title || post.slug,
              description: post.description || '',
              image: post.image || undefined,
              createdAt: new Date(post.createdAt).toISOString(),
              updatedAt: new Date(post.updatedAt).toISOString(),
              authorName: post.authorName || undefined,
              authorImage: post.authorImage || undefined,
              source: 'db' as const,
            })
          );
          localPosts = mergePosts(dbPosts, localPosts);
        } catch {
          // Database unavailable: retain static and bundled local entries.
        }

        entries.push(
          ...localPosts.map((post) => ({
            path: `/blog/${encodeURIComponent(post.slug)}`,
            lastModified: 'updatedAt' in post ? post.updatedAt : post.createdAt,
            changeFrequency: 'monthly' as const,
            priority: 0.6,
            // Database content has no translation model, so advertise only its
            // actual localized URL instead of fabricating a language alternate.
            ...(post.source === 'db'
              ? { availableLocales: [baseLocale] as const }
              : {}),
          }))
        );

        const xml = [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
          ...entries.map(entryXml),
          '</urlset>',
          '',
        ].join('\n');

        return new Response(xml, {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
          },
        });
      },
    },
  },
});
