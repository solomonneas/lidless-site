// DOM wiring for the homepage flow diagram and its in-view animation gate.
// Geometry lives in src/lib/flow-geometry.ts. No scroll listeners: drawing
// follows ResizeObserver, and motion follows IntersectionObserver.
import { flowDotDelay, flowPaths, type Rect } from '../lib/flow-geometry';

const SVGNS = 'http://www.w3.org/2000/svg';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const visible = new WeakSet<Element>();

function rectIn(el: Element, box: DOMRect): Rect {
  const r = el.getBoundingClientRect();
  return { x: r.left - box.left, y: r.top - box.top, width: r.width, height: r.height };
}

function svgEl<K extends keyof SVGElementTagNameMap>(name: K, attrs: Record<string, string>): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVGNS, name);
  for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
  return el;
}

function draw(flow: HTMLElement) {
  const svg = flow.querySelector<SVGSVGElement>('.fit-svg');
  const hub = flow.querySelector('.fit-hub');
  if (!svg || !hub) return;
  svg.replaceChildren();
  // The stacked mobile layout hides the curves.
  if (getComputedStyle(svg).display === 'none') return;
  const box = flow.getBoundingClientRect();
  svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
  const hubRect = rectIn(hub, box);
  for (const side of ['left', 'right'] as const) {
    const icons = [...flow.querySelectorAll(`.fit-col-${side} .fit-icon`)].map((icon) => rectIn(icon, box));
    flowPaths(icons, hubRect, side, 6).forEach((d, i) => {
      const id = `${flow.id}-${side}-${i}`;
      svg.append(svgEl('path', { d, id }));
      if (reducedMotion.matches) return;
      // A dot is a request travelling from the client, through the server, to
      // the system. Each stays hidden until its first run starts, then loops.
      const begin = `${flowDotDelay(i, side)}s`;
      const dot = svgEl('circle', { r: '2.2', opacity: '0' });
      dot.append(svgEl('set', { attributeName: 'opacity', to: '1', begin }));
      const motion = svgEl('animateMotion', { dur: '3.6s', repeatCount: 'indefinite', begin, calcMode: 'linear', keyPoints: '0;1', keyTimes: '0;1' });
      motion.append(svgEl('mpath', { href: `#${id}` }));
      dot.append(motion);
      svg.append(dot);
    });
  }
  if (!visible.has(flow)) svg.pauseAnimations();
}

const flows = [...document.querySelectorAll<HTMLElement>('[data-flow]')];
const redraw = () => flows.forEach(draw);
if (flows.length) {
  redraw();
  const resize = new ResizeObserver(redraw);
  flows.forEach((flow) => resize.observe(flow));
  document.fonts?.ready.then(redraw);
  reducedMotion.addEventListener('change', redraw);

  // The dots move only while the diagram is on screen.
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
        const svg = entry.target.querySelector<SVGSVGElement>('.fit-svg');
        if (svg) (entry.isIntersecting ? svg.unpauseAnimations() : svg.pauseAnimations());
      }
    },
    { threshold: 0.2 },
  );
  flows.forEach((flow) => io.observe(flow));
}
