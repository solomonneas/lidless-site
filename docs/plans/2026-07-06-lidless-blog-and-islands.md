# Plan: lidless.dev islands foundation + changelog blog (Phase 0 + 1)

Goal: stand up jal-co/ui React islands on lidless-site and ship a GitHub-Releases
-driven changelog blog at /blog, themed to the blue watch-console brand.

Architecture: lidless-site is Astro 6 + Tailwind 4, dark-only, currently zero-JS.
Add @astrojs/react + shadcn so jal-co components mount as islands (CommitGraph
hydrates, badges static). The blog is generated at build from the GitHub Releases
API across the tools in src/lib/tools.ts, no committed markdown. Spec:
docs/specs/2026-07-06-lidless-blog-and-site-upgrade.md.

Executor: work task by task, tick the checkboxes, commit per task. Decisions are
pinned; do not improvise. Pinned: filter prereleases out of the blog; slug =
`<tool>-<tag without v>`; owner/repo derived from each tool's `repo` URL.

## File map

- `../lidless-fleet-kit/fleet/islands/*` - mirrored island glue (+ fetchReleases)
- `../lidless-fleet-kit/{docs/ISLANDS.md,bin/adopt-islands.sh}` - mirrored
- `astro.config.mjs` - add react()
- `components.json` - new (shadcn) + @jalco registry
- `tsconfig.json` - @/* path + react jsx
- `src/lib/github-data.ts`, `src/components/{JalcoProjectBadgesStatic.tsx,ShieldcnChart.astro}`, `src/styles/shadcn-alias.css` - adopted
- `src/components/{commit-graph,release-badge,ci-badge}.tsx` + `src/lib/github.ts` - installed
- `src/lib/releases.ts` - new: build release-post list from the API
- `src/pages/blog.astro` - new: /blog index (CommitGraph timeline + list)
- `src/pages/blog/[slug].astro` - new: per-release post
- `src/pages/blog/rss.xml.ts` - new
- `src/lib/site.ts` - add Blog to NAV_LINKS

---

## Phase 0: islands foundation

### Task 0.1: mirror islands into lidless-fleet-kit + add fetchReleases
**Files:** `../lidless-fleet-kit/fleet/islands/*`, `docs/ISLANDS.md`, `bin/adopt-islands.sh`, README

- [x] Copy the four island files + ISLANDS.md + adopt-islands.sh from escoffier-fleet-kit into lidless-fleet-kit (same paths).
- [x] Add `fetchReleases(owner, repo, limit=20)` to `fleet/islands/github-data.ts`: GET `/repos/{o}/{r}/releases?per_page={limit}`, map to `{tag,name,publishedAt,body,url,prerelease}`, cache per key, fail soft to `[]`.
- [x] `bash -n bin/adopt-islands.sh`; committed on lidless-fleet-kit branch `feat/islands`.

### Task 0.2: wire lidless-site for React + shadcn
**Files:** `astro.config.mjs`, `package.json`, `components.json`, `tsconfig.json`

- [x] `npm i @astrojs/react react react-dom` (+ types); add `react()` to integrations in astro.config.mjs.
- [x] Create `components.json` (style new-york, tsx, cssVariables true, aliases @/*, `registries: { "@jalco": "https://ui.justinlevine.me/r/{name}.json" }`).
- [x] tsconfig: add `"paths": {"@/*":["./src/*"]}`, `"jsx":"react-jsx"`, `"jsxImportSource":"react"`.
- [x] `npm run build` - expect pass (no islands yet). Commit: `feat: add react + shadcn config`.

### Task 0.3: adopt island glue + theme fixes
**Files:** `src/lib/github-data.ts`, `src/lib/utils.ts`, `src/components/{JalcoProjectBadgesStatic.tsx,ShieldcnChart.astro}`, `src/styles/{shadcn-alias.css,global.css}`

- [x] `../lidless-fleet-kit/bin/adopt-islands.sh lidless-site`.
- [x] Ensure `src/lib/utils.ts` (cn) exists: `npx shadcn@latest add button --yes` (pulls utils + ui/button). Delete button.tsx after if unused, keep utils.
- [x] Paste `src/styles/shadcn-alias.css` contents into `src/styles/global.css` below the token block.
- [x] Fix `ShieldcnChart.astro`: replace `var(--card-bg)` with `var(--bg-panel)`.
- [x] `npm run build` - expect pass. Commit: `feat: adopt jal-co island glue`.

### Task 0.4: install jal-co components
**Files:** `src/components/{commit-graph,release-badge,ci-badge}.tsx`, `src/lib/github.ts`

- [x] `npx shadcn@latest add @jalco/commit-graph @jalco/release-badge @jalco/ci-badge --yes`.
- [x] If `src/lib/github.ts` lacks `fetchLatestRelease`, set it to `export * from './github-data';` (the activity-graph gotcha).
- [x] `npm run build` - expect pass. Commit: `feat: install jal-co components`.

### Task 0.5: prove the island hydrates + themes
- [x] Temporarily mount `<CommitGraph client:idle commits={[{hash:'abc1234',message:'test',author:{name:'x'},date:'2026-07-01',parents:[]}]} />` on `/` behind a query check, `npm run dev`, screenshot, confirm blue-on-dark.
- [x] Remove the test mount. Commit only if a real file changed.

## Phase 1: changelog blog

### Task 1.1: release aggregator
**Files:** `src/lib/releases.ts`

- [x] Export `type ReleasePost = { tool; slug; category; tag; version; name; date; body; url; repo }` and `async function getReleasePosts(): Promise<ReleasePost[]>`: for each tool in TOOLS, parse owner/repo from `tool.repo`, `fetchReleases(owner,repo,20)`, drop `prerelease`, map to ReleasePost (`slug = \`${tool.slug}-${tag.replace(/^v/,'')}\``), flatten, sort by date desc. Fail soft.
- [x] `npm run build` still passes (unused yet). Commit.

### Task 1.2: /blog index
**Files:** `src/pages/blog.astro`

- [x] Watch Floor header (`[ THE LOG ]` kicker + intro), a `CommitGraph client:idle` fed release nodes (`hash=slug`, `message="<tool> <name|version>"`, `date`, `parents=[nextSlug]`, `tag=version`, `refs=[tool]`), then a filterable list (reuse the homepage category filter) of posts linking to `/blog/<slug>`. Empty-state fallback.
- [x] Build + dev screenshot. Commit.

### Task 1.3: /blog/[slug] post
**Files:** `src/pages/blog/[slug].astro`

- [x] `getStaticPaths`: `getReleasePosts()`, one route per post, pass the post as prop. Render header (tool chip, version, date, static `JalcoProjectBadgesStatic` from `fetchLatestRelease`/`fetchCIStatus` for the tool's repo), body = release markdown rendered to HTML (use `marked` or Astro's `markdown` util; add `marked` if needed), prev/next within tool. Article JSON-LD via Seo.astro.
- [x] Build + screenshot a post. Commit.

### Task 1.4: RSS + nav
**Files:** `src/pages/blog/rss.xml.ts`, `src/lib/site.ts`

- [x] RSS from `getReleasePosts()` (@astrojs/rss). Add `{ label: 'Blog', href: '/blog' }` to NAV_LINKS.
- [x] `npm run build`; confirm /blog, /blog/rss.xml, and a post build. Commit.

## After this plan

Phases 2 (per-tool status), 3 (homepage enrichment), 4 (SEO/perf) get their own
plan once the foundation renders, since their code depends on the built helpers.
