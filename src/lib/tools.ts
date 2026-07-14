// Wave-1 tool catalog for the Lidless Labs hub.
//
// SINGLE SOURCE OF TRUTH for both the homepage card grid (src/pages/index.astro)
// and the per-tool pages built in the next phase (src/pages/<slug>.astro).
// Each tool's page lives at `/<slug>` (no trailing slash, matches astro.config
// trailingSlash:'never' and the sitemap). Keep `slug` URL-safe and unique.

/** Lifecycle maturity for a tool, drives the badge on its card. */
export type Lifecycle = 'Active' | 'WIP' | 'Experimental';

/** Top-level grouping for the filterable card grid. */
export type Category = 'Security / SOC' | 'Threat Intelligence & OSINT' | 'Network' | 'Homelab';

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
      'Read your Wazuh SIEM from your agent: alerts, agents, and CVEs, read-only.',
    lifecycle: 'Active',
    category: 'Security / SOC',
    repo: `${GH}/wazuh-mcp`,
    npm: 'wazuh-mcp',
  },
  {
    name: 'misp-mcp',
    slug: 'misp-mcp',
    oneLiner: 'Turn MISP threat intel into answers: events, correlations, and IOC exports on demand.',
    lifecycle: 'Active',
    category: 'Security / SOC',
    repo: `${GH}/misp-mcp`,
    npm: 'misp-mcp',
  },
  {
    name: 'suricata-mcp',
    slug: 'suricata-mcp',
    oneLiner: 'Hunt Suricata and Zeek NSM logs from your agent: alerts, flows, and C2 analytics.',
    lifecycle: 'Active',
    category: 'Security / SOC',
    repo: `${GH}/suricata-mcp`,
    npm: 'suricata-mcp',
  },
  {
    name: 'thehive-mcp',
    slug: 'thehive-mcp',
    oneLiner: 'Drive TheHive incident response from your agent: cases, alerts, tasks, observables.',
    lifecycle: 'Active',
    category: 'Security / SOC',
    repo: `${GH}/thehive-mcp`,
    npm: 'thehive-mcp',
  },
  {
    name: 'cortex-mcp',
    slug: 'cortex-mcp',
    oneLiner: 'Detonate an indicator and get one verdict: Cortex analyzers, confirm-gated.',
    lifecycle: 'Active',
    category: 'Security / SOC',
    repo: `${GH}/cortex-mcp`,
    npm: 'thehive-cortex-mcp',
  },
  {
    name: 'mitre-mcp',
    slug: 'mitre-mcp',
    oneLiner: 'Map alerts to ATT&CK and profile threat groups without leaving your agent.',
    lifecycle: 'Active',
    category: 'Security / SOC',
    repo: `${GH}/mitre-mcp`,
    npm: 'mitre-mcp',
  },
  {
    name: 'zeek-mcp',
    slug: 'zeek-mcp',
    oneLiner: 'Query and correlate Zeek and Suricata NSM logs from your agent.',
    lifecycle: 'Active',
    category: 'Security / SOC',
    repo: `${GH}/zeek-mcp`,
    npm: 'zeek-mcp',
  },
  {
    name: 'maltego-mcp',
    slug: 'maltego-mcp',
    oneLiner: 'Let your agent author Maltego .mtgx graphs and run whois, DNS, ASN, and crt.sh lookups.',
    lifecycle: 'Active',
    category: 'Threat Intelligence & OSINT',
    repo: `${SOLO_GH}/maltego-mcp`,
    npm: 'maltego-mcp',
  },
  {
    name: 'cyberbrief',
    slug: 'cyberbrief',
    oneLiner: 'AI threat-intel briefings: BLUF reports, ATT&CK mapping, and IOC extraction.',
    lifecycle: 'Active',
    category: 'Threat Intelligence & OSINT',
    repo: `${SOLO_GH}/cyberbrief`,
    npm: null,
  },
  {
    name: 'intel-workbench',
    slug: 'intel-workbench',
    oneLiner: 'Browser-native ACH workbench: ATT&CK tagging, ICD 203 confidence, local-only.',
    lifecycle: 'Active',
    category: 'Threat Intelligence & OSINT',
    repo: `${SOLO_GH}/intel-workbench`,
    // Offline-first React SPA (private package, not published). Run from source.
    npm: null,
  },
  {
    name: 'hotwash',
    slug: 'hotwash',
    oneLiner: 'Build IR playbooks as flowcharts and run them step by step, agent-drivable.',
    lifecycle: 'Active',
    category: 'Security / SOC',
    repo: `${SOLO_GH}/hotwash`,
    npm: null,
  },

  // ---- NETWORK ----
  {
    name: 'librenmsctrl',
    slug: 'librenms-mcp',
    oneLiner: 'Pipe LibreNMS devices, ports, and alerts to shells, cron, and agents. Writes gated.',
    lifecycle: 'Active',
    category: 'Network',
    repo: `${GH}/librenmsctrl`,
    npm: '@solomonneas/librenms-mcp',
  },
  {
    name: 'n8nctrl',
    slug: 'n8n-ops-mcp',
    oneLiner:
      'Drive n8n workflows from shells, cron, and agents: inspect, validate, run, audit.',
    lifecycle: 'Active',
    category: 'Network',
    repo: `${GH}/n8nctrl`,
    npm: 'n8n-ops-mcp',
  },
  {
    name: 'watchtower',
    slug: 'watchtower',
    oneLiner:
      'NOC dashboard: device status, topology, and VM metrics via LibreNMS and Proxmox.',
    lifecycle: 'Active',
    category: 'Network',
    repo: `${SOLO_GH}/watchtower`,
    npm: null,
  },
  {
    name: 'eero-cli',
    slug: 'eero-cli',
    oneLiner: 'Drive the eero mesh API from the shell: SMS auth, device filtering, bulk block.',
    lifecycle: 'Active',
    category: 'Network',
    repo: `${SOLO_GH}/eero-cli`,
    npm: null,
  },

  // ---- HOMELAB ----
  {
    name: 'proxmox-mcp',
    slug: 'proxmox-mcp',
    oneLiner: 'Operate Proxmox VMs, containers, and nodes from your agent, every write gated.',
    lifecycle: 'Active',
    category: 'Homelab',
    repo: `${GH}/proxmox-mcp`,
    npm: '@solomonneas/proxmox-mcp',
  },
  {
    name: 'adguardctrl',
    slug: 'adguard-mcp',
    oneLiner: 'Run AdGuard Home DNS filtering from shells and agents, destructive writes gated.',
    lifecycle: 'Active',
    category: 'Homelab',
    repo: `${GH}/adguardctrl`,
    npm: '@solomonneas/adguard-mcp',
  },
  {
    name: 'proxguard',
    slug: 'proxguard',
    oneLiner: 'Audit Proxmox against CIS benchmarks: config parsers and remediation scripts.',
    lifecycle: 'Active',
    category: 'Homelab',
    repo: `${SOLO_GH}/proxguard`,
    // Browser-based app (private package, not published). Run from source.
    npm: null,
  },
  {
    name: 'soc-stack',
    slug: 'soc-stack',
    oneLiner: 'One command stands up a full SOC on Proxmox: Wazuh, TheHive, Cortex, MISP, Zeek, Suricata.',
    lifecycle: 'Active',
    category: 'Security / SOC',
    repo: `${SOLO_GH}/soc-stack`,
    npm: null,
  },
  {
    name: 'jellyctrl',
    slug: 'jellyfin-mcp',
    oneLiner: 'Drive Jellyfin libraries, sessions, and users from a CLI or MCP, writes gated.',
    lifecycle: 'Active',
    category: 'Homelab',
    repo: `${GH}/jellyctrl`,
    npm: 'jellyfin-mcp',
  },
  {
    name: 'immichctrl',
    slug: 'immich-mcp',
    oneLiner: 'One typed control surface for Immich: search, albums, and duplicate audits.',
    lifecycle: 'Active',
    category: 'Homelab',
    repo: `${GH}/immichctrl`,
    npm: 'immich-mcp',
  },
  {
    name: 'vervet',
    slug: 'vervet',
    oneLiner:
      'Threat hunting for Zeek and Suricata logs: explainable per-host risk with ATT&CK evidence chains.',
    lifecycle: 'Active',
    category: 'Threat Intelligence & OSINT',
    repo: `${GH}/vervet`,
    npm: null,
    href: 'https://vervet.dev',
  },
  {
    name: 'cutsheet',
    slug: 'cutsheet',
    oneLiner:
      'Network change intelligence: self-hosted config diff and risk analysis for switches, firewalls, and NetOps.',
    lifecycle: 'Active',
    category: 'Network',
    repo: `${GH}/cutsheet`,
    npm: null,
    href: 'https://cutsheet.dev',
  },
  {
    name: 'portgrid',
    slug: 'portgrid',
    oneLiner: 'High-density port visualizer for LibreNMS, a modern replacement for the legacy SwitchMap.',
    lifecycle: 'Active',
    category: 'Network',
    repo: `${GH}/portgrid`,
    npm: null,
    href: `${GH}/portgrid`,
  },
  {
    name: 'samba-ad-migration',
    slug: 'samba-ad-migration',
    oneLiner: 'Automated migration of a Windows AD file share to Samba on Proxmox, with Winbind domain join and permission-preserving data copy.',
    lifecycle: 'Active',
    category: 'Homelab',
    repo: `${GH}/samba-ad-migration`,
    npm: null,
    href: `${GH}/samba-ad-migration`,
  },
];

/** Category order for rendering the grid groups. */
export const CATEGORY_ORDER: Category[] = ['Security / SOC', 'Threat Intelligence & OSINT', 'Network', 'Homelab'];

/** Slugs that have a local /<slug> page (external-home tools excluded), for the sitemap and link checks. */
export const TOOL_SLUGS: string[] = TOOLS.filter((t) => !t.href).map((t) => t.slug);

// Tool versions are rendered live from each repo's latest GitHub release tag in
// src/pages/index.astro (see the `health` map), so there is no static version map
// to drift. The old lidless-fleet-kit/bin/sync-versions.mjs target lived here and
// is now obsolete for this file.
