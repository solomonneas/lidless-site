import { SITE } from '../lib/site.ts';
import { TOOL_SLUGS } from '../lib/tools.ts';
import { getReleasePosts } from '../lib/releases.ts';

// trailingSlash:'never' - emit the home page at the bare origin and each tool
// page at /<slug> with NO trailing slash. lastmod is the build date.
const LASTMOD = new Date().toISOString().slice(0, 10);

export async function GET({ site }: { site?: URL }) {
  const origin = (site ?? new URL(SITE.url)).toString().replace(/\/+$/, '');
  const posts = await getReleasePosts();

  const entries: { loc: string; priority: string }[] = [
    { loc: `${origin}/`, priority: '1.0' },
    ...TOOL_SLUGS.map((slug) => ({ loc: `${origin}/${slug}`, priority: '0.7' })),
    { loc: `${origin}/blog`, priority: '0.6' },
    ...posts.map((p) => ({ loc: `${origin}/blog/${p.slug}`, priority: '0.5' })),
  ];

  const urls = entries
    .map(({ loc, priority }) =>
      [
        '  <url>',
        `    <loc>${loc}</loc>`,
        `    <lastmod>${LASTMOD}</lastmod>`,
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
