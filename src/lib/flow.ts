// Homepage flow diagram: AI clients on the left, the Lidless servers in the
// middle, the systems they read on the right.
//
// Marks sit on a white tile in both themes so their own colors read ('symbol'),
// or fill the tile as the product's own app icon ('app'). Brand marks are
// decorative beside the visible name, so their alt text is empty.
//
// Sources (official only, fetched 2026-10-28):
// - claude.svg, openai-blossom.svg, cursor.svg, opencode.png: copied unchanged
//   from brigade-site public/brands, where each file's official source is
//   recorded (src/data/home.ts there).
// - wazuh.png, misp.png, thehive.png, librenms.png, proxmox.png, adguard.png,
//   immich.png, jellyfin.png: each project's own GitHub organization avatar
//   (github.com/<org>.png?size=128, orgs wazuh, MISP, TheHive-Project,
//   librenms, proxmox, AdguardTeam, immich-app, jellyfin), unchanged.
export interface BrandMark {
  src: string;
  style: 'symbol' | 'app';
}

export interface FlowNode {
  label: string;
  mark?: BrandMark;
  /** Inline glyph when there is no brand mark. */
  glyph?: 'plug';
  href?: string;
}

export const FLOW = {
  title: 'Works with the client you already run.',
  lead: 'Each server runs beside your AI client over stdio and talks to one system you own. Credentials stay in your environment, and writes wait for a confirm.',
  sourcesLabel: 'Your AI client',
  targetsLabel: 'Systems it can read',
  hub: 'Lidless',
  hubNote: 'one server per system',
};

export const FLOW_SOURCES: FlowNode[] = [
  { label: 'Claude Code', mark: { src: '/brands/claude.svg', style: 'symbol' } },
  { label: 'Codex', mark: { src: '/brands/openai-blossom.svg', style: 'symbol' } },
  { label: 'Cursor', mark: { src: '/brands/cursor.svg', style: 'app' } },
  { label: 'OpenCode', mark: { src: '/brands/opencode.png', style: 'app' } },
  { label: 'Any MCP client', glyph: 'plug', href: '/docs#clients' },
];

export const FLOW_TARGETS: FlowNode[] = [
  { label: 'Wazuh', mark: { src: '/brands/wazuh.png', style: 'app' }, href: '/wazuh-mcp' },
  { label: 'MISP', mark: { src: '/brands/misp.png', style: 'symbol' }, href: '/misp-mcp' },
  { label: 'TheHive', mark: { src: '/brands/thehive.png', style: 'app' }, href: '/thehive-mcp' },
  { label: 'LibreNMS', mark: { src: '/brands/librenms.png', style: 'symbol' }, href: '/librenms-mcp' },
  { label: 'Proxmox VE', mark: { src: '/brands/proxmox.png', style: 'symbol' }, href: '/proxmox-mcp' },
  { label: 'AdGuard Home', mark: { src: '/brands/adguard.png', style: 'symbol' }, href: '/adguard-mcp' },
  { label: 'Immich', mark: { src: '/brands/immich.png', style: 'symbol' }, href: '/immich-mcp' },
];

export const FLOW_MORE = { label: 'All tools', href: '#tools' };
