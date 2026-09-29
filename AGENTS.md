# lidless-site

Astro site for lidless.dev. Tool data lives in `src/lib/tools.ts` (catalog) and `src/lib/tool-pages.ts` (per-tool pages); the changelog is built from GitHub releases in `src/lib/releases.ts`.

## Design rules

These are hard rules from the site owner. Do not ship any of the banned patterns, even as a placeholder.

**Banned**
- **No status-light dots.** No green (or any colour) "live/online" dot in pills, badges, kickers, status chips, or list rows. If a status matters, say it in words; colour the word itself if it must stand out (e.g. CI `failing` in red text).
- **No side-bar hovers.** No accent bar, left border, or slide-in strip on hover. Hover is a text colour change or a very subtle background shift, nothing else.
- **No fake terminals on the homepage.** No window-chrome "terminal" with traffic-light dots showing an invented session.
- **No big-number stat boards.** Do not spend a grid of large cells on three or four numbers. Put numbers inline or in a compact key/value list.
- **No GitHub star counts.**
- **No terminal/matrix aesthetic** and no default AI-template visuals (glows, gradient blobs, neon).

**Keep**
- The Lidless eye SVG and its cursor/scroll tracking script. It is the brand; do not redraw it.
- The brand name in the nav is **Lidless Labs**.
- The direction is shadcn / Vercel / Cursor: pure black, Geist + Geist Mono, 1px hairline borders, framed split hero, label column + content rows, plain text.
