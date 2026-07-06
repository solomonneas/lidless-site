// Wave-1 tool catalog for the Lidless Labs hub.
//
// SINGLE SOURCE OF TRUTH for both the homepage card grid (src/pages/index.astro)
// and the per-tool pages built in the next phase (src/pages/<slug>.astro).
// Each tool's page lives at `/<slug>` (no trailing slash, matches astro.config
// trailingSlash:'never' and the sitemap). Keep `slug` URL-safe and unique.

/** Lifecycle maturity for a tool, drives the badge on its card. */
export type Lifecycle = 'Active' | 'WIP' | 'Experimental';

/** Top-level grouping for the filterable card grid. */
export type Category = 'Security / SOC' | 'Network' | 'Homelab';

export interface Tool {
  /** Display name, e.g. "wazuh-mcp". */
  name: string;
  /** URL-safe slug; the tool page is served at `/<slug>`. Unique across all tools. */
  slug: string;
  /** One-line description (the card subtitle and page lede). */
  oneLiner: string;
  /** Maturity badge. */
  lifecycle: Lifecycle;
  /** Grouping for the filterable grid. */
  category: Category;
  /** GitHub repository URL. */
  repo: string;
  /**
   * npm package name, or null when the tool is an app that is not (yet) published.
   * Scoped packages keep their @scope/ prefix.
   */
  npm: string | null;
  /**
   * Canonical external home for a tool that lives on its own site (or only on
   * GitHub) rather than a /<slug> page here. When set, the grid card links out
   * and the tool is skipped from TOOL_SLUGS (no local page, not in the sitemap).
   */
  href?: string;
}

const GH = 'https://github.com/lidless-labs';
const SOLO_GH = 'https://github.com/solomonneas';

