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
- The Lidless eye SVG and its cursor, touch, and scroll tracking script. It is the brand; do not redraw it.
- The brand name in the rail and top bar is **Lidless Labs**, next to the small eye mark.
- The visual system follows Brigade Stack (brigadestack.com): monochrome only, dark `#070c0c` with `#e9eeef` ink and light `#fafdfd` with `#0a1313` ink, following the OS until the visitor picks a theme with the toggle. Ink is the accent, and the eye is the only color on the page. The neutrals carry a faint tint at OKLCH hue 200, the eye's iris pulled toward green, with chroma under 0.016. Do not swap in Brigade Stack's slate neutrals, its cobalt motion accent, or executor's sage. Semantic words (CI `failing`, write-gate tiers) may use the quiet `--pos` / `--warn` / `--danger` tokens. Geist + Geist Mono, 1px hairlines instead of shadows, a left rail with the links and theme toggle pinned bottom-left (a top bar under 820px), label column + content rows, plain text. Borrow the visual system only. Copy, voice, and branding stay Lidless.
- Third-party products appear as their official marks on white tiles (`public/brands/`, sources recorded in `src/lib/flow.ts`). Diagrams are built in code, like the homepage flow diagram.
