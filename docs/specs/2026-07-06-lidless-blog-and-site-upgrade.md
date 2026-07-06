# Spec: lidless.dev blog + site upgrade

Date: 2026-07-06
Status: approved-in-direction (GitHub Releases source; all four scope items;
repo edits allowed if needed)

## Goal

Give lidless.dev a changelog blog and make the hub feel alive, following the
brigade.tools jal-co/ui pattern adapted to the Lidless "watch console" brand.
Four pieces, in order: an islands foundation, the changelog blog, per-tool live
status, and homepage grid enrichment, then an SEO/perf pass.

## Constraints (Lidless brand, from DESIGN.md)

- **Dark only.** No light theme, `color-scheme: dark`. The alias layer maps to
  the dark tokens; there is no `[data-theme="light"]` block.
- **Electric blue accent** (`--accent: #38bdf8`), the unsleeping eye, monospace
  labels, hairline console grids. jal-co components inherit this through the
  shadcn alias layer (lidless already uses the exact token names: `--bg`,
  `--bg-panel`, `--accent`, `--on-accent`, `--hairline`, `--hairline-strong`).
- **Currently zero-JS.** lidless-site ships no React today. Adding islands is a
  deliberate change; keep hydration to the components that need it (CommitGraph),
  render badges and homepage data static so the grid stays JS-free.

## Data source: GitHub Releases API

Confirmed the Lidless tools cut real releases (wazuh-mcp 2, proxmox-mcp 2,
misp-mcp 1). The blog is generated at build from the GitHub Releases API, not
from committed markdown. This is simpler than brigade (which commits generated
files because its Vercel build cannot see sibling repos); lidless fetches the
API at build, so no sync-and-commit step and no CHANGELOG reformatting.

- owner/repo per tool comes from `src/lib/tools.ts` `repo` field (mostly
  `lidless-labs/*`, watchtower under `solomonneas/*`).
- Rate limit: ~21 tools times (releases + CI) at build can exceed the 60/hr
  unauthenticated cap. Set `GITHUB_TOKEN` in the Vercel build env. All fetchers
  fail soft to null / `[]`, so a rate-limited or offline build still renders.
- Release bodies are markdown; render them at build with a markdown helper.
- Repo edits are allowed if a release body is too thin to be a useful post, but
  none are required to ship.

## Phase 0: Islands foundation

### 0a. Mirror the islands module into lidless-fleet-kit
Copy from escoffier-fleet-kit (brand-agnostic, maps shadcn tokens to shared token
names): `fleet/islands/{github-data.ts, JalcoProjectBadgesStatic.tsx,
ShieldcnChart.astro, shadcn-alias.css}`, `docs/ISLANDS.md`, `bin/adopt-islands.sh`.
Update the lidless kit README the same way. The alias layer works unchanged
because lidless uses the same token names; dark-only just means the `:root`
aliases resolve to the dark palette.

Add one helper to the kit's `github-data.ts` (needed for a multi-release blog,
brigade only needed the latest): `fetchReleases(owner, repo, limit = 20)`
returning `{ tag, name, publishedAt, body, url, prerelease }[]`, cached per key,
fail-soft to `[]`.

### 0b. Wire lidless-site for islands
- `astro.config.mjs`: add `@astrojs/react` to `integrations`.
- `npx shadcn@latest init` (style new-york, tsx, cssVariables) to create
  `components.json`; add the `@jalco` registry line.
- `tsconfig.json`: `"paths": { "@/*": ["./src/*"] }`, `"jsx": "react-jsx"`,
  `"jsxImportSource": "react"`.
- Run `bin/adopt-islands.sh lidless-site` from the lidless kit; paste
  `shadcn-alias.css` into `src/styles/global.css` below the token block.
- `npx shadcn@latest add @jalco/commit-graph @jalco/release-badge @jalco/ci-badge --yes`.
- If `@jalco/activity-graph` gets pulled, set `src/lib/github.ts` to
  `export * from './github-data'` (the known gotcha).