export const TOOLS: Tool[] = [
  // ---- SECURITY / SOC ----
  {
    name: 'wazuh-mcp',
    slug: 'wazuh-mcp',
    oneLiner:
      'MCP server for the Wazuh SIEM/XDR - query alerts, agents, and vulnerabilities from your AI client.',
    lifecycle: 'Active',
    category: 'Security / SOC',
    repo: `${GH}/wazuh-mcp`,
    npm: 'wazuh-mcp',
  },
  {
    name: 'misp-mcp',
    slug: 'misp-mcp',
    oneLiner: 'MCP server for MISP - threat-intelligence sharing and lookups.',
    lifecycle: 'Active',
    category: 'Security / SOC',
    repo: `${GH}/misp-mcp`,
    npm: 'misp-mcp',
  },
  {
    name: 'suricata-mcp',
    slug: 'suricata-mcp',
    oneLiner: 'MCP server for Suricata IDS/IPS - analyze network-security alerts.',
    lifecycle: 'Active',
    category: 'Security / SOC',
    repo: `${GH}/suricata-mcp`,
    npm: 'suricata-mcp',
  },
  {
    name: 'thehive-mcp',
    slug: 'thehive-mcp',
    oneLiner: 'MCP server for TheHive - security incident response.',
    lifecycle: 'Active',
    category: 'Security / SOC',
    repo: `${GH}/thehive-mcp`,
    npm: 'thehive-mcp',
  },
  {
    name: 'cortex-mcp',
    slug: 'cortex-mcp',
    oneLiner: 'MCP server for Cortex (StrangeBee/TheHive) - observable analysis.',
    lifecycle: 'Active',
    category: 'Security / SOC',
    repo: `${GH}/cortex-mcp`,
    npm: 'thehive-cortex-mcp',
  },
  {
    name: 'mitre-mcp',
    slug: 'mitre-mcp',
    oneLiner: 'MCP server for the MITRE ATT&CK knowledge base.',
    lifecycle: 'Active',
    category: 'Security / SOC',
    repo: `${GH}/mitre-mcp`,
    npm: 'mitre-mcp',
  },
  {
    name: 'zeek-mcp',
    slug: 'zeek-mcp',
    oneLiner: 'MCP server for Zeek + Suricata network logs.',
    lifecycle: 'Active',
    category: 'Security / SOC',
    repo: `${GH}/zeek-mcp`,
    npm: 'zeek-mcp',
  },
  {
    name: 'maltego-mcp',
    slug: 'maltego-mcp',
    oneLiner: 'Maltego Desktop OSINT integration.',
    lifecycle: 'WIP',
    category: 'Security / SOC',
    repo: `${SOLO_GH}/maltego-mcp`,
    npm: 'maltego-mcp',
  },
  {
    name: 'cyberbrief',
    slug: 'cyberbrief',
    oneLiner: 'AI cyber threat-intel research and reporting.',
    lifecycle: 'Experimental',
    category: 'Security / SOC',
    repo: `${SOLO_GH}/cyberbrief`,
    npm: null,
  },
  {
    name: 'intel-workbench',
    slug: 'intel-workbench',
    oneLiner: 'Structured analytic techniques for CTI.',
    lifecycle: 'WIP',
    category: 'Security / SOC',
    repo: `${SOLO_GH}/intel-workbench`,
    // Offline-first React SPA (private package, not published). Run from source.
    npm: null,
  },
  {
    name: 'hotwash',
    slug: 'hotwash',
    oneLiner: 'Interactive incident-response runbooks.',
    lifecycle: 'WIP',
    category: 'Security / SOC',
    repo: `${SOLO_GH}/hotwash`,
    npm: null,
  },

  // ---- NETWORK ----
  {
    name: 'librenmsctrl',
    slug: 'librenms-mcp',
    oneLiner: 'CLI and MCP-compatible control surface for LibreNMS network monitoring.',
    lifecycle: 'WIP',
    category: 'Network',
    repo: `${GH}/librenmsctrl`,
    npm: '@solomonneas/librenms-mcp',
  },
  {
    name: 'n8nctrl',
    slug: 'n8n-ops-mcp',
    oneLiner:
      'Ops-focused n8n control surface - list, trigger, validate, and audit workflows.',
    lifecycle: 'Active',
    category: 'Network',
    repo: `${GH}/n8nctrl`,
    npm: 'n8n-ops-mcp',
  },
  {
    name: 'watchtower',
    slug: 'watchtower',
    oneLiner:
      'A NOC dashboard for network devices, interfaces, VMs, and alerts via LibreNMS.',
    lifecycle: 'WIP',
    category: 'Network',
    repo: `${SOLO_GH}/watchtower`,
    npm: null,
  },
  {
    name: 'eero-cli',
    slug: 'eero-cli',
    oneLiner: 'Manage an eero mesh network from the shell.',
    lifecycle: 'Experimental',
    category: 'Network',
    repo: `${SOLO_GH}/eero-cli`,
    npm: null,
  },

  // ---- HOMELAB ----
  {
    name: 'proxmox-mcp',
    slug: 'proxmox-mcp',
    oneLiner: 'MCP server for Proxmox VE - manage VMs, containers, and nodes.',
    lifecycle: 'WIP',
    category: 'Homelab',
    repo: `${GH}/proxmox-mcp`,
    npm: '@solomonneas/proxmox-mcp',
  },
  {
    name: 'adguardctrl',
    slug: 'adguard-mcp',
    oneLiner: 'CLI and MCP-compatible control surface for AdGuard Home DNS filtering.',
    lifecycle: 'WIP',
    category: 'Homelab',
    repo: `${GH}/adguardctrl`,
    npm: '@solomonneas/adguard-mcp',
  },
  {
    name: 'proxguard',
    slug: 'proxguard',
    oneLiner: 'Proxmox VE CIS security auditor.',
    lifecycle: 'Experimental',
    category: 'Homelab',
    repo: `${SOLO_GH}/proxguard`,
    // Browser-based app (private package, not published). Run from source.
    npm: null,
  },
  {
    name: 'soc-stack',
    slug: 'soc-stack',
    oneLiner: 'One-command SOC lab on Proxmox.',
    lifecycle: 'WIP',
    category: 'Homelab',
    repo: `${SOLO_GH}/soc-stack`,
    npm: null,
  },
  {
    name: 'jellyctrl',
    slug: 'jellyfin-mcp',
    oneLiner: 'Jellyfin media server control from CLI and MCP-compatible clients.',
    lifecycle: 'WIP',
    category: 'Homelab',
    repo: `${GH}/jellyctrl`,
    npm: 'jellyfin-mcp',
  },
  {
    name: 'immichctrl',
    slug: 'immich-mcp',
    oneLiner: 'Immich photo library control from CLI and MCP-compatible clients.',
    lifecycle: 'Active',
    category: 'Homelab',
    repo: `${GH}/immichctrl`,
    npm: 'immich-mcp',
  },
  {
    name: 'vervet',
    slug: 'vervet',
    oneLiner:
      'Network threat hunting for Zeek and Suricata logs. Explainable per-host risk scoring with evidence chains and MITRE ATT&CK mapping.',
    lifecycle: 'Active',
    category: 'Security / SOC',
    repo: `${GH}/vervet`,
    npm: null,
    href: 'https://vervet.dev',
  },
  {
    name: 'cutsheet',
    slug: 'cutsheet',
    oneLiner:
      'Network change intelligence: self-hosted config diff and risk analysis for switches, firewalls, and NetOps.',
    lifecycle: 'WIP',
    category: 'Network',
    repo: `${GH}/cutsheet`,
    npm: null,
    href: 'https://cutsheet.dev',
  },
  {
    name: 'portgrid',
    slug: 'portgrid',
    oneLiner: 'High-density port visualizer for LibreNMS, a modern replacement for the legacy SwitchMap.',
    lifecycle: 'WIP',
    category: 'Network',
    repo: `${GH}/portgrid`,
    npm: null,
    href: `${GH}/portgrid`,
  },
  {
    name: 'samba-ad-migration',
    slug: 'samba-ad-migration',
    oneLiner: 'Automation for migrating Windows AD file shares to Samba on Proxmox with full domain integration.',
    lifecycle: 'Experimental',
    category: 'Homelab',
    repo: `${GH}/samba-ad-migration`,
    npm: null,
    href: `${GH}/samba-ad-migration`,
  },
];

/** Category order for rendering the grid groups. */
export const CATEGORY_ORDER: Category[] = ['Security / SOC', 'Network', 'Homelab'];

/** Slugs that have a local /<slug> page (external-home tools excluded), for the sitemap and link checks. */
export const TOOL_SLUGS: string[] = TOOLS.filter((t) => !t.href).map((t) => t.slug);

// --- BEGIN AUTO-GENERATED VERSIONS (managed by lidless-fleet-kit/bin/sync-versions.mjs) ---
/** Latest published version per tool slug. Keys without a release are omitted. */
export const VERSIONS: Record<string, string> = {
  'adguard-mcp': '0.2.0',
  'cortex-mcp': '1.2.0',
  'librenms-mcp': '0.2.0',
  'misp-mcp': '1.2.0',
  'mitre-mcp': '2.0.1',
  'n8n-ops-mcp': '0.9.0',
  'proxmox-mcp': '0.3.0',
  'suricata-mcp': '2.0.0',
  'thehive-mcp': '1.1.0',
  'wazuh-mcp': '1.1.0',
  'zeek-mcp': '3.0.0',
};
// --- END AUTO-GENERATED VERSIONS ---
