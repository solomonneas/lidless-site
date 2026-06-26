// Canonical SEO contract for the Lidless Labs site.
//
// Derived from the shared Escoffier fleet SEO contract (escoffier-fleet-kit/seo/seo.ts),
// retargeted for Lidless: the open-source security / netops / homelab tooling lab.
// Pairs with Seo.astro (the shared <head> component). Together they own everything
// SEO so the head never drifts: title, description, canonical, Open Graph, Twitter, JSON-LD.
//
// Decisions baked in: twitter handle @solomonneas, trailingSlash:'never' (canonical
// strips the trailing slash), OG cards render at 2400x1260, dark-watch theme color.
// Free, open-source tools, AI-agent-developer / SOC / homelab audience.

export const FLEET = {
  author: 'Solomon Neas',
  twitter: '@solomonneas',
  hub: 'https://lidless.dev',
  org: {
    name: 'Lidless Labs',
    url: 'https://lidless.dev',
    logo: 'https://lidless.dev/og-card.png',
    sameAs: ['https://github.com/lidless-labs'],
  },
  // Every OG card renders at this size.
  ogImage: { width: 2400, height: 1260, type: 'image/png' },
  // Dark-watch palette: cold near-black ground, electric-blue accent.
  themeColor: { dark: '#0a0e15', light: '#38bdf8' },
} as const;

export interface SeoProps {
  /** Brand name for this site, e.g. "Lidless". */
  siteName: string;
  /** Full <title> text, already composed (use composeTitle). */
  title: string;
  /** 140-160 char meta description, unique per page. */
  description: string;
  /** Path or absolute URL to the social card. Defaults to /og-card.png. */
  ogImage?: string;
  ogType?: 'website' | 'article';
  /** ISO date strings; emit article:published_time / article:modified_time. */
  publishedDate?: string;
  modifiedDate?: string;
  tags?: string[];
  keywords?: string[];
  /** One JSON-LD node or an array (rendered as separate <script> blocks). */
  jsonLd?: object | object[];
  /** Force noindex (dev/preview are auto-noindexed regardless). */
  noindex?: boolean;
  /** GEO lever: link to a plain-markdown alternate of the page. */
  markdownAlt?: string;
}

/**
 * trailingSlash:'never' canonical. Robust to either Astro build.format:
 * strips /index.html, a trailing .html, and any trailing slash, keeping root as '/'.
 */
export function canonicalFor(siteUrl: string, pathname: string): string {
  const path =
    pathname
      .replace(/\/index\.html$/, '/')
      .replace(/\.html$/, '')
      .replace(/\/+$/, '') || '/';
  return new URL(path, siteUrl.replace(/\/+$/, '')).toString();
}

export function absoluteImage(siteUrl: string, ogImage = '/og-card.png'): string {
  return ogImage.startsWith('http') ? ogImage : new URL(ogImage, siteUrl).toString();
}

/** "Page Title - Site Tagline" style, or just the seoTitle for the home page. */
export function composeTitle(pageTitle: string | undefined, seoTitle: string): string {
  if (!pageTitle || pageTitle === seoTitle) return seoTitle;
  return `${pageTitle} - ${seoTitle}`;
}

// ---- JSON-LD builders (schema.org). Keep one Organization @id across the fleet. ----

export function organizationLd() {
  return {
    '@type': 'Organization',
    '@id': `${FLEET.org.url}/#organization`,
    name: FLEET.org.name,
    url: FLEET.org.url,
    logo: FLEET.org.logo,
    sameAs: FLEET.org.sameAs,
  };
}

export function websiteLd(siteName: string, siteUrl: string) {
  return {
    '@type': 'WebSite',
    '@id': `${siteUrl.replace(/\/+$/, '')}/#website`,
    name: siteName,
    url: siteUrl.replace(/\/+$/, ''),
    publisher: { '@id': `${FLEET.org.url}/#organization` },
  };
}

export function softwareApplicationLd(opts: {
  name: string;
  siteUrl: string;
  description: string;
  image: string;
  codeRepository?: string;
  softwareVersion?: string;
  license?: string;
}) {
  return {
    '@type': 'SoftwareApplication',
    name: opts.name,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Linux, macOS, Windows',
    description: opts.description,
    url: opts.siteUrl.replace(/\/+$/, ''),
    image: opts.image,
    ...(opts.codeRepository ? { codeRepository: opts.codeRepository } : {}),
    ...(opts.softwareVersion ? { softwareVersion: opts.softwareVersion } : {}),
    ...(opts.license ? { license: opts.license } : {}),
    publisher: { '@id': `${FLEET.org.url}/#organization` },
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  };
}

export function breadcrumbLd(items: { name: string; url: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}

/** Wrap nodes in a single @graph document (preferred for multi-node pages). */
export function graph(nodes: object[]) {
  return { '@context': 'https://schema.org', '@graph': nodes };
}
