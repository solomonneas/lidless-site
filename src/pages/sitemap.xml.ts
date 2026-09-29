import { SITE } from '../lib/site.ts';
import { TOOL_SLUGS } from '../lib/tools.ts';
import { getReleasePosts } from '../lib/releases.ts';

// trailingSlash:'never' - emit the home page at the bare origin and each tool
// page at /<slug> with NO trailing slash. Per-version /blog/<tool>-<version>
// URLs are intentionally excluded (they are noindexed); each tool's
// /changelog/<toolSlug> page carries lastmod = its newest release date.
const FALLBACK_LASTMOD = new Date().toISOString().slice(0, 10);

export async function GET({ site }: { site?: URL }) {
  const origin = (site ?? new URL(SITE.url)).toString().replace(/\/+$/, '');
  const posts = await getReleasePosts();

  // Posts arrive newest-first, so the first sighting per tool is the newest.
  const newestByTool = new Map<string, string>();
  for (const p of posts) {
    if (!newestByTool.has(p.toolSlug)) newestByTool.set(p.toolSlug, p.date.slice(0, 10));
  }

  const entries: { loc: string; lastmod: string; priority: string }[] = [
    { loc: `${origin}/`, lastmod: FALLBACK_LASTMOD, priority: '1.0' },
    ...TOOL_SLUGS.map((slug) => ({ loc: `${origin}/${slug}`, lastmod: FALLBACK_LASTMOD, priority: '0.7' })),
    { loc: `${origin}/blog`, lastmod: FALLBACK_LASTMOD, priority: '0.6' },
    { loc: `${origin}/docs`, lastmod: FALLBACK_LASTMOD, priority: '0.6' },
    // Only tools with at least one release: empty changelog pages are noindexed.
    ...TOOL_SLUGS.filter((slug) => newestByTool.has(slug)).map((slug) => ({
      loc: `${origin}/changelog/${slug}`,
      lastmod: newestByTool.get(slug)!,
      priority: '0.5',
    })),
  ];

  const urls = entries
    .map(({ loc, lastmod, priority }) =>
      [
        '  <url>',
        `    <loc>${loc}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        '    <changefreq>weekly</changefreq>',
        `    <priority>${priority}</priority>`,
        '  </url>',
      ].join('\n'),
    )
    .join('\n');

  return new Response(
    [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      urls,
      '</urlset>',
    ].join('\n'),
    { headers: { 'Content-Type': 'application/xml' } },
  );
}
