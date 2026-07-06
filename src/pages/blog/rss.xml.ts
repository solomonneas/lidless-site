import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getReleasePosts } from '../../lib/releases.ts';
import { SITE } from '../../lib/site.ts';

export async function GET(context: APIContext) {
  const posts = await getReleasePosts();
  return rss({
    title: 'Lidless Labs release log',
    description: 'Releases across the Lidless tools: SOC, network, and homelab.',
    site: context.site ?? SITE.url,
    items: posts.map((p) => ({
      title: `${p.tool} ${p.tag}`,
      description: p.name && p.name !== p.tag ? p.name : `${p.tool} ${p.tag} release notes.`,
      pubDate: new Date(p.date),
      link: `/blog/${p.slug}`,
      categories: [p.category],
    })),
  });
}
