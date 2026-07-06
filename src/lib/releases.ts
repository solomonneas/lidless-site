// Build the changelog blog from the GitHub Releases API across every tool in
// the catalog. No committed markdown: this runs at build time. Fails soft, a
// rate-limited or offline build just yields fewer (or zero) posts.
import { TOOLS } from './tools';
import { fetchReleases } from './github-data';

export interface ReleasePost {
  /** Tool display name, e.g. "wazuh-mcp". */
  tool: string;
  /** Tool slug from tools.ts, e.g. "wazuh-mcp". */
  toolSlug: string;
  /** Post slug / route: `<toolSlug>-<version>`. */
  slug: string;
  /** Tool category, drives the blog filter. */
  category: string;
  /** Release tag, e.g. "v1.2.0". */
  tag: string;
  /** Version without the v, e.g. "1.2.0". */
  version: string;
  /** Release name, or the tag when unnamed. */
  name: string;
  /** ISO published date. */
  date: string;
  /** Release notes markdown. */
  body: string;
  /** GitHub release URL. */
  url: string;
  /** owner/repo, for the per-post badges. */
  repo: string;
}

/** Pull owner + repo out of a GitHub repo URL. */
export function parseRepo(repoUrl: string): { owner: string; repo: string } | null {
  const m = repoUrl.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git|\/|$)/);
  return m ? { owner: m[1], repo: m[2] } : null;
}

/** Every published (non-prerelease) release across the catalog, newest first. */
export async function getReleasePosts(): Promise<ReleasePost[]> {
  const perTool = await Promise.all(
    TOOLS.map(async (tool): Promise<ReleasePost[]> => {
      const parsed = parseRepo(tool.repo);
      if (!parsed) return [];
      const releases = await fetchReleases(parsed.owner, parsed.repo, 20);
      return releases
        .filter((r) => !r.preRelease && Boolean(r.publishedAt))
        .map((r) => {
          const version = r.tag.replace(/^v/, '');
          return {
            tool: tool.name,
            toolSlug: tool.slug,
            slug: `${tool.slug}-${version}`,
            category: tool.category,
            tag: r.tag,
            version,
            name: r.name || r.tag,
            date: r.publishedAt,
            body: r.body || '',
            url: r.url,
            repo: `${parsed.owner}/${parsed.repo}`,
          };
        });
    }),
  );
  return perTool.flat().sort((a, b) => b.date.localeCompare(a.date));
}
