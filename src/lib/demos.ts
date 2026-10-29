// Terminal demos for the tool pages. The SVGs in src/assets/demos are plating
// renders (svg-term output): a CSS flipbook of frames. They are inlined rather
// than linked with <img> so the page's theme tokens can colour them. Their class
// names, ids and keyframe name are generic (".a", id="1", "j"), so inlining them
// as-is would leak into the page and paint it in the renderer's palette.
// demoSvg() rewrites one at build time:
//   - drops the window-chrome traffic lights and the empty band they sat in
//   - swaps the palette and font for the site's theme tokens
//   - prefixes every class, id, href and the keyframe name with "dm-"
// and returns the final frame's offset so reduced motion can show it still.

const files = import.meta.glob('../assets/demos/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export type Demo = { svg: string; endX: string };

// The text is drawn from <use> clones, which live in a shadow tree with no page
// ancestors, so only bare class selectors reach them. Custom properties still
// inherit through, so the clones follow the theme toggle.
const THEME =
  '.dm-a{fill:none}' +
  '.dm-f,.dm-g{white-space:pre;font-family:var(--mono)}' +
  '.dm-f{fill:var(--text-dim);font-weight:500}' +
  '.dm-g{fill:var(--text)}' +
  '.dm-cursor{fill:var(--text-dim)}';

export function demoSvg(slug: string): Demo | null {
  const raw = files[`../assets/demos/${slug}.svg`];
  if (!raw) return null;

  const outer = raw.match(/^<svg[^>]*\swidth="([\d.]+)" height="([\d.]+)">/);
  const inner = raw.match(/<svg height="([\d.]+)"[^>]*\sy="([\d.]+)">/);
  const end = raw.match(/to\{transform:translateX\((-?[\d.]+px)\)\}/);
  if (!outer || !inner || !end) throw new Error(`demos: ${slug}.svg is not a plating render`);

  // Crop the chrome band so the top padding matches the bottom padding.
  const [w, h] = [Number(outer[1]), Number(outer[2])];
  const [innerH, innerY] = [Number(inner[1]), Number(inner[2])];
  const top = innerY - (h - innerY - innerH);

  const svg = raw
    .replace(outer[0], `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 ${top} ${w} ${h - top}" class="dm">`)
    .replace(/<svg y="0%" x="0%">(?:<circle[^>]*\/>){3}<\/svg>/, '')
    .replace(/(<style>@keyframes j\{(?:[^{}]*\{[^{}]*\})*[^{}]*\})[^<]*<\/style>/, `$1${THEME}</style>`)
    .replace(/@keyframes j\{/, '@keyframes dm-j{')
    .replace(/animation-name:j;/g, 'animation-name:dm-j;')
    .replace(/ font-family="[^"]*"/g, '')
    .replace(/<path fill="#6f7683"/g, '<path class="dm-cursor"')
    .replace(/ class="(\w+)"/g, ' class="dm-$1"')
    .replace(/ id="(\w+)"/g, ' id="dm-$1"')
    .replace(/ xlink:href="#(\w+)"/g, ' xlink:href="#dm-$1"');

  if (/#[0-9a-f]{6}/i.test(svg)) throw new Error(`demos: ${slug}.svg kept a hard-coded colour`);
  return { svg, endX: end[1] };
}