- Fix `ShieldcnChart.astro` token: it references `--card-bg`; lidless has
  `--bg-panel`. Swap to `var(--bg-panel)` (or add a `--card-bg` alias).

Boundary: after Phase 0, one throwaway test mount of `<CommitGraph>` proves the
island hydrates and themes blue on dark. Then remove the test.

## Phase 1: The changelog blog

- **Content:** no `blog` collection needed; the blog is API-driven. A shared
  `src/lib/releases.ts` builds the post list: for every tool in `tools.ts`, call
  `fetchReleases`, flatten to `{ tool, name, category, tag, date, body, url }`,
  sort by date desc.
- **`/blog` index** (`src/pages/blog.astro`): the Watch Floor header treatment,
  then a jal-co `CommitGraph` fed release-shaped nodes (newest first,
  `tag = version`, `message = "<tool> <name>"`, per-tool `refs`), `client:idle`.
  Keep a category/tool filter (reuse the homepage grid's filter pattern). A
  release list below the graph with tool + version + date + excerpt.
- **`/blog/[slug]`** (`src/pages/blog/[slug].astro`): `getStaticPaths` fetches
  all releases at build and emits a page per release (`slug = <tool>-<tag>`).
  Header: title, tool chip, version, date, plus a static `JalcoProjectBadgesStatic`
  (release + CI) for that tool. Body: the release notes markdown, rendered with
  the copy-button code treatment. Prev/next within the tool.
- **RSS** (`src/pages/blog/rss.xml.ts`): the flattened release list.
- **Nav:** add `Blog` to `NAV_LINKS` in `src/lib/site.ts`.
- **SEO:** Article + Blog JSON-LD via the existing `Seo.astro`.

## Phase 2: Per-tool live status

On each `/<slug>` tool page, add a status strip under the lede:
`JalcoProjectBadgesStatic` (release + CI badge, static) plus a small
`CommitGraph` (`client:idle`) of that tool's recent commits
(`fetchRecentCommits(owner, repo, 6)`). owner/repo from the tool's `repo` field.
This is the trust signal for a security tool catalog: each page shows the tool is
released and green. Fail soft: no data, no strip.

## Phase 3: Homepage grid enrichment

Enrich each Watch Floor card in `src/pages/index.astro` with live, build-time
data (no hydration): current version (latest release tag) and last-updated
(relative), and a small CI status dot. Fetched once per tool at build via the
same helpers, passed as static props. Lifecycle badge stays. If a tool has no
release yet, show its manual version / "unreleased" and skip the dot.

## Phase 4: SEO / perf pass

- Run the fleet SEO contract (seo-fleet) over lidless.dev: head tags, canonical,
  sitemap includes `/blog` and `/blog/*`, JSON-LD.
- Perf guard: only `/blog` and the tool pages hydrate a CommitGraph
  (`client:idle`); the homepage grid enrichment is static (no JS added to the
  hub's landing). Confirm Lighthouse on `/` is unchanged and `/blog` is
  acceptable.

## Failure handling

Every GitHub fetch fails soft (null / `[]`): a rate-limited, tokenless, or
offline build renders the pages with the live sections omitted, never breaks.
`GITHUB_TOKEN` in CI keeps the fleet under the rate cap.

## Testing

- `npm run build` passes with islands + all four phases.
- `/blog`, a `/blog/<slug>` post, a tool page, and `/` render; CommitGraph
  hydrates and themes blue-on-dark; badges render static.
- Screenshot `/blog` and a tool page (dark only).
- Confirm homepage ships no new JS (view-source: no island scripts on `/`).

## Open items

- `fetchReleases` is new; add it to the kit `github-data.ts` and re-adopt.
- Some tools have 1 release, so the blog starts thin. Fine; it grows per release.
  Optionally backfill release notes in the tool repos (edits allowed).
- Decide prerelease handling: include or filter `prerelease: true` from the blog.
