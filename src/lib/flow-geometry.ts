// Pure geometry for the homepage flow diagram, same math as Brigade Stack's.
// The DOM half (src/scripts/flow-diagram.ts) measures the nodes and the hub,
// then draws the paths returned here.

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const round = (n: number) => Math.round(n * 10) / 10;

/**
 * One cubic curve per node, joining the node to the hub. Left-side curves run
 * from each node's right edge into the hub's left edge; right-side curves run
 * from the hub's right edge out to each node's left edge, so both sides read
 * left to right. Curves fan out around the hub's vertical center by `spread`
 * pixels per node so they do not overlap where they meet the hub.
 */
export function flowPaths(nodes: Rect[], hub: Rect, side: 'left' | 'right', spread: number): string[] {
  const hubMid = hub.y + hub.height / 2;
  const fanned = (i: number) => hubMid + (i - (nodes.length - 1) / 2) * spread;
  return nodes.map((node, i) => {
    const nodeMid = node.y + node.height / 2;
    const [sx, sy, ex, ey] =
      side === 'left'
        ? [node.x + node.width, nodeMid, hub.x, fanned(i)]
        : [hub.x + hub.width, fanned(i), node.x, nodeMid];
    const dx = (ex - sx) / 2;
    return `M${round(sx)},${round(sy)} C${round(sx + dx)},${round(sy)} ${round(ex - dx)},${round(ey)} ${round(ex)},${round(ey)}`;
  });
}

/**
 * How far node `index` of `count` bows toward the hub, from 0 at the middle
 * of the column to 1 at its ends. CSS scales it by the arc depth, so the
 * column bends like an arc around the hub instead of standing straight.
 */
export function flowArc(index: number, count: number): number {
  if (count < 2) return 0;
  const t = (index - (count - 1) / 2) / ((count - 1) / 2);
  return round(t * t * 100) / 100;
}

/**
 * Start time in seconds for the dot on curve `index`. Dots stagger down each
 * column, and the right side starts later, so records appear to pass through
 * the hub before they land.
 */
export function flowDotDelay(index: number, side: 'left' | 'right'): number {
  return round(index * 0.7 + (side === 'right' ? 1.8 : 0));
}
