// Rich per-tool page content, rendered by src/pages/[slug].astro.
//
// The old per-tool pages were 21 near-identical .astro files that dumped a README
// (prose -> install -> config JSON -> a wall of tool names). This is the content
// model that replaces them: one data object per tool, rendered by tool type, with
// a "see it work" proof up top instead of an API-reference wall. A tool without a
// PAGES entry keeps its legacy .astro file until it is migrated here.

export type SessionTurn = {
  ask?: string; // what the human asked, plain language
  call?: string; // a tool the agent invoked (mono)
  ret?: string; // the tool's result (mono, may be multi-line)
  say?: string; // the agent's answer back
};

export type Proof =
  | { type: 'session'; label: string; turns: SessionTurn[]; caption: string }
  | { type: 'screenshot'; src: string; alt: string; caption: string }
  | { type: 'none' };

export type CapGroup = { name: string; count?: string; desc: string };

export type ToolPage = {
  /** Drives which sections render. mcp/ctrl/cli show setup+config; dashboard/app lead with a screenshot. */
  kind: 'mcp' | 'ctrl' | 'cli' | 'dashboard' | 'app' | 'scripts';
  /** Pain-first hero line. One or two sentences: the problem, then what the tool hands you. */
  value: string;
  /** Small mono tag chips under the CTAs (counts, runtime, license, read-only, etc.). */
  meta: string[];
  /** The proof block: the tool visibly doing its headline job. */
  proof: Proof;
  /** One tight paragraph: what it does / why / how it differs. */
  what: string;
  /** Optional grouped capability grid (reference, kept off the hero). */
  capabilities?: { title: string; groups: CapGroup[]; refHref?: string };
  /** Optional setup. `config` is a raw string rendered in a collapsible block. */
  setup?: { install?: string; env?: string; config?: string; configLabel?: string };
  /** Optional safety callout (a real differentiator, not boilerplate). */
  safety?: string;
  /** Footer stat strip. */
  specs: { n: string; l: string }[];
};

export const PAGES: Record<string, ToolPage> = {
  'wazuh-mcp': {
    kind: 'mcp',
    value:
      'Your Wazuh console answers one query at a time, and only if you know how to ask. wazuh-mcp hands the whole SIEM to your agent: alerts, agents, CVEs, rules, and CIS posture, answered in plain language over stdio.',
    meta: ['28 tools', '3 resources', '3 prompts', 'read-only', 'Node 20+', 'MIT'],
    proof: {
      type: 'session',
      label: 'representative session · claude + wazuh-mcp',
      turns: [
        { ask: 'Any critical alerts on the DMZ hosts in the last hour, and is anything misconfigured?' },
        { call: 'search_alerts{ level: ">=10", group: "dmz", range: "1h" }' },
        {
          ret:
            '3 alerts\n5710   sshd: 47 authentication failures      dmz-web-01 (192.0.2.24)   level 10   02:14Z\n92053  Suricata ET SCAN nmap probe           dmz-fw-01                 level 12   03:02Z\n5402   successful sudo to root               dmz-web-01                level 12   03:05Z',
        },
        { call: 'get_sca_checks{ agent: "dmz-web-01", result: "failed" }' },
        { ret: 'CIS 5.2.5   SSH MaxAuthTries not set    fix: set MaxAuthTries 4 in /etc/ssh/sshd_config' },
        {
          say:
            'dmz-web-01 is the one to look at. 47 SSH failures, then a successful root sudo three minutes after an nmap scan from dmz-fw-01. Its SSH config also fails CIS 5.2.5, which is what let the brute force run. I would isolate dmz-web-01 and cap auth tries.',
        },
      ],
      caption: 'Representative session. Illustrative values, RFC 5737 addresses. Your data never leaves the box.',
    },
    what:
      'Point any MCP client at wazuh-mcp and your Wazuh SIEM/XDR becomes tools the agent can call: enumerate agents, search alerts against the Indexer, review the CVE backlog, read detection rules and decoders, and run CIS and File Integrity posture checks. It is read-only and speaks stdio, so there is no new network surface and nothing to write back into Wazuh. Compliance mappings (PCI-DSS, HIPAA, NIST 800-53, MITRE ATT&CK) ride along on every rule lookup.',
    capabilities: {
      title: '28 tools across the deployment',
      groups: [
        { name: 'Agents & inventory', count: '9 tools', desc: 'Enumerate agents and pull Syscollector OS, packages, processes, ports, and hotfixes.' },
        { name: 'Alerts & vulnerabilities', count: '5 tools', desc: 'Search alerts by time, level, agent, and rule via the Indexer. Query the CVE inventory by severity and package.' },
        { name: 'Detection content', count: '4 tools', desc: 'Browse rules and decoders with level/group filters and full compliance mappings.' },
        { name: 'Posture & integrity', count: '4 tools', desc: 'SCA policies and per-check remediation, File Integrity Monitoring, and rootcheck findings.' },
        { name: 'Manager & diagnostics', count: '6 tools', desc: 'Manager logs and config (secrets redacted), agent groups, version, and a sanitized connection check.' },
      ],
      refHref: 'https://github.com/lidless-labs/wazuh-mcp#tools',
    },
    setup: {
      install: 'npm i -g wazuh-mcp        # or: npx wazuh-mcp',
      env: 'Configure with WAZUH_URL, WAZUH_USERNAME, WAZUH_PASSWORD. Add WAZUH_INDEXER_URL to enable alert and vulnerability search.',
      configLabel: 'MCP client config (Claude Desktop, Claude Code, OpenClaw, Codex)',
      config: `{
  "mcpServers": {
    "wazuh": {
      "command": "wazuh-mcp",
      "env": {
        "WAZUH_URL": "https://wazuh.example.net:55000",
        "WAZUH_USERNAME": "wazuh-wui",
        "WAZUH_PASSWORD": "...",
        "WAZUH_INDEXER_URL": "https://wazuh.example.net:9200"
      }
    }
  }
}`,
    },
    safety:
      'Built for pointing an LLM at security data. Sensitive fields (IPs, full logs, hashes, command lines, secrets) are minimized by default and returned only on explicit opt-in. Alert content that originated on a monitored endpoint is wrapped in untrusted-data markers, so a malicious log line cannot hijack the agent reading it.',
    specs: [
      { n: '28', l: 'MCP tools' },
      { n: '3', l: 'resources' },
      { n: '3', l: 'prompts' },
      { n: '0', l: 'writes' },
      { n: 'MIT', l: 'license' },
    ],
  },
  "misp-mcp": {
    "kind": "mcp",
    "value": "An IOC lands in your queue and MISP makes you click through events, correlations, and warninglists to decide if it matters. misp-mcp hands the whole threat-intel platform to your agent: search events, correlate indicators across the graph, check false positives, and export detections, answered in plain language over stdio.",
    "meta": [
      "36 tools",
      "3 resources",
      "3 prompts",
      "write-gated",
      "Node 20+",
      "MIT"
    ],
    "what": "Point any MCP client at misp-mcp and your MISP threat-intelligence instance becomes tools the agent can call: search events and attributes, correlate a value across every event, attach MITRE ATT&CK galaxy clusters, check warninglists for false positives, and export indicators as Suricata, Snort, STIX, CSV, RPZ, or hash lists. It talks to MISP's own REST API and speaks stdio, so there is no new listening service. Unlike a generic HTTP wrapper it ships 36 purpose-built tools plus MISP-aware resources and prompts, and read paths are safe by default while destructive writes (delete, publish, tag-removal) refuse to run without an explicit confirmation flag.",
    "proof": {
      "type": "session",
      "label": "representative session · claude + misp-mcp",
      "turns": [
        {
          "ask": "We're seeing beacons to 203.0.113.50. Is it already in MISP, and is it a known false positive?"
        },
        {
          "call": "misp_correlate{ value: \"203.0.113.50\" }"
        },
        {
          "ret": "2 events, 4 attributes\n1187  APT-29 infra staging   ip-dst   tlp:amber   published\n1042  cobalt-strike c2 sweep ip-dst   tlp:red     published"
        },
        {
          "call": "misp_check_warninglists{ value: \"203.0.113.50\" }"
        },
        {
          "ret": "no match on 0 of 84 lists (not a known benign indicator)"
        },
        {
          "call": "misp_export_iocs{ event: 1187, format: \"suricata\" }"
        },
        {
          "ret": "alert ip any any -> 203.0.113.50 any (msg:\"MISP e1187 ip-dst\"; sid:5001187;)"
        },
        {
          "say": "203.0.113.50 is real, not a false positive. It's tied to two published events including APT-29 staging infra, and clean across all 84 warninglists. Here's a Suricata rule from event 1187 to deploy now."
        }
      ],
      "caption": "Representative session. Illustrative values, RFC 5737 addresses. Your MISP data never leaves the box."
    },
    "capabilities": {
      "title": "36 tools across the platform",
      "groups": [
        {
          "name": "Events",
          "count": "6 tools",
          "desc": "Search, read, create, update, publish, and tag threat-intel events."
        },
        {
          "name": "Attributes & correlation",
          "count": "7 tools",
          "desc": "Search IOCs, add one or many, and correlate a value across the whole event graph."
        },
        {
          "name": "Exports & sightings",
          "count": "4 tools",
          "desc": "Export IOCs as Suricata/Snort/STIX/CSV/RPZ or hashes; report sightings and check warninglists."
        },
        {
          "name": "Tags, objects & galaxies",
          "count": "10 tools",
          "desc": "Manage tags and structured objects; search and attach MITRE ATT&CK clusters and threat actors."
        },
        {
          "name": "Feeds, orgs & server",
          "count": "9 tools",
          "desc": "Manage threat-intel feeds, list sharing partners and groups, read server status and diagnostics."
        }
      ],
      "refHref": "https://github.com/lidless-labs/misp-mcp#tools"
    },
    "setup": {
      "install": "npm i -g misp-mcp  (or npx -y misp-mcp)",
      "env": "Configure with MISP_URL and MISP_API_KEY. Set MISP_VERIFY_SSL=false for self-signed certs.",
      "configLabel": "MCP client config",
      "config": "{ \"mcpServers\": { \"misp\": { \"command\": \"npx\", \"args\": [\"-y\", \"misp-mcp\"], \"env\": { \"MISP_URL\": \"https://misp.example.com\", \"MISP_API_KEY\": \"your-api-key-here\", \"MISP_VERIFY_SSL\": \"false\" } } } }"
    },
    "safety": "Read paths are safe by default. State-changing and destructive tools (delete, publish, tag-removal) refuse to run without confirm: true, and permanent hard deletes require a second confirmHard: true that the MISP_ALLOW_DESTRUCTIVE opt-in cannot bypass. A guarded call returns a Refused error and performs no MISP request.",
    "specs": [
      {
        "n": "36",
        "l": "MCP tools"
      },
      {
        "n": "3",
        "l": "resources"
      },
      {
        "n": "3",
        "l": "prompts"
      },
      {
        "n": "MIT",
        "l": "license"
      }
    ]
  },
  "suricata-mcp": {
    "kind": "mcp",
    "value": "Chasing one Suricata alert means pivoting by hand across eve.json, flow records, DNS/HTTP/TLS transactions, and the Zeek logs next to them, slow and easy to get wrong under pressure. suricata-mcp hands the whole NSM stack to your agent: alerts, flows, protocols, Zeek metadata, and C2/DGA/exfil analytics, answered in plain language over stdio.",
    "meta": [
      "41 tools",
      "5 resources",
      "5 prompts",
      "read-only default",
      "Node 20+",
      "MIT"
    ],
    "what": "Point any MCP client at suricata-mcp and your Suricata IDS/IPS and Zeek NSM logs become tools the agent can call: query alerts, flows, and protocol records; investigate a host or a single alert; and cross-correlate Suricata alerts against Zeek conn/dns/http/ssl by IP pair and time window. Why: a SOC analyst working a single alert normally greps EVE JSON and stitches together flow and protocol context by hand, which does not scale under pressure. How it differs: instead of a dashboard or a one-shot log shipper, it reads your own log files locally and layers detection analytics on top, C2 beaconing, DGA via Shannon entropy, data exfiltration, and lateral movement, so the model does the pivoting. It is read-only by default and speaks stdio, so there is no new network surface, and it drops into Claude Desktop, Claude Code, Codex CLI, OpenClaw, or Hermes.",
    "proof": {
      "type": "session",
      "label": "representative session · claude + suricata-mcp",
      "turns": [
        {
          "ask": "One host keeps phoning out at regular intervals. Is 192.0.2.24 beaconing to a C2, and what does Zeek say about it?"
        },
        {
          "call": "suricata_beaconing_detection{ src_ip: \"192.0.2.24\", range: \"6h\", min_confidence: 0.7 }"
        },
        {
          "ret": "1 candidate\n192.0.2.24 -> 203.0.113.88:443   interval ~60s   jitter 4%   count 312   confidence 0.94"
        },
        {
          "call": "correlate_alert_with_zeek{ src_ip: \"192.0.2.24\", dst_ip: \"203.0.113.88\", range: \"6h\" }"
        },
        {
          "ret": "ssl.log  SNI cdn-update.example   JA3 771,4865-4866...   self-signed cert\nconn.log 312 conns  avg 1.2s  1.4KB up / 380B down each"
        },
        {
          "say": "192.0.2.24 is beaconing to 203.0.113.88 every ~60s at 4% jitter, 0.94 confidence, over TLS with a self-signed cert and steady small uplinks. That is textbook C2. I would isolate the host and block the destination."
        }
      ],
      "caption": "Representative session. Illustrative values, RFC 5737 addresses. Your logs never leave the box."
    },
    "capabilities": {
      "title": "41 tools across Suricata and Zeek",
      "groups": [
        {
          "name": "Suricata alerts & flows",
          "count": "6 tools",
          "desc": "Query and aggregate EVE alerts by SID, signature, severity, IP, and time; top talkers and bandwidth from flows."
        },
        {
          "name": "Protocol analysis",
          "count": "6 tools",
          "desc": "Inspect DNS, HTTP, TLS (SNI, JA3/JA4), SSH, extracted files, and protocol anomalies from EVE records."
        },
        {
          "name": "Advanced analytics",
          "count": "4 tools",
          "desc": "Detect C2 beaconing, DGA domains via Shannon entropy, data exfiltration, and lateral movement."
        },
        {
          "name": "Investigation & Zeek NSM",
          "count": "11 tools",
          "desc": "Full host and alert investigation, plus query conn/dns/http/ssl/files/ssh/weird from Zeek TSV logs."
        },
        {
          "name": "Cross-correlation",
          "count": "1 tool",
          "desc": "Join Suricata alerts to Zeek metadata by IP pair and time window."
        },
        {
          "name": "Rules, engine, PCAP & threat intel",
          "count": "13 tools",
          "desc": "Search and manage the ruleset, live engine stats, PCAP replay, and MISP/TheHive pivots (mutating tools opt-in)."
        }
      ],
      "refHref": "https://github.com/lidless-labs/suricata-mcp#tools"
    },
    "setup": {
      "install": "npx -y suricata-mcp",
      "env": "Point SURICATA_EVE_LOG at your EVE JSON log; set ZEEK_LOGS_DIR, PCAP_DIR, and MISP/TheHive vars to light up the optional tool groups.",
      "configLabel": "MCP client config",
      "config": "{ \"mcpServers\": { \"suricata\": { \"command\": \"npx\", \"args\": [\"-y\", \"suricata-mcp\"], \"env\": { \"SURICATA_EVE_LOG\": \"/var/log/suricata/eve.json\", \"ZEEK_LOGS_DIR\": \"/opt/zeek/logs\" } } } }"
    },
    "safety": "Read-only by default: every analysis and query tool works out of the box, while the tools that change a live IDS or shell out stay disabled. Mutating tools (rule writes, ruleset reload, PCAP replay) require both SURICATA_ALLOW_MUTATION=1 in the environment and confirm: true on the call. suricata_create_rule enforces a local SID range and rejects collisions; PCAP filenames are basename-sanitized against option injection. MISP and TheHive calls use manual redirect handling, so a 3xx from a compromised endpoint is refused rather than followed with the API key attached.",
    "specs": [
      {
        "n": "41",
        "l": "MCP tools"
      },
      {
        "n": "5",
        "l": "resources"
      },
      {
        "n": "5",
        "l": "prompts"
      },
      {
        "n": "read-only",
        "l": "by default"
      },
      {
        "n": "MIT",
        "l": "license"
      }
    ]
  },
  "thehive-mcp": {
    "kind": "mcp",
    "value": "Running a SOC through TheHive means clicking through cases, alerts, observables, and Cortex jobs one screen at a time. thehive-mcp hands the whole incident-response workflow to your agent: triage alerts, open and update cases, enrich observables, and run analyzers in plain language, with the irreversible verbs gated off by default.",
    "meta": [
      "47 tools",
      "3 resources",
      "3 prompts",
      "write-gated",
      "TheHive 5",
      "MIT"
    ],
    "what": "thehive-mcp is a Model Context Protocol server for TheHive 5, the open-source incident-response and case-management platform. Point any MCP client at it and TheHive becomes 47 named, typed tools your agent can call in natural language: open and triage cases, promote and manage alerts, add and search observables, run and poll Cortex analyzers, and file task logs and comments. It differs from a raw REST client or a generic OpenAPI-to-MCP bridge because it is hand-built for TheHive: the irreversible verbs (delete case, delete alert, merge, promote) and the raw Query DSL ship disabled behind explicit environment flags, TLS relaxation is scoped to TheHive requests only, and the tool descriptions carry the correct TheHive 5 status enums so an agent cannot destroy case data or drift on stale semantics. It speaks stdio and launches on demand, so nothing listens on a port and nothing phones home.",
    "proof": {
      "type": "session",
      "label": "representative session · claude + thehive-mcp",
      "turns": [
        {
          "ask": "Any new high-severity alerts this morning, and does the source IP look malicious?"
        },
        {
          "call": "thehive_list_alerts{ status: \"New\", severity: \">=3\", range: \"12h\" }"
        },
        {
          "ret": "2 alerts\n~alrt-8842   Suspicious outbound C2   severity 3   src 203.0.113.47   sight/edr\n~alrt-8846   Failed MFA burst         severity 2   src 198.51.100.9  okta"
        },
        {
          "call": "thehive_run_analyzer_and_wait{ observable: \"203.0.113.47\", analyzer: \"AbuseIPDB_1_0\" }"
        },
        {
          "ret": "malicious   confidence 92   14 reports, last seen 4h ago   category: C2, brute-force"
        },
        {
          "say": "~alrt-8842 is the real one. The C2 destination 203.0.113.47 scores 92 malicious on AbuseIPDB with recent C2 reports. I would promote it to a case and block the IP. The MFA burst looks like noise."
        }
      ],
      "caption": "Representative session. Illustrative values, RFC 5737 addresses. Promote and delete are gated off by default. Your data never leaves the box."
    },
    "capabilities": {
      "title": "47 tools across the SOC workflow",
      "groups": [
        {
          "name": "Cases",
          "count": "16 tools",
          "desc": "List, get, create, update, search, close, assign, tag, flag, bulk-assign and bulk-close cases, plus timeline summaries; delete and merge are gated."
        },
        {
          "name": "Alerts",
          "count": "6 tools",
          "desc": "List, get, create, and update alerts; promote-to-case and delete are gated behind the destructive flag."
        },
        {
          "name": "Observables & tasks",
          "count": "11 tools",
          "desc": "Add single or bulk observables, search across all cases, and manage tasks with their log entries."
        },
        {
          "name": "Cortex analyzers",
          "count": "7 tools",
          "desc": "List analyzers, find enrichment options, run analyzers, poll jobs to completion, and summarize reports."
        },
        {
          "name": "Comments, users & templates",
          "count": "6 tools",
          "desc": "Add and list case comments, list users and the current profile, and list case templates."
        },
        {
          "name": "Query & status",
          "count": "2 tools",
          "desc": "Guarded raw TheHive Query DSL (gated) for complex searches, plus a server health and capability check."
        }
      ],
      "refHref": "https://github.com/lidless-labs/thehive-mcp#tools"
    },
    "setup": {
      "install": "npx -y thehive-mcp",
      "env": "Configure with THEHIVE_URL and THEHIVE_API_KEY. Add THEHIVE_ALLOW_DESTRUCTIVE_TOOLS=true and THEHIVE_ENABLE_RAW_QUERY=true only to opt into the gated tools.",
      "configLabel": "MCP client config",
      "config": "{ \"mcpServers\": { \"thehive\": { \"command\": \"npx\", \"args\": [\"-y\", \"thehive-mcp\"], \"env\": { \"THEHIVE_URL\": \"https://192.0.2.10:9000\", \"THEHIVE_API_KEY\": \"your-api-key\" } } } }"
    },
    "safety": "Destructive and irreversible tools (delete case, delete alert, merge cases, promote alert) and the raw Query DSL ship disabled and only become callable behind explicit environment flags, so an agent cannot quietly wipe or merge case data. TLS relaxation is scoped to TheHive requests via a per-client dispatcher, never the whole process, and sensitive values are redacted from error output.",
    "specs": [
      {
        "n": "47",
        "l": "MCP tools"
      },
      {
        "n": "5",
        "l": "gated verbs"
      },
      {
        "n": "stdio",
        "l": "no open port"
      },
      {
        "n": "MIT",
        "l": "license"
      }
    ]
  },
  "cortex-mcp": {
    "kind": "mcp",
    "value": "Detonating one indicator in Cortex means picking analyzers by hand, launching a job per analyzer, then clicking through each report to reconcile the verdicts. cortex-mcp hands the whole engine to your agent: auto-detect the observable, fan out across every applicable analyzer, and get one aggregated taxonomy verdict back in plain language.",
    "meta": [
      "31 tools",
      "4 resources",
      "4 prompts",
      "destructive-gated",
      "Node 20+",
      "MIT"
    ],
    "proof": {
      "type": "session",
      "label": "representative session · claude + cortex-mcp",
      "turns": [
        {
          "ask": "An alert flagged 203.0.113.47 for outbound traffic. What does Cortex think of it, and pull any IOCs?"
        },
        {
          "call": "cortex_analyze_observable{ data: \"203.0.113.47\", fanOut: true }"
        },
        {
          "ret": "auto-detected type: ip   ran 4 analyzers\nAbuse_Finder_3_0   malicious   abuse-confidence 92%\nMaxMind_GeoIP      RU / hosting ASN\nCyberCrime_Tracker suspicious   1 hit\ntaxonomy: 2 malicious / 1 suspicious / 1 info"
        },
        {
          "call": "cortex_get_job_artifacts{ jobId: \"a1f3-Abuse_Finder_3_0\" }"
        },
        {
          "ret": "3 artifacts\ndomain   c2.example.net\nurl      http://c2.example.net/gate.php\nip       198.51.100.9"
        },
        {
          "say": "203.0.113.47 is malicious: 92% abuse confidence, on a Russian hosting ASN, and it points at a c2.example.net C2 domain. I'd block the IP and domain and sweep for callbacks to 198.51.100.9. Running a responder stays gated until you confirm."
        }
      ],
      "caption": "Representative session. Illustrative values, RFC 5737 addresses. Nothing leaves the box except calls to the Cortex instance you configure."
    },
    "what": "cortex-mcp points any MCP client at a running Cortex instance and turns StrangeBee/TheHive's analyzer and responder engine into typed tools the agent can call. It exists because analysts already drive Cortex by hand through its web UI or raw REST API, and an agent can do that work conversationally: auto-detect an observable's data type, fan out analysis across every applicable analyzer, aggregate the taxonomy verdicts, and extract IOC artifacts without clicking through a dozen jobs. It differs from a generic HTTP bridge by modeling Cortex's real domain surface (analyzers, responders, jobs, definitions, orgs, users) as 31 typed tools with capped fan-out and safety gates, so the agent works in Cortex's vocabulary instead of reconstructing the API. It calls a Cortex instance you already run and never replaces it.",
    "capabilities": {
      "title": "31 tools across the Cortex pipeline",
      "groups": [
        {
          "name": "Analyzers",
          "count": "5 tools",
          "desc": "List and get enabled analyzers, run by ID or name, run against a path-confined or base64 file."
        },
        {
          "name": "Analyzer & responder definitions",
          "count": "6 tools",
          "desc": "Browse available definitions with filters, enable or disable them in the current org."
        },
        {
          "name": "Jobs & artifacts",
          "count": "7 tools",
          "desc": "Get status, wait for reports, list jobs, extract IOC artifacts, delete or bulk-clean with dry-run."
        },
        {
          "name": "Responders",
          "count": "2 tools",
          "desc": "List responders and execute a response action against a TheHive entity, gated behind confirm."
        },
        {
          "name": "Bulk analysis & status",
          "count": "2 tools",
          "desc": "Auto-detect an observable, fan out with taxonomy aggregation, and read instance health."
        },
        {
          "name": "Orgs & users (superadmin)",
          "count": "9 tools",
          "desc": "List, create, and update organizations and users, and rotate or retrieve API keys."
        }
      ],
      "refHref": "https://github.com/lidless-labs/cortex-mcp#mcp-tools-31"
    },
    "setup": {
      "install": "npx -y thehive-cortex-mcp",
      "env": "Set CORTEX_URL and CORTEX_API_KEY. Add CORTEX_SUPERADMIN_KEY for org/user management, CORTEX_FILE_BASE_DIR to allow path-based file reads, and CORTEX_ALLOW_DESTRUCTIVE=1 to permit responders.",
      "configLabel": "MCP client config",
      "config": "{ \"mcpServers\": { \"cortex\": { \"command\": \"npx\", \"args\": [\"-y\", \"thehive-cortex-mcp\"], \"env\": { \"CORTEX_URL\": \"http://cortex.example.com:9001\", \"CORTEX_API_KEY\": \"your-org-admin-key\" } } } }"
    },
    "safety": "Real-world actions are off or confirmation-gated by default. Responders require both CORTEX_ALLOW_DESTRUCTIVE=1 and confirm=true per call; job deletes and analyzer disables require confirm=true. Arbitrary file reads are blocked unless CORTEX_FILE_BASE_DIR is set, and even then paths are realpath-confined to defeat symlink and .. escapes. Bulk analysis will not fan out to every analyzer unless you opt in, and disabling SSL verification is scoped to Cortex requests only, never the whole process.",
    "specs": [
      {
        "n": "31",
        "l": "MCP tools"
      },
      {
        "n": "4",
        "l": "resources"
      },
      {
        "n": "4",
        "l": "prompts"
      },
      {
        "n": "gated",
        "l": "destructive actions"
      },
      {
        "n": "MIT",
        "l": "license"
      }
    ]
  },
  "mitre-mcp": {
    "kind": "mcp",
    "value": "An LLM asked about ATT&CK from memory gives you stale, hallucinated technique IDs, and your SOC stack sits in four separate consoles. mitre-mcp hands your agent the real, versioned ATT&CK knowledge base plus live Wazuh, TheHive, Cortex, and MISP, so it maps an alert to a technique and finds the coverage gap in one conversation.",
    "meta": [
      "39 tools",
      "3 resources",
      "4 prompts",
      "read-only by default",
      "Node 20+",
      "MIT"
    ],
    "what": "mitre-mcp is an MCP server that serves the official MITRE ATT&CK knowledge base (techniques, tactics, groups, software, mitigations, data sources, campaigns) from MITRE's STIX 2.1 bundles, cached locally so it works offline after first run. It exists because asking an LLM about adversary techniques gives you confident, made-up technique IDs and last year's data, while a SOC analyst needs the versioned truth and the alerts in front of them. Unlike a plain ATT&CK lookup tool, it ships the analysis layer (alert-to-technique mapping, detection coverage, attribution, Navigator layer export) and optional live integrations for Wazuh, TheHive, Cortex, and MISP in one server, so an agent can map a real alert to a technique and cross-correlate it across the whole stack without leaving the chat. With no credentials configured it is a pure read-only ATT&CK server.",
    "proof": {
      "type": "session",
      "label": "representative session · claude + mitre-mcp",
      "turns": [
        {
          "ask": "We got Wazuh rule 5710 firing on a DMZ host with sshd auth failures. What ATT&CK technique is that, and does the rest of my stack know about it?"
        },
        {
          "call": "mitre_map_wazuh_alert{ rule_id: 5710, groups: [\"sshd\", \"authentication_failed\"] }"
        },
        {
          "ret": "T1110.001  Brute Force: Password Guessing  (tactic: Credential Access)\nconfidence: high  data source: Logon Session / Authentication Logs"
        },
        {
          "call": "mitre_cross_correlate{ techniques: [\"T1110.001\"] }"
        },
        {
          "ret": "Wazuh:   14 alerts (dmz-web-01 198.51.100.24, last 1h)\nTheHive: 0 open cases\nMISP:    2 events tag attack-pattern:T1110.001 (APT28-linked infra)"
        },
        {
          "say": "That is T1110.001 password guessing. Wazuh has 14 hits on dmz-web-01, MISP already ties this technique to APT28 infra, but no TheHive case exists yet. I would open one and pivot on the MISP indicators."
        }
      ],
      "caption": "Representative session. Illustrative values, RFC 5737 addresses. SOC writes dry-run by default; your data never leaves the hosts you configure."
    },
    "capabilities": {
      "title": "39 tools across ATT&CK and your SOC stack",
      "groups": [
        {
          "name": "Core ATT&CK",
          "count": "19 tools",
          "desc": "Look up and search techniques, tactics, groups, software, mitigations, and data sources; map alerts, analyze coverage, build attack paths."
        },
        {
          "name": "Campaigns",
          "count": "4 tools",
          "desc": "Profile campaigns, fetch and list them, and search by keyword or technique for attribution work."
        },
        {
          "name": "Navigator export",
          "count": "1 tool",
          "desc": "Emit ATT&CK Navigator JSON layers for coverage, group, campaign, and diff heatmaps."
        },
        {
          "name": "Wazuh integration",
          "count": "4 tools",
          "desc": "Manager status, map rules and alerts to techniques, rule coverage, and ATT&CK-enriched alert fetch."
        },
        {
          "name": "TheHive & Cortex",
          "count": "5 tools",
          "desc": "Enrich, create, and list TheHive cases with ATT&CK context; map and run Cortex analyzers (writes gated)."
        },
        {
          "name": "MISP & cross-stack",
          "count": "6 tools",
          "desc": "Map events, search IOCs, create and list MISP events; SOC connection status and one-shot correlation across Wazuh, TheHive, and MISP."
        }
      ],
      "refHref": "https://github.com/lidless-labs/mitre-mcp#tools"
    },
    "setup": {
      "install": "claude mcp add mitre-attack --env MITRE_MATRICES=enterprise -- npx -y mitre-mcp",
      "env": "Core ATT&CK needs no credentials. Add WAZUH_*, THEHIVE_*, CORTEX_*, or MISP_* env vars to enable the optional SOC integrations; MITRE_MATRICES selects enterprise, mobile, or ics.",
      "configLabel": "MCP client config",
      "config": "{ \"mcpServers\": { \"mitre-attack\": { \"command\": \"npx\", \"args\": [\"-y\", \"mitre-mcp\"], \"env\": { \"MITRE_MATRICES\": \"enterprise\" } } } }"
    },
    "safety": "With no credentials configured, mitre-mcp is a pure read-only ATT&CK server. State-changing SOC tools (mitre_thehive_create_case, mitre_misp_create_event, mitre_cortex_run_analyzers) dry-run by default and return the action they would take unless the call passes confirm: true or MITRE_SOC_ALLOW_WRITES=true is set. IDs passed to SOC tools are validated against a strict allow-list and URL-encoded, and relaxed TLS (VERIFY_SSL=false) is scoped per request so other hosts stay protected.",
    "specs": [
      {
        "n": "39",
        "l": "MCP tools"
      },
      {
        "n": "4",
        "l": "SOC integrations"
      },
      {
        "n": "0",
        "l": "writes by default"
      },
      {
        "n": "STIX 2.1",
        "l": "ATT&CK source"
      },
      {
        "n": "MIT",
        "l": "license"
      }
    ]
  },
  "zeek-mcp": {
    "kind": "mcp",
    "value": "A real investigation means grepping conn, then dns, then http, then ssl by hand, pivoting on a UID you keep pasting between awk one-liners. zeek-mcp hands the whole sensor to your agent: Zeek and Suricata logs queried, correlated, and hunted over stdio, so it follows the pivot for you.",
    "meta": [
      "39 tools",
      "2 resources",
      "4 prompts",
      "read-only",
      "Node 20+",
      "MIT"
    ],
    "what": "Point any MCP client at zeek-mcp and your Zeek and Suricata sensor becomes tools the agent can call: search connection, DNS, HTTP, SSL, files, notice, and SSH logs, follow a connection UID across every log type, and cross-reference Suricata alerts back to the Zeek context that explains them. It exists because network telemetry lives in dense per-protocol log files that are tedious to grep under pressure, and an LLM is good at pivoting across them once you give it structured access. It differs from a generic log-reader MCP by speaking Zeek and Suricata natively: it parses both TSV and JSON, matches CIDR and wildcards with IPv6 support, walks gzipped and date-rotated archives, and ships purpose-built detections (beaconing by interval regularity, DNS tunneling by entropy, JA3 hunting, anomaly and baseline analysis) instead of handing the model raw text. It is read-only against your telemetry and speaks stdio, so there is no new network surface; the only writes are the optional TheHive and MISP tools, and only when you supply credentials.",
    "proof": {
      "type": "session",
      "label": "representative session · claude + zeek-mcp",
      "turns": [
        {
          "ask": "Anything on 203.0.113.45 look like C2? Follow the trail if you see it."
        },
        {
          "call": "zeek_detect_beaconing{ src: \"203.0.113.45\", jitter_max: 0.15 }"
        },
        {
          "ret": "1 candidate\n203.0.113.45 -> 198.51.100.7:443   interval ~60s   jitter 0.06   142 conns   ssl"
        },
        {
          "call": "zeek_investigate_host{ host: \"203.0.113.45\" }"
        },
        {
          "ret": "ssl   SNI cdn-update[.]info   self-signed   JA3 72a589da586844d7f0818ce684948eea\ndns   14x NXDOMAIN, high-entropy labels\nnotice   Scan::Port_Scan earlier same host"
        },
        {
          "say": "203.0.113.45 is beaconing to 198.51.100.7 every ~60s with near-zero jitter, over a self-signed cert whose JA3 matches CobaltStrike. That plus the DGA-looking DNS is a strong C2 signal. I would isolate it and open a TheHive case."
        }
      ],
      "caption": "Representative session. Illustrative values, RFC 5737 addresses. Read-only, and your logs never leave the box."
    },
    "capabilities": {
      "title": "39 tools across the sensor",
      "groups": [
        {
          "name": "Protocol queries",
          "count": "11 tools",
          "desc": "Search conn, DNS, HTTP, SSL, files, notice, SSH, and DHCP logs with CIDR, wildcard, and range filters."
        },
        {
          "name": "Detections & analytics",
          "count": "9 tools",
          "desc": "Beaconing, DNS tunneling, JA3 fingerprints and hunt, anomaly and baseline outlier detection, DGA and expired-cert checks."
        },
        {
          "name": "Cross-log investigation",
          "count": "3 tools",
          "desc": "Follow a UID or host across every log type and inventory detected software."
        },
        {
          "name": "Suricata IDS",
          "count": "4 tools",
          "desc": "Query and summarize eve.json alerts, correlate them back to Zeek context, and read engine stats."
        },
        {
          "name": "PCAP & sensor",
          "count": "3 tools",
          "desc": "List captures, replay a PCAP through Zeek, and check live sensor health and log freshness."
        },
        {
          "name": "Incident response",
          "count": "6 tools",
          "desc": "Opt-in TheHive alerts and cases plus MISP IOC lookups and events, only when you supply credentials."
        }
      ],
      "refHref": "https://github.com/lidless-labs/zeek-mcp#tools"
    },
    "setup": {
      "install": "npx -y zeek-mcp",
      "env": "Set ZEEK_LOG_DIR, ZEEK_LOG_FORMAT (json or tsv), and SURICATA_EVE_LOG to your sensor paths. Optional MISP_* / THEHIVE_* / PCAP_DIR vars enable IR and replay.",
      "configLabel": "MCP client config",
      "config": "{ \"mcpServers\": { \"zeek\": { \"command\": \"npx\", \"args\": [\"-y\", \"zeek-mcp\"], \"env\": { \"ZEEK_LOG_DIR\": \"/opt/zeek/logs/current\", \"ZEEK_LOG_FORMAT\": \"tsv\", \"SURICATA_EVE_LOG\": \"/opt/suricata/logs/eve.json\" } } } }"
    },
    "safety": "Read-only against Zeek and Suricata telemetry: it queries logs, never runs the sensor, mutates capture, or writes to your data. It retains nothing between calls and opens no network listeners. The only writes are the optional TheHive and MISP tools, which create alerts, cases, and events only when you supply credentials. PCAP replay confines every filename to PCAP_DIR and rejects anything resolving outside it.",
    "specs": [
      {
        "n": "39",
        "l": "MCP tools"
      },
      {
        "n": "16",
        "l": "log types"
      },
      {
        "n": "0",
        "l": "writes by default"
      },
      {
        "n": "MIT",
        "l": "license"
      }
    ]
  },
  "maltego-mcp": {
    "kind": "mcp",
    "value": "Graph-driven OSINT in Maltego Desktop is point-and-click work, so the agent that just reasoned over your indicators has to dictate clicks to a human. maltego-mcp lets it build the graph directly: create entities and links, run whois / DNS / ASN / crt.sh lookups, and write a ready-to-open .mtgx file, no canvas and no paid connector.",
    "meta": [
      "13 tools",
      "maltegoctl CLI",
      "read-only CLI",
      "Node 20+",
      "Maltego Basic OK",
      "MIT"
    ],
    "proof": {
      "type": "session",
      "label": "representative session · claude + maltego-mcp",
      "turns": [
        {
          "ask": "Build me a Maltego graph for example.com with whois, DNS, and ASN expansion."
        },
        {
          "call": "maltego_expand_domain{ domain: \"example.com\", outputPath: \"example-com.mtgx\" }"
        },
        {
          "ret": "Domain example.com\n  whois  registrar: IANA, created 1995-08-14\n  DNS    A 203.0.113.10, MX 10 mail.example.com, NS a.iana-servers.net\n  ASN    AS64500 / 203.0.113.0/24 / US / Example-Net\nsaved 9 entities, 8 links -> ~/MaltegoGraphs/example-com.mtgx"
        },
        {
          "call": "maltego_crtsh{ domain: \"example.com\" }"
        },
        {
          "ret": "4 cert-transparency entries\n  *.example.com   Let's Encrypt   2026-06-02 -> 2026-08-31\n  vpn.example.com Let's Encrypt   2026-05-19 -> 2026-08-17"
        },
        {
          "say": "Graph saved to ~/MaltegoGraphs/example-com.mtgx, open it in Maltego Desktop. crt.sh surfaces a vpn.example.com host not in the DNS answers, worth adding as a pivot before you dig further."
        }
      ],
      "caption": "Representative session. Illustrative values, RFC 5737 addresses. Lookups query public records; the graph is written to your disk and never leaves the box."
    },
    "what": "maltego-mcp is an MCP server that lets an LLM author Maltego .mtgx graph files and run primitive OSINT lookups (whois, DNS, ASN, crt.sh) from inside an agent session. It exists because graph-driven investigation in Maltego Desktop is normally point-and-click work, and an agent already reasoning over indicators should produce the graph itself rather than dictate clicks. Unlike a Maltego transform pack, it lives in the agent layer first: the graph is built by tool calls and saved to disk, so it works on the Basic plan with no paid connectors, and an optional Phase B TRX pack (.mtz) adds native right-click pivots into MISP, TheHive, Cortex, and ATT&CK for teams that want them. The same package ships maltegoctl, a read-only CLI that exposes only the lookups and a .mtgx inspector for shells, cron, and CI.",
    "capabilities": {
      "title": "13 tools across two layers",
      "groups": [
        {
          "name": "Graph authoring",
          "count": "5 tools",
          "desc": "Create a graph, add typed entities and links, save to .mtgx, or load an existing one back into a handle."
        },
        {
          "name": "Primitive lookups",
          "count": "4 tools",
          "desc": "whois, DNS (A/AAAA/MX/NS/TXT), Team Cymru ASN, and crt.sh certificate transparency for a single target."
        },
        {
          "name": "Convenience expanders",
          "count": "4 tools",
          "desc": "One call turns an IP, domain, hash, or enriched IOC into a saved .mtgx pivot map."
        },
        {
          "name": "maltegoctl CLI",
          "count": "read-only",
          "desc": "Same lookups plus a .mtgx inspector for shells, cron, and CI; never writes to disk."
        },
        {
          "name": "Phase B transforms",
          "count": "optional .mtz",
          "desc": "Python TRX right-click pivots into MISP, TheHive, Cortex, and the bundled ATT&CK dataset inside Maltego Desktop."
        }
      ],
      "refHref": "https://github.com/lidless-labs/maltego-mcp#tools-phase-a"
    },
    "setup": {
      "install": "npm install -g maltego-mcp",
      "env": "Both env vars optional: MALTEGO_MCP_OUTPUT_DIR (default ~/MaltegoGraphs) and MALTEGO_MCP_LOOKUP_TIMEOUT_MS (default 30000, crt.sh only).",
      "configLabel": "MCP client config",
      "config": "{ \"mcpServers\": { \"maltego\": { \"command\": \"maltego-mcp\" } } }"
    },
    "safety": "The bundled maltegoctl CLI is read-only: it exposes only the OSINT lookups and a .mtgx inspector, and inspect is confined to MALTEGO_MCP_OUTPUT_DIR. Graph authoring and file writes stay in the MCP surface because their effect is writing a file. Lookups query public records (whois, DNS, ASN, crt.sh); the graph itself is written to your disk and never leaves the box, and the Basic-friendly demo graph uses documentation-safe indicators only.",
    "specs": [
      {
        "n": "13",
        "l": "MCP tools"
      },
      {
        "n": "4",
        "l": "OSINT lookups"
      },
      {
        "n": "read-only",
        "l": "maltegoctl CLI"
      },
      {
        "n": "MIT",
        "l": "license"
      }
    ]
  },
  "proxmox-mcp": {
    "kind": "mcp",
    "value": "Driving a Proxmox cluster from the web UI means clicking through nodes, guests, and task logs one panel at a time. proxmox-mcp hands the whole cluster to your agent over API-token auth: inventory VMs and containers, boot or clone a guest, trace a UPID, and manage snapshots and backups in plain language, with a three-tier write gate so nothing changes state by accident.",
    "meta": [
      "96 tools",
      "4 write tiers",
      "read-only CLI",
      "stdio",
      "Node 20+",
      "MIT"
    ],
    "what": "proxmox-mcp is an MCP server that turns a Proxmox VE cluster into tools an agent can call: cluster and node status, VM and LXC inventory, configs, RRD metrics, task tracing, snapshots, backups, gated guest reads and shell exec, and full provision/clone/destroy lifecycle, all over Proxmox API-token auth. It exists because your homelab lives in Proxmox and you want an assistant to inventory it or boot a guest without you clicking through the web UI or handing it a root shell. What sets it apart is the write-safety model: 96 tools split across four tiers where reads are open, safe writes need confirm: true, and destructive ops need confirm: true plus destructive: true plus a process-level PROXMOX_ENABLE_DESTRUCTIVE=1 env flag, so a hallucinated call fails closed before any HTTP traffic reaches Proxmox.",
    "proof": {
      "type": "session",
      "label": "representative session · claude + proxmox-mcp",
      "turns": [
        {
          "ask": "CT 105 on the cluster feels sluggish. What is it doing, and can you snapshot it before I poke at it?"
        },
        {
          "call": "proxmox_resource_usage{ vmid: 105 }"
        },
        {
          "ret": "ct 105  wazuh   node pve-01   cpu 94%   mem 3.8/4.0 GiB   disk 61%   uptime 12d"
        },
        {
          "call": "proxmox_snapshot_resource{ vmid: 105, name: \"pre-triage\", confirm: true }"
        },
        {
          "ret": "UPID:pve-01:vzdump-snapshot:105  snapshot pre-triage created  ok"
        },
        {
          "say": "CT 105 is pinned at 94% CPU and 3.8 of 4.0 GiB memory, so it is memory-starved, not idle-slow. I took snapshot pre-triage so you can roll back safely. Bump its memory or check the wazuh indexer before you dig in."
        }
      ],
      "caption": "Representative session. Illustrative values, RFC 5737 addresses. The write took confirm: true; destructive tools stay gated behind an env flag."
    },
    "capabilities": {
      "title": "96 tools across four write tiers",
      "groups": [
        {
          "name": "Cluster & guest reads",
          "count": "43 tools",
          "desc": "Open, no flag. Cluster/node status, VM and LXC inventory, configs, storage, snapshots, backups, RRD usage, tasks, disks, HA/SDN/replication."
        },
        {
          "name": "Access & firewall reads",
          "count": "included in reads",
          "desc": "Users, roles, ACLs, pools, API tokens, and firewall rules/options inspected at cluster, node, or guest scope."
        },
        {
          "name": "Gated guest reads",
          "count": "4 tools",
          "desc": "Read files, stat paths, list directories, and check service state inside a guest over host-backed SSH. Require confirm: true."
        },
        {
          "name": "Lifecycle safe-writes",
          "count": "41 tools",
          "desc": "Start/stop/reboot, snapshot, backup, create/clone/migrate, config and disk edits, guest exec and write_file, service control. Require confirm: true."
        },
        {
          "name": "Destructive ops",
          "count": "8 tools",
          "desc": "Destroy, force-stop, rollback, delete snapshot/volume/storage, node power. Require confirm + destructive + PROXMOX_ENABLE_DESTRUCTIVE=1."
        }
      ],
      "refHref": "https://github.com/lidless-labs/proxmox-mcp#tool-list-96-tools-verified-against-source"
    },
    "setup": {
      "install": "npm i -g @solomonneas/proxmox-mcp   (or npx -y @solomonneas/proxmox-mcp)",
      "env": "Set PROXMOX_URL, PROXMOX_TOKEN_ID, PROXMOX_TOKEN_SECRET (all required). PROXMOX_TLS_INSECURE=false for homelab self-signed certs; PROXMOX_ENABLE_DESTRUCTIVE=1 to unlock tier-3.",
      "configLabel": "MCP client config",
      "config": "{ \"mcpServers\": { \"proxmox\": { \"command\": \"npx\", \"args\": [\"-y\", \"@solomonneas/proxmox-mcp\"], \"env\": { \"PROXMOX_URL\": \"https://192.0.2.10:8006\", \"PROXMOX_TOKEN_ID\": \"pve-admin@pam!api-token-1\", \"PROXMOX_TOKEN_SECRET\": \"00000000-0000-0000-0000-000000000000\", \"PROXMOX_TLS_INSECURE\": \"false\" } } } }"
    },
    "safety": "Every tool's tier is enforced in code, not just documented. Reads are open; safe writes require confirm: true and throw WriteGateError before any HTTP call when the flag is missing; the 8 destructive tools also require destructive: true plus the process-level PROXMOX_ENABLE_DESTRUCTIVE=1 env flag, staying inert until you set it. The token secret is registered with a redactor at startup and masked from all log and error output. The bundled proxmoxctl CLI is read-only, so shells, cron, and CI never touch a write path. Recommended start: a read-only token (Datastore.Audit + VM.Audit + Sys.Audit), graded up only after confirming the gates hold.",
    "specs": [
      {
        "n": "96",
        "l": "MCP tools"
      },
      {
        "n": "43",
        "l": "open reads"
      },
      {
        "n": "8",
        "l": "env-gated destructive"
      },
      {
        "n": "stdio",
        "l": "transport"
      },
      {
        "n": "MIT",
        "l": "license"
      }
    ]
  },
  "librenms-mcp": {
    "kind": "ctrl",
    "value": "Your LibreNMS UI shows you a wall of green and one red row, but your agent cannot read it and your scripts have to hand-roll REST calls against the token. librenms-mcp gives shells, cron, and any MCP client a typed command surface over your monitored network: devices, ports, port health, alerts, alert history, and events, with every write gated behind an explicit confirm.",
    "meta": [
      "13 tools",
      "10 reads / 3 gated writes",
      "write-gated",
      "Node 20+",
      "MIT"
    ],
    "proof": {
      "type": "session",
      "label": "representative session · claude + librenms-mcp",
      "turns": [
        {
          "ask": "What is alerting right now, and which port on the worst device is actually the problem?"
        },
        {
          "call": "librenms_list_alerts{ state: 1 }"
        },
        {
          "ret": "2 active\n7   core-sw1 (203.0.113.4)   port errors_in above threshold   active\n8   edge-rtr2 (203.0.113.9)  device down                       active"
        },
        {
          "call": "librenms_port_health{ device: \"core-sw1\", metric: \"errors_in\", limit: 5 }"
        },
        {
          "ret": "Gi1/0/24   errors_in 4213/s   utilization 91%   uplink to edge-rtr2"
        },
        {
          "call": "librenms_ack_alert{ id: 7 }"
        },
        {
          "ret": "WriteGateError: write requires confirm: true"
        },
        {
          "say": "core-sw1 Gi1/0/24 is the uplink to the down edge-rtr2, and it is pegged at 91% with rising input errors. That one link explains both alerts. I stopped short of acking alert 7 since the gate needs confirm: true, so it is yours to approve."
        }
      ],
      "caption": "Representative session. Illustrative values, RFC 5737 addresses. Reads are open, writes need confirm: true, and your token never leaves the box."
    },
    "what": "Point any MCP client, or a plain shell, at librenms-mcp and your LibreNMS instance becomes a scriptable control surface instead of a UI you have to click through. It authenticates with a LibreNMS API token, talks to the `/api/v0` REST API under the hood, and exposes 13 named tools that emit structured data an agent can reason over or human-readable tables you can pipe. It differs from handing an agent a generic HTTP tool and the raw token in the way that matters once a write is possible: every write is refused unless the call carries `confirm: true`, every argument is bounds- and enum-checked against a published TypeBox schema before a URL is built, and the token is redacted from all output, so a hallucinated tool call cannot change your monitoring state by accident. The read-only `librenmsctrl` CLI shares the same client core for cron and CI.",
    "capabilities": {
      "title": "13 tools across the monitoring surface",
      "groups": [
        {
          "name": "Devices & inventory",
          "count": "3 tools",
          "desc": "Instance status, list monitored devices, fetch a single device by id."
        },
        {
          "name": "Ports & health",
          "count": "3 tools",
          "desc": "List ports across devices, pull one port detail, view port health and utilization."
        },
        {
          "name": "Alerts & events",
          "count": "4 tools",
          "desc": "List and fetch current alerts, read alert history, tail the device event log."
        },
        {
          "name": "Safe writes (gated)",
          "count": "3 tools",
          "desc": "Acknowledge an alert, unmute an alert, set device maintenance. Each needs confirm: true."
        }
      ],
      "refHref": "https://github.com/lidless-labs/librenmsctrl#tools"
    },
    "setup": {
      "install": "npm install -g @solomonneas/librenms-mcp",
      "env": "Needs Node 20+ and two env vars: LIBRENMS_URL and LIBRENMS_TOKEN (start with a Read Only token role). LIBRENMS_TLS_INSECURE=true is optional for homelab self-signed certs.",
      "configLabel": "MCP client config",
      "config": "{ \"mcpServers\": { \"librenms\": { \"command\": \"npx\", \"args\": [\"-y\", \"@solomonneas/librenms-mcp\"], \"env\": { \"LIBRENMS_URL\": \"https://librenms.example.local\", \"LIBRENMS_TOKEN\": \"<your-api-token>\" } } } }"
    },
    "safety": "Writes are gated in three tiers. Reads (tier 1) are open. Safe writes (tier 2: ack, unmute, set maintenance) require an explicit `confirm: true` argument, so a call missing the flag throws `WriteGateError` before any HTTP traffic leaves the host. Destructive operations (tier 3: device deletion, alert-rule removal, bulk port resets) are intentionally not implemented in v1. Every argument is validated against its TypeBox inputSchema and interpolated path and query values are URL-encoded, so a malformed or injection-style argument is rejected up front. The API token is registered with a redactor on startup and masked from all log and error output.",
    "specs": [
      {
        "n": "13",
        "l": "MCP tools"
      },
      {
        "n": "10",
        "l": "open reads"
      },
      {
        "n": "3",
        "l": "confirm-gated writes"
      },
      {
        "n": "0",
        "l": "destructive ops in v1"
      },
      {
        "n": "MIT",
        "l": "license"
      }
    ]
  },
  "n8n-ops-mcp": {
    "kind": "ctrl",
    "value": "When an n8n workflow fails at 3am, you find out by clicking through the executions list one run at a time. n8n-ops-mcp hands your whole n8n instance to the agent: list what broke, read the per-node error, trigger a retry, audit for security risks, and edit workflows, all without leaving your MCP client.",
    "meta": [
      "40 tools",
      "read-only default",
      "write-gated",
      "credential 2nd gate",
      "Node 20+",
      "MIT"
    ],
    "what": "Point any MCP client at n8n-ops-mcp and your running n8n instance becomes tools the agent can call over the n8n Public API: workflows, executions, schedules, webhooks, tags, and credential metadata. It is built for operating the flows you already run (triage failed executions, find drift, scan for security risks) rather than indexing n8n's node catalog to build new ones. It differs from a docs or builder tool in that read tools are always on while every write hides behind N8N_ENABLE_EDIT and destructive ops confirm-gate and snapshot first, so the same package is safe to hand a read-only agent or an operator with edit unlocked. It ships as a stdio MCP adapter (n8nctrl mcp or the back-compat n8n-ops-mcp bin), a read-only CLI (n8nctrl) for shells and cron, and a first-class OpenClaw plugin, with no hard dependency on a specific model or harness.",
    "proof": {
      "type": "session",
      "label": "representative session · claude + n8n-ops-mcp",
      "turns": [
        {
          "ask": "What n8n workflows broke today, and can you tell me why the worst one is failing?"
        },
        {
          "call": "n8n_list_executions{ status: \"error\", limit: 20 }"
        },
        {
          "ret": "3 failed\n8814  Nightly CRM Sync    error  02:03Z\n8791  Invoice Webhook     error  01:47Z\n8712  Slack Digest        error  00:10Z"
        },
        {
          "call": "n8n_get_execution{ id: \"8814\", includeRunData: true }"
        },
        {
          "ret": "node \"HTTP Request\" failed\nECONNREFUSED 203.0.113.20:443  (crm.internal)\nretriedFrom: null   stoppedAt: 02:03Z"
        },
        {
          "say": "Nightly CRM Sync is the one to look at. Its HTTP Request node got ECONNREFUSED to crm.internal (203.0.113.20:443), so the CRM endpoint was down, not a workflow bug. The other two look downstream of it. Want me to n8n_retry_execution 8814 once the endpoint is back?"
        }
      ],
      "caption": "Representative session. Illustrative values, RFC 5737 addresses. Reads are always on; the retry it offers needs N8N_ENABLE_EDIT plus confirm."
    },
    "capabilities": {
      "title": "40 tools across the n8n ops surface",
      "groups": [
        {
          "name": "Executions & triage",
          "count": "9 tools",
          "desc": "List, get, search executions with per-node error logs; cancel, retry, and batch-delete runs."
        },
        {
          "name": "Workflows & lifecycle",
          "count": "9 tools",
          "desc": "Get, validate, diff, create, save, activate, archive, and delete workflows with snapshot-before-delete."
        },
        {
          "name": "Scanners & drift",
          "count": "6 tools",
          "desc": "Find workflows by node type or credential, list schedules and webhooks, surface disabled nodes and browser-bridge usage."
        },
        {
          "name": "Stats & security audit",
          "count": "2 tools",
          "desc": "Per-workflow failure rate and p95 runtime; n8n's built-in credentials/database/nodes/filesystem/instance audit."
        },
        {
          "name": "Tags",
          "count": "6 tools",
          "desc": "List, read, create, delete tags and replace a workflow's tag set."
        },
        {
          "name": "Credentials",
          "count": "5 tools",
          "desc": "Read credential metadata and schemas (secrets never echoed); create and delete behind a second write gate."
        }
      ],
      "refHref": "https://github.com/lidless-labs/n8nctrl#tools"
    },
    "setup": {
      "install": "npm install -g n8n-ops-mcp",
      "env": "Required: N8N_BASE_URL, N8N_API_KEY (Settings -> API). Optional gates: N8N_ENABLE_EDIT, N8N_ENABLE_CREDENTIALS_WRITE, plus N8N_BACKUP_DIR, N8N_MAX_EXECUTION_LOG_BYTES, N8N_REQUEST_TIMEOUT_MS.",
      "configLabel": "MCP client config",
      "config": "{ \"mcpServers\": { \"n8n\": { \"command\": \"npx\", \"args\": [\"-y\", \"n8n-ops-mcp\"], \"env\": { \"N8N_BASE_URL\": \"https://n8n.example.com\", \"N8N_API_KEY\": \"your-n8n-api-key\" } } } }"
    },
    "safety": "Writes are off by default. All create/save/trigger/archive/delete tools hide unless N8N_ENABLE_EDIT=true and require confirm:true; deletes snapshot to a backup directory first, and the read-only diff tool confines snapshot reads to that directory so it cannot be turned into an arbitrary file-read primitive. Credential writes sit behind a second independent gate (N8N_ENABLE_CREDENTIALS_WRITE), and credential secrets are stripped from every response including error paths, so a validation 400 cannot leak submitted data.",
    "specs": [
      {
        "n": "40",
        "l": "MCP tools"
      },
      {
        "n": "2",
        "l": "write gates"
      },
      {
        "n": "0",
        "l": "writes by default"
      },
      {
        "n": "MIT",
        "l": "license"
      }
    ]
  },
  "adguard-mcp": {
    "kind": "ctrl",
    "value": "Tuning DNS filtering means the AdGuard Home dashboard, one box at a time, and hoping you clicked the right client. adguard-mcp hands the whole control surface to your agent: status, stats, query logs, filter lists, and gated changes, across every AdGuard Home instance you run, in plain language over stdio.",
    "meta": [
      "33 tools",
      "14 read-only",
      "write-gated",
      "multi-instance",
      "Node 20+",
      "MIT"
    ],
    "proof": {
      "type": "session",
      "label": "representative session · claude + adguard-mcp",
      "turns": [
        {
          "ask": "My kid says YouTube is blocked on the living-room tablet but the phone works. What is AdGuard actually doing, and can you block youtube.com for that one client?"
        },
        {
          "call": "adguard_check_host{ host: \"youtube.com\", client: \"kid-tablet\" }"
        },
        {
          "ret": "filtered: false   reason: NotFilteredNotFound\nresolved: 203.0.113.44, 203.0.113.45\nmatched rules: (none)   instance: primary"
        },
        {
          "call": "adguard_add_user_rule{ rule: \"||youtube.com^$client=kid-tablet\", confirm: true }"
        },
        {
          "ret": "ok   rule added   user rules: 41 -> 42   instance: primary"
        },
        {
          "say": "Nothing was blocking it, that is why the tablet still reached YouTube. I added a per-client rule scoped to kid-tablet, so YouTube is blocked there and the phone is untouched. That write needed confirm: true; I did not flip anything global."
        }
      ],
      "caption": "Representative session. Illustrative values, RFC 5737 addresses. Credentials stay in memory and are redacted from logs; nothing leaves your box."
    },
    "what": "Point any MCP client at adguard-mcp and your self-hosted AdGuard Home becomes tools the agent can call: read status, stats, the DNS query log, filter lists, named clients, DNS config, and a check_host lookup that shows exactly what AdGuard would do with a hostname. The reason it exists is that the raw AdGuard Home API has no agent-safety layer, so every endpoint (including the ones that disable all blocking or wipe your rules) is one hallucinated call away. adguard-mcp differs by encoding those endpoints as typed tools behind a three-tier gate, keeping reads open, requiring confirm: true on writes, and requiring both confirm: true and destructive: true on destructive ops, while resolving any number of instances from env vars so one tool call can target a non-default box or drive AdGuardHome Sync.",
    "capabilities": {
      "title": "33 tools across three gating tiers",
      "groups": [
        {
          "name": "Status & inspection",
          "count": "6 read tools",
          "desc": "Server status, stats window, DNS query-log slices, DNS config, and a check_host lookup that reports AdGuard's filter decision, matched rules, and resolved IPs."
        },
        {
          "name": "Filter lists & rules",
          "count": "read + safe writes",
          "desc": "List subscribed blocklists/allowlists and custom user rules; add, remove, toggle, or refresh lists and append/remove single user rules behind confirm: true."
        },
        {
          "name": "Clients & blocked services",
          "count": "read + safe writes",
          "desc": "Enumerate named clients and the blocked-services catalog; add, update, or set per-client blocked services and schedules with confirm: true."
        },
        {
          "name": "Protection & SafeSearch",
          "count": "safe + destructive",
          "desc": "Toggle SafeSearch and SafeBrowsing (safe writes); toggle global protection or wholesale-replace the user-rules block (destructive, needs confirm + destructive)."
        },
        {
          "name": "Query log & stats maintenance",
          "count": "3 destructive tools",
          "desc": "Clear the DNS query log, reset the stats window, or delete a named client; each gated behind confirm: true and destructive: true."
        },
        {
          "name": "AdGuardHome Sync",
          "count": "4 tools",
          "desc": "Origin/replica status, healthz check, and in-memory logs (reads), plus trigger a sync run; separate env prefix, tools stay listed but error clearly if Sync is unconfigured."
        }
      ],
      "refHref": "https://github.com/lidless-labs/adguardctrl#tools"
    },
    "setup": {
      "install": "npm i -g @solomonneas/adguard-mcp",
      "env": "Set per-instance ADGUARD_PRIMARY_URL, ADGUARD_PRIMARY_USERNAME, ADGUARD_PRIMARY_PASSWORD (at least one instance required); add ADGUARD_<NAME>_* for more boxes and optional ADGUARDHOME_SYNC_URL for Sync.",
      "configLabel": "MCP client config",
      "config": "{ \"mcpServers\": { \"adguard\": { \"command\": \"npx\", \"args\": [\"-y\", \"@solomonneas/adguard-mcp\"], \"env\": { \"ADGUARD_PRIMARY_URL\": \"http://192.0.2.10\", \"ADGUARD_PRIMARY_USERNAME\": \"admin\", \"ADGUARD_PRIMARY_PASSWORD\": \"your-password\" } } } }"
    },
    "safety": "Three write-gate tiers: reads are open, safe writes require an explicit confirm: true, and destructive ops (toggle protection, replace the rules block, delete a client, wipe the query log) additionally require destructive: true, so an agent cannot disable filtering or wipe rules on a hallucinated call. Credentials live only in memory after env-load and are redacted from logs and error messages. It runs no daemon, stores no DNS traffic, and targets only self-hosted AdGuard Home boxes you run.",
    "specs": [
      {
        "n": "33",
        "l": "MCP tools"
      },
      {
        "n": "14",
        "l": "read-only"
      },
      {
        "n": "3",
        "l": "write-gate tiers"
      },
      {
        "n": "multi",
        "l": "instances + Sync"
      },
      {
        "n": "MIT",
        "l": "license"
      }
    ]
  },
  "immich-mcp": {
    "kind": "ctrl",
    "value": "Your Immich library holds your whole life in photos, but the web UI is built for clicking, not for \"find every duplicate and tell me which to keep\" across thousands of assets. immich-mcp hands the library to your agent as typed, write-gated tool calls: smart search, albums, people, memories, and checksum-safe dedupe, all over stdio.",
    "meta": [
      "74 tools",
      "16 domains",
      "write-gated",
      "stdio",
      "Node 20+",
      "MIT"
    ],
    "what": "immich-mcp (repo immichctrl) is an operator control surface for Immich, the self-hosted photo and video library: an MCP adapter plus a read-only `immichctrl` CLI for shells and cron. Point any MCP client at it and Immich's REST API becomes 74 schema-validated tools across 16 domains, so an agent can smart-search by natural language, curate albums and tags, recognize and merge people, surface \"on this day\" memories, and resolve duplicates in plain language instead of clicking through a grid. It differs from other Immich MCP servers in breadth and safety: it covers memories, motion-photo stacks, checksum-safe duplicate resolution, trash auditing, and job control, and it ships a two-tier write model where reads always work but every write hides behind `IMMICH_ALLOW_WRITES=true` and every destructive call demands a per-request `confirm: true`, so an agent cannot quietly delete your photos.",
    "proof": {
      "type": "session",
      "label": "representative session · claude + immich-mcp",
      "turns": [
        {
          "ask": "My library feels bloated. Find duplicate photos and tell me which to delete, but don't delete anything yet."
        },
        {
          "call": "immich_categorize_duplicates{ scope: \"active\" }"
        },
        {
          "ret": "312 duplicate groups, 1.9 GB reclaimable\nchecksum-exact   214 groups   byte-identical, safe to trash\nresolution-variants 61 groups  keep highest-res\nedits            37 groups   original + edited copy"
        },
        {
          "call": "immich_explain_duplicate_group{ id: \"grp_00b1\" }"
        },
        {
          "ret": "3 assets, checksum-exact\nkeeper  IMG_4821.jpg  4032x3024  in album \"Iceland 2019\"\ndiscard IMG_4821 (1).jpg, IMG_4821 (2).jpg  no album"
        },
        {
          "say": "You have 312 duplicate groups, about 1.9 GB to reclaim. The 214 checksum-exact groups are byte-identical and safe. For grp_00b1 I'd keep the copy that's already in your Iceland album and trash the two loose duplicates. Say the word and I'll run immich_resolve_with_keep_strategy as a dry run first."
        }
      ],
      "caption": "Representative session. Illustrative values, RFC 5737 addresses. Nothing leaves your box, and no write runs without IMMICH_ALLOW_WRITES plus a per-call confirm."
    },
    "capabilities": {
      "title": "74 tools across 16 domains",
      "groups": [
        {
          "name": "Search & discovery",
          "count": "3 tools",
          "desc": "CLIP smart search, structured metadata search, and a server-side explore feed."
        },
        {
          "name": "Assets & EXIF",
          "count": "11 tools",
          "desc": "List, read metadata and EXIF, favorite, archive, rate, geotag, trash, restore, and confined upload."
        },
        {
          "name": "Albums, tags & shared links",
          "count": "20 tools",
          "desc": "Full lifecycle for albums, tags, and shared links, plus search-then-album in one gated step."
        },
        {
          "name": "People & faces",
          "count": "7 tools",
          "desc": "Enumerate faces, rename, hide, suggest names for unnamed clusters, and merge duplicate clusters."
        },
        {
          "name": "Duplicates & dedupe",
          "count": "10 tools",
          "desc": "Categorize groups, find byte-identical and CLIP dupes, audit active library and trash, resolve by keep strategy."
        },
        {
          "name": "Memories, stacks, trash & jobs",
          "count": "16 tools",
          "desc": "On-this-day lanes and daily digest, motion-photo stacks, trash audit and empty, and background job control."
        }
      ],
      "refHref": "https://github.com/lidless-labs/immichctrl#tools"
    },
    "setup": {
      "install": "npm i -g immich-mcp   (or npx -y immich-mcp, no install)",
      "env": "Set IMMICH_BASE_URL (note the /api suffix) and IMMICH_API_KEY from Account Settings > API Keys. IMMICH_ALLOW_WRITES defaults to false; set true to expose write and delete tools. Optional: IMMICH_UPLOAD_BASE_DIR to allow confined path uploads, IMMICH_VERIFY_SSL=false for self-signed certs.",
      "configLabel": "MCP client config",
      "config": "{ \"mcpServers\": { \"immich-mcp\": { \"command\": \"npx\", \"args\": [\"-y\", \"immich-mcp\"], \"env\": { \"IMMICH_BASE_URL\": \"https://photos.example.com/api\", \"IMMICH_API_KEY\": \"YOUR_KEY\", \"IMMICH_ALLOW_WRITES\": \"false\" } } } }"
    },
    "safety": "Two-tier write protection. Reads always work; write and delete tools only register when IMMICH_ALLOW_WRITES=true, and destructive calls (bulk updates, permanent deletes, people merges, emptying trash) additionally refuse to run without a per-call confirm: true. Dedupe tools are dry-run by default. Path-based upload is confined to IMMICH_UPLOAD_BASE_DIR after resolving symlinks, and relaxed TLS is scoped to the Immich client's dispatcher, not the whole process. The CLI exposes reads only. Nothing is sent anywhere except the Immich server you point it at.",
    "specs": [
      {
        "n": "74",
        "l": "MCP tools"
      },
      {
        "n": "16",
        "l": "domains"
      },
      {
        "n": "write-gated",
        "l": "two-tier confirm"
      },
      {
        "n": "stdio",
        "l": "transport"
      },
      {
        "n": "MIT",
        "l": "license"
      }
    ]
  },
  "jellyfin-mcp": {
    "kind": "ctrl",
    "value": "Operating a Jellyfin server means dashboard-hopping: click into Sessions to see who is watching, click into another pane to pause a stream, click again to scan a library. jellyctrl hands your agent a typed control surface over stdio so \"pause whatever is playing in the living room\" or \"scan the Movies library\" becomes one tool call, with every destructive action gated behind explicit confirmation.",
    "meta": [
      "56 tools",
      "read + write",
      "confirm-gated writes",
      "stdio",
      "Node 20+",
      "MIT"
    ],
    "what": "Point any MCP client at jellyctrl (published to npm as jellyfin-mcp) and your Jellyfin media server becomes tools an agent can call: list active sessions, pause or cast a stream, scan a library, prune Continue Watching, run a scheduled task, or manage users, all as schema-validated tool calls instead of raw REST or dashboard clicks. It exists because inspecting and operating a running media server from a shell, cron, CI, or an agent is faster than clicking through the web UI, and because an agent can chain those steps end to end. Unlike a generic HTTP tool or a hand-written script, jellyctrl exposes 56 typed tools split into read-only discovery and reporting versus write operations, with every destructive or privileged call gated behind a confirm: true flag and a destructiveHint annotation so clients can route it to human approval. The same core also ships a jellyctrl CLI for the read and report commands, so shells and cron share one config with the MCP surface.",
    "proof": {
      "type": "session",
      "label": "representative session · claude + jellyctrl",
      "turns": [
        {
          "ask": "What is playing on Jellyfin right now, and pause whatever is on in the living room."
        },
        {
          "call": "jellyfin_list_sessions{ activeOnly: true }"
        },
        {
          "ret": "2 active\nLiving Room TV   Blade Runner 2049   01:12:40 / 02:43:00   playing   192.0.2.24\nOffice Laptop    The Expanse S3E5    00:18:02 / 00:52:11   playing   192.0.2.31"
        },
        {
          "call": "jellyfin_pause_session{ sessionId: \"a4f1c9\" }"
        },
        {
          "ret": "ok   Living Room TV   paused at 01:12:40"
        },
        {
          "say": "Living Room TV was on Blade Runner 2049 at 1:12:40. Paused it. The Office Laptop is still playing The Expanse; leaving that one alone."
        }
      ],
      "caption": "Representative session. Illustrative values, RFC 5737 addresses. Destructive and bulk actions require confirm: true; the tool talks HTTP to your server only."
    },
    "capabilities": {
      "title": "56 tools across the server",
      "groups": [
        {
          "name": "System & libraries",
          "count": "5 tools",
          "desc": "Server status and update check; list virtual folders; trigger a scan; restart or shutdown (confirm-gated)."
        },
        {
          "name": "Sessions & playback",
          "count": "18 tools",
          "desc": "List active clients; pause, resume, stop, seek, skip, volume, mute, audio and subtitle streams, cast, and bulk controls."
        },
        {
          "name": "User data & discovery",
          "count": "11 tools",
          "desc": "Mark played, favorites, watch history, resume queue, next-up per series, similar items, and Continue Watching clears."
        },
        {
          "name": "Items, playlists & collections",
          "count": "11 tools",
          "desc": "Search and fetch item metadata; create, list, and edit playlists and collections."
        },
        {
          "name": "Users & Quick Connect",
          "count": "7 tools",
          "desc": "List, create, delete, disable, and reset users; check and authorize Quick Connect login codes."
        },
        {
          "name": "Tasks & activity",
          "count": "3 tools",
          "desc": "List and run scheduled tasks; query the recent server activity log."
        }
      ],
      "refHref": "https://github.com/lidless-labs/jellyctrl#tools"
    },
    "setup": {
      "install": "npm i -g jellyfin-mcp",
      "env": "Configure with JELLYFIN_URL and JELLYFIN_API_KEY (Dashboard > API Keys). Optional: JELLYFIN_TIMEOUT (default 30s), JELLYFIN_VERIFY_SSL.",
      "configLabel": "MCP client config",
      "config": "{ \"mcpServers\": { \"jellyfin\": { \"command\": \"npx\", \"args\": [\"-y\", \"jellyfin-mcp\"], \"env\": { \"JELLYFIN_URL\": \"http://192.0.2.10:8096\", \"JELLYFIN_API_KEY\": \"your-api-key-here\" } } } }"
    },
    "safety": "Discovery and reporting tools are read-only; every destructive or privileged operation (restart, shutdown, delete_user, set_user_password, Quick Connect authorize, Continue Watching clears, bulk session controls, resume-position writes) requires an explicit confirm: true flag plus a destructiveHint annotation, so clients can route it to human approval. Upstream Jellyfin error responses are summarized to status only before returning to the model; the full body is logged to stderr for operators, so internal server detail is not surfaced to the agent.",
    "specs": [
      {
        "n": "56",
        "l": "MCP tools"
      },
      {
        "n": "confirm",
        "l": "gated writes"
      },
      {
        "n": "stdio",
        "l": "transport"
      },
      {
        "n": "MIT",
        "l": "license"
      }
    ]
  },
  "eero-cli": {
    "kind": "cli",
    "value": "Your eero mesh only bends to a phone app, so blocking a device or fencing a kid's TV means tapping through screens you cannot script. eero-cli hands the network to your shell: non-interactive SMS auth, filtered device listing, profiles and schedules, and single or bulk blocking, all runnable from a terminal or an agent.",
    "meta": [
      "11 commands",
      "Python 3.12+",
      "--json reads",
      "read-only status",
      "wraps eero-api",
      "MIT"
    ],
    "what": "eero-cli is a small terminal CLI for managing devices on an eero mesh network from a real shell instead of the mobile app. It exists because eero ships no public API and no desktop control surface, so any scripted or agent-driven network task means tapping through a phone. It differs from the raw reverse-engineered libraries by adding a two-step, non-interactive SMS or email auth flow that survives across separate shell invocations, regex and MAC-prefix device filtering, profile and schedule management, single and bulk blocking, and honest documentation of the operations eero's backend silently refuses. It wraps eero-api, the most actively maintained reverse-engineered Python client, and every read command supports --json for scripting.",
    "capabilities": {
      "title": "11 commands across four groups",
      "groups": [
        {
          "name": "Auth",
          "count": "1 command",
          "desc": "Two-step non-interactive SMS or email login; token written to ~/.config/eero/session.json at mode 0600."
        },
        {
          "name": "Devices",
          "count": "3 commands",
          "desc": "List, rename, and filter devices by regex, MAC prefix, or online/offline state, with --json output."
        },
        {
          "name": "Blocking",
          "count": "2 commands",
          "desc": "Block or unblock a single device, or bulk-block matching offline devices with block-cleanup."
        },
        {
          "name": "Profiles",
          "count": "5 commands",
          "desc": "Create profiles, assign devices, set bedtime pause schedules, and block apps at the profile level."
        },
        {
          "name": "Status",
          "count": "read-only",
          "desc": "eero status reports auth state, account, and visible networks; --json exits 1 when signed out."
        }
      ],
      "refHref": "https://github.com/lidless-labs/eero-cli#commands"
    },
    "setup": {
      "install": "pipx install git+https://github.com/lidless-labs/eero-cli",
      "env": "No env vars. Session token is stored at ~/.config/eero/session.json (mode 0600); re-run eero auth to reset. Requires Python 3.12+."
    },
    "safety": "Destructive commands refuse to guess when a name or MAC matches more than one device, so a fuzzy match never blocks the wrong host. block-cleanup defaults to offline-only, skips already-blocked devices, and prompts before acting unless you pass -y. eero status and every --json read are strictly read-only. The README documents, verified end-to-end, that eero's backend exposes no working way to delete an offline device, so the CLI never pretends to.",
    "specs": [
      {
        "n": "11",
        "l": "commands"
      },
      {
        "n": "Py 3.12+",
        "l": "runtime"
      },
      {
        "n": "1",
        "l": "read-only status"
      },
      {
        "n": "MIT",
        "l": "license"
      }
    ],
    "proof": {
      "type": "session",
      "label": "representative session · shell + eero-cli",
      "turns": [
        {
          "ask": "I just swapped my router shelf around. Which devices are offline junk starting bc:24, and clear them out."
        },
        {
          "call": "eero devices --mac 'BC:24' --offline --json"
        },
        {
          "ret": "[\n  {\"name\":\"bc2411-old-ap\",\"mac\":\"BC:24:11:AA:03:19\",\"ip\":\"192.0.2.44\",\"online\":false},\n  {\"name\":\"bc2411-test-plug\",\"mac\":\"BC:24:11:AA:07:5C\",\"ip\":\"192.0.2.61\",\"online\":false}\n]"
        },
        {
          "call": "eero block-cleanup '^bc24' -y"
        },
        {
          "ret": "matched 2 offline devices, skipped 0 already blocked\nblocked bc2411-old-ap\nblocked bc2411-test-plug"
        },
        {
          "say": "Two stale bc:24 devices, both offline, now blocked. Heads up: eero has no working forget-device API, so these stay listed until you tap Forget in the app or eero auto-culls them after ~30 days."
        }
      ],
      "caption": "Representative session. Illustrative values, RFC 5737 addresses. Your session token stays on the box."
    }
  },
  "soc-stack": {
    "kind": "app",
    "value": "You want a real SOC to train on, test detections against, or run as a homelab, but wiring Wazuh, TheHive, Cortex, MISP, Zeek, and Suricata together by hand eats days and breaks on the next rebuild. soc-stack is one curl command on a Proxmox host that stands up all six in dedicated LXCs, cross-wired, in about 30 minutes.",
    "meta": [
      "6 components",
      "9 MCP servers",
      "5 cross-wirings",
      "~30m deploy",
      "Proxmox LXC",
      "MIT"
    ],
    "what": "soc-stack is a one-command, self-hosted SOC lab builder: run one curl on a Proxmox VE host and roughly 30 minutes later you have Wazuh (SIEM/XDR), TheHive + Cortex (case management + SOAR), MISP (threat intel), Zeek + Suricata (NSM + IDS), dashboards, and 9 MCP servers, each in its own unprivileged LXC and already wired to its peers. It exists because assembling six upstream tools plus the integrations between them (alert forwarding, analyzer wiring, IOC feeds, log shipping) is a multi-day project that has to be redone every rebuild. It differs from a single all-in-one SIEM appliance by treating the whole stack as one declarative, idempotent, agent-friendly deploy: components are the real upstream projects at pinned versions (not a fork), each lives in its own snapshot-able LXC, the run is non-interactive with structured JSON output, and state files (not a state backend) drive idempotent re-runs.",
    "proof": {
      "type": "session",
      "label": "representative session · agent SSHed into a Proxmox host",
      "turns": [
        {
          "ask": "Stand up the full SOC lab on this Proxmox box, minimal preset, and give me back machine-readable results."
        },
        {
          "call": "curl -sSL .../install.sh | sudo bash -s -- --components all --preset minimal --ip-mode dhcp --json-out /root/soc-stack.json --mcp-config-out /root/mcp-clients.json"
        },
        {
          "ret": "[preflight] Proxmox VE 8.2 · bridge vmbr0 · storage local-lvm  ok\n[wazuh]          LXC 9001  192.0.2.11   deployed  verify ok\n[thehive-cortex] LXC 9002  192.0.2.12   deployed  verify ok\n[misp]           LXC 9003  192.0.2.13   deployed  verify ok\n[zeek-suricata]  LXC 9004  192.0.2.14   deployed  verify ok\n[dashboards]     LXC 9005  192.0.2.15   deployed  verify ok\n[mcp]            LXC 9006  192.0.2.16   deployed  verify ok\n[integrate] wazuh->thehive  misp->suricata  zeek->wazuh  thehive<->cortex  mcp<-peers  5/5 wired\n[done] 6/6 components  exit 0  -> /root/soc-stack.json  /root/mcp-clients.json"
        },
        {
          "say": "Full stack is green in one pass: 6 LXCs deployed and verified, all 5 cross-component integrations wired, exit 0. soc-stack.json has every VMID, IP, and endpoint (secrets redacted), and mcp-clients.json is a paste-ready mcpServers block for all 9 security tools."
        }
      ],
      "caption": "Representative full-stack run. Illustrative values, RFC 5737 addresses. Everything is self-hosted on hardware you control; no telemetry, no phone-home."
    },
    "capabilities": {
      "title": "Six components, each in its own LXC",
      "groups": [
        {
          "name": "Wazuh",
          "count": "SIEM / XDR",
          "desc": "Manager, Indexer, Dashboard for alerting, FIM, vulnerability detection, and agent management."
        },
        {
          "name": "TheHive + Cortex",
          "count": "case + SOAR",
          "desc": "Case management with Cortex analyzers and responders for observable enrichment."
        },
        {
          "name": "MISP",
          "count": "threat intel",
          "desc": "IOC sharing, feeds, and correlation, feeding Suricata rules on an hourly pull."
        },
        {
          "name": "Zeek + Suricata",
          "count": "NSM + IDS/IPS",
          "desc": "Network security monitoring and intrusion detection, shipping logs into Wazuh."
        },
        {
          "name": "Dashboards",
          "count": "Bro Hunter + Playbook Forge",
          "desc": "Custom hunt and playbook dashboards served behind nginx."
        },
        {
          "name": "MCP servers",
          "count": "9 servers",
          "desc": "Wazuh, TheHive, Cortex, MISP, Zeek, Suricata, MITRE ATT&CK, Rapid7, and Sophos exposed to any MCP client over SSE via mcp-proxy."
        }
      ],
      "refHref": "https://github.com/lidless-labs/soc-stack"
    },
    "setup": {
      "install": "curl -sSL https://raw.githubusercontent.com/solomonneas/soc-stack/main/install.sh | sudo bash",
      "env": "Run as root on a Proxmox VE 7/8/9 host with a bridge (default vmbr0) and storage pool; needs ~12 GB free RAM and ~150 GB disk for the full stack at minimal preset. Tune with --components, --preset, --bridge, --storage, --ip-mode, and --manifest.",
      "configLabel": "agent-driven run",
      "config": "curl -sSL .../install.sh | sudo bash -s -- \\\n  --components all --preset minimal \\\n  --ip-mode dhcp \\\n  --json-out /root/soc-stack.json \\\n  --mcp-config-out /root/mcp-clients.json"
    },
    "safety": "Non-interactive and idempotent: re-running with the same flags skips anything already deployed, and exit codes are stable (0 success, 1 preflight, 2 validation, 3 component failed, 4 integration failed, 5 mixed state). Generated credentials are rotated on deploy and stored root-only at mode 0600, result JSON is redacted unless you pass --include-secrets-json, and the 9 MCP servers bind to localhost unless you pass --mcp-bind-host 0.0.0.0. It is a lab tool that assumes a trusted host and internal bridge, not a hardened multi-tenant production SOC; the threat model lives in SECURITY.md.",
    "specs": [
      {
        "n": "6",
        "l": "components"
      },
      {
        "n": "9",
        "l": "MCP servers"
      },
      {
        "n": "5",
        "l": "cross-wirings"
      },
      {
        "n": "~30m",
        "l": "full deploy"
      },
      {
        "n": "MIT",
        "l": "license"
      }
    ]
  },
  "hotwash": {
    "kind": "app",
    "value": "A Wazuh alert fires at 3am and your IR playbook is a Markdown doc nobody executes, so steps get skipped and the ticket is a guess. Hotwash makes the same playbook a live, audited run that an analyst and an AI agent can both drive step by step.",
    "meta": [
      "10 MCP tools",
      "React + FastAPI",
      "Wazuh ingest",
      "confirm-gated",
      "self-hosted",
      "MIT"
    ],
    "what": "Hotwash is a self-hosted incident-response runbook tool that parses structured Markdown or Mermaid playbooks into an interactive React Flow graph and runs them on a real FastAPI execution engine, so a SOC analyst builds a runbook once and then executes it against a live incident with per-step status, timestamps, assignees, decisions, and attached evidence. It matters because a playbook in a wiki is read-only prose that someone re-types into a ticket, while every Hotwash run is queryable state and an audit trail. What sets it apart is that the same run is drivable by an LLM: the bundled hotwash-mcp Model Context Protocol server exposes the engine as tools, and a Wazuh ingest path turns alerts into an auto-started run or a human-review suggestion, so the design is human-and-agent-in-the-loop rather than a static diagram or a black-box SOAR.",
    "proof": {
      "type": "session",
      "label": "representative session · claude + hotwash-mcp",
      "turns": [
        {
          "ask": "A Wazuh alert flagged repeated SSH auth failures on web-01. Start our brute-force runbook against it and isolate the host."
        },
        {
          "call": "hotwash_list_playbooks{ search: \"brute force\", category: \"Incident Response\" }"
        },
        {
          "ret": "1 playbook\nir-ssh-bruteforce   SSH Brute Force Response   IR   14 nodes"
        },
        {
          "call": "hotwash_start_run{ playbook_id: \"ir-ssh-bruteforce\", incident: \"web-01 SSH auth failures (198.51.100.7)\" }"
        },
        {
          "ret": "execution e-4192 started   step 1/9 Detection: confirm source IP   status active"
        },
        {
          "call": "hotwash_advance_step{ execution_id: \"e-4192\", step: \"containment.isolate\", status: \"done\", note: \"isolate_host web-01, source 198.51.100.7\" }"
        },
        {
          "ret": "step 4/9 Containment: isolate host -> done   run 44% complete"
        },
        {
          "say": "Run e-4192 is live against web-01 and the isolate step is recorded. Next open step is evidence collection. I have not cancelled anything, so the full timeline stays in the audit log."
        }
      ],
      "caption": "Representative session. Illustrative values, RFC 5737 addresses. Runs stay on your self-hosted backend; destructive tools require confirm: true."
    },
    "capabilities": {
      "title": "10 MCP tools plus the run engine",
      "groups": [
        {
          "name": "Playbooks",
          "count": "2 tools",
          "desc": "List the library with category/tag/search filters and fetch one playbook's full node-edge graph."
        },
        {
          "name": "Runs",
          "count": "3 tools",
          "desc": "Start a run against an incident, query live step state and timeline, and advance a single step (status, assignee, note, decision)."
        },
        {
          "name": "Suggestion queue",
          "count": "3 tools",
          "desc": "List, accept, or dismiss Wazuh ingest suggestions from mode=suggest mappings; accept and dismiss are confirm-gated."
        },
        {
          "name": "Artifacts & lifecycle",
          "count": "2 tools",
          "desc": "Attach a text or base64 artifact to a step, and cancel a run into the audit log (confirm-gated)."
        },
        {
          "name": "Authoring & canvas",
          "desc": "Parse Markdown/Mermaid into Phase, Step, Decision, Execute, and Merge nodes on an interactive React Flow canvas with 5 themes."
        },
        {
          "name": "Wazuh ingest & SOAR",
          "desc": "HMAC-authenticated alert webhook with auto/suggest/log mappings, plus a template action library (isolate_host, block_ioc, and friends; TheHive live)."
        }
      ],
      "refHref": "https://github.com/lidless-labs/hotwash#tools"
    },
    "setup": {
      "install": "npx -y hotwash-mcp   # points at a running Hotwash backend; web app runs from source (npm run dev + uvicorn)",
      "env": "MCP server reads HOTWASH_URL (default http://localhost:8000), optional HOTWASH_API_KEY, and HOTWASH_TIMEOUT (default 30s).",
      "configLabel": "MCP client config",
      "config": "{ \"mcpServers\": { \"hotwash\": { \"command\": \"npx\", \"args\": [\"-y\", \"hotwash-mcp\"], \"env\": { \"HOTWASH_URL\": \"http://localhost:8000\" } } } }"
    },
    "safety": "Self-hosted: runs live on your own FastAPI backend, nothing leaves the box. The three destructive MCP tools (cancel_run, accept_suggestion, dismiss_suggestion) refuse to act unless the caller passes confirm: true, so an agent cannot abandon a run or burn the suggestion queue by accident. Wazuh mode=suggest mappings route to a human-review queue by design, and the ingest webhook is HMAC-authenticated.",
    "specs": [
      {
        "n": "10",
        "l": "MCP tools"
      },
      {
        "n": "3",
        "l": "confirm-gated writes"
      },
      {
        "n": "5",
        "l": "node types"
      },
      {
        "n": "self-hosted",
        "l": "local-first"
      },
      {
        "n": "MIT",
        "l": "license"
      }
    ]
  },
  "cyberbrief": {
    "kind": "app",
    "value": "A pile of threat data and a two-hour deadline to turn it into something a director will actually read. CyberBRIEF turns URLs, pasted text, and PDFs into an executive-grade BLUF report with MITRE ATT&CK mapping, extracted IOCs, TLP banners, and Chicago citations, all in one exportable package.",
    "meta": [
      "web app",
      "3 research tiers",
      "MITRE ATT&CK",
      "self-hosted",
      "Python 3.10+ / Node",
      "MIT"
    ],
    "what": "CyberBRIEF is a self-hosted web app that transforms raw threat data into structured cyber threat intelligence reports: a BLUF executive summary, MITRE ATT&CK technique mapping with Navigator layer export, automatically parsed IOCs (IPs, domains, hashes, CVEs, URLs), threat-actor profiles with confidence assessments, TLP classification, and academic citations. It exists because the alternative is a generic chatbot session that loses report structure, source provenance, and ATT&CK coverage the moment you copy the answer out. Unlike that workflow, CyberBRIEF keeps everything in one exportable Markdown or HTML package and lets you pick the research depth: Free (Brave Search + Gemini Flash, no API cost), Standard (Perplexity Sonar), or Deep (Perplexity Deep Research). The frontend is React 18 + TypeScript + Vite with Zustand state, the backend is a FastAPI service on Python 3.10+, and reports persist to SQLite.",
    "capabilities": {
      "title": "What it produces",
      "groups": [
        {
          "name": "Three research tiers",
          "count": "3 tiers",
          "desc": "Free (Brave + Gemini Flash), Standard (Perplexity Sonar), and Deep (Perplexity Deep Research)."
        },
        {
          "name": "BLUF reports",
          "count": "",
          "desc": "Bottom-Line-Up-Front executive summaries that lead with the conclusion, with TLP banners on every report."
        },
        {
          "name": "MITRE ATT&CK mapping",
          "count": "",
          "desc": "Automatic technique identification with ATT&CK Navigator layer export."
        },
        {
          "name": "IOC extraction",
          "count": "5 types",
          "desc": "IPs, domains, file hashes, CVEs, and URLs parsed automatically from sources."
        },
        {
          "name": "Threat-actor profiling",
          "count": "",
          "desc": "Rich actor profiles with confidence assessments and Chicago Notes-Bibliography citations."
        },
        {
          "name": "Flexible input & export",
          "count": "",
          "desc": "Feed URLs, raw text, or PDFs; export finished reports to Markdown or HTML."
        }
      ],
      "refHref": "https://github.com/lidless-labs/cyberbrief"
    },
    "setup": {
      "install": "git clone https://github.com/lidless-labs/cyberbrief.git && cd cyberbrief",
      "env": "Set API keys for Brave Search, Gemini, and Perplexity per docs/CONFIGURATION.md; the Free tier runs on Brave + Gemini Flash keys only.",
      "configLabel": "Run from source",
      "config": "# backend\npip install -r backend/requirements.txt\n(cd backend && uvicorn main:app --reload --port 8000)\n\n# frontend -> http://localhost:5188\ncd frontend && npm install && npm run dev"
    },
    "specs": [
      {
        "n": "3",
        "l": "research tiers"
      },
      {
        "n": "ATT&CK",
        "l": "technique mapping"
      },
      {
        "n": "MD / HTML",
        "l": "export formats"
      },
      {
        "n": "MIT",
        "l": "license"
      }
    ],
    "proof": {
      "type": "none"
    }
  },
  "intel-workbench": {
    "kind": "app",
    "value": "When you already favor a suspect, every new indicator reads like confirmation and the analysis quietly becomes a defense of your first guess. Intel Workbench runs Analysis of Competing Hypotheses in the browser: score each piece of evidence against every hypothesis, let inconsistency (not agreement) pick the winner, and tag it all to MITRE ATT&CK before you write the estimate.",
    "meta": [
      "ACH matrix",
      "691 ATT&CK techniques",
      "12-bias checklist",
      "ICD 203 bands",
      "offline-first",
      "no backend",
      "MIT"
    ],
    "proof": {
      "type": "none"
    },
    "what": "Intel Workbench is an offline-first browser workbench that puts the Analysis of Competing Hypotheses structured analytic technique in front of a CTI analyst: an evidence-vs-hypothesis matrix where each cell is rated Consistent, Inconsistent, Neutral, or Not Applicable, and the hypothesis with the fewest weighted inconsistencies is flagged as preferred. It exists because the discipline that separates real intelligence work from a hunch, disprove rather than prove, plus explicit bias review and calibrated estimative language, usually lives in a PDF primer instead of the tool you actually work in. It differs from a note-taking or ticketing setup by being a single-page React app with no backend at all: state persists to localStorage under intel-workbench-projects, MITRE ATT&CK is vendored locally so tagging works with the network off, and a finished assessment exports to JSON for backup or Markdown for the report, with ATT&CK technique IDs carried through.",
    "capabilities": {
      "title": "The analyst's desk, in five parts",
      "groups": [
        {
          "name": "ACH matrix & scoring",
          "count": "core",
          "desc": "Interactive evidence-vs-hypothesis grid with C/I/N/NA ratings, weighted inconsistency scoring, and automatic preferred-hypothesis identification (lowest score wins)."
        },
        {
          "name": "MITRE ATT&CK tagging",
          "count": "691 techniques",
          "desc": "Tag evidence and hypotheses against the vendored Enterprise matrix (691 techniques, 14 tactics); search by ID, name, or tactic, offline."
        },
        {
          "name": "Cognitive bias checklist",
          "count": "12 biases",
          "desc": "Heuer & Pherson taxonomy across Cognitive, Analytical, and Social categories with per-bias mitigation notes."
        },
        {
          "name": "Estimative language & weighting",
          "count": "ICD 203",
          "desc": "Pick a likelihood band from 'almost no chance' to 'almost certainly' with canonical ODNI ranges; credibility and relevance ratings (High/Medium/Low) feed the weighted scores."
        },
        {
          "name": "Export & onboarding",
          "count": "JSON / Markdown",
          "desc": "Full JSON export/import for backup and sharing, Markdown export with ATT&CK IDs for reports, plus a driver.js guided tour and in-app methodology docs."
        }
      ],
      "refHref": "https://github.com/lidless-labs/intel-workbench"
    },
    "setup": {
      "install": "git clone https://github.com/lidless-labs/intel-workbench.git && cd intel-workbench && npm install && npm run dev",
      "env": "Node.js 18+ and npm 9+. No backend, no API keys; the dev server runs at http://localhost:5173. A hosted build is live at intel-workbench.vercel.app.",
      "configLabel": "Production build",
      "config": "npm run build && npm run preview"
    },
    "safety": "Offline-first and backend-free by design: all project state lives in browser localStorage under intel-workbench-projects and never leaves the machine, the MITRE ATT&CK dataset is vendored locally rather than fetched at runtime, and export/import is the only data movement, on explicit user action.",
    "specs": [
      {
        "n": "C/I/N/NA",
        "l": "ACH rating scale"
      },
      {
        "n": "691",
        "l": "ATT&CK techniques"
      },
      {
        "n": "12",
        "l": "cognitive biases"
      },
      {
        "n": "0",
        "l": "backend services"
      },
      {
        "n": "MIT",
        "l": "license"
      }
    ]
  },
  "proxguard": {
    "kind": "app",
    "value": "You suspect your Proxmox host is soft in a few places, but \"run the CIS Benchmark by hand\" never happens. ProxGuard takes your actual config files, grades your posture A-to-F against 16 CIS-backed rules, and hands back a copy-paste fix for every failure.",
    "meta": [
      "16 CIS-backed rules",
      "6 scored categories",
      "browser-only",
      "no data leaves the box",
      "TypeScript 5",
      "MIT"
    ],
    "what": "ProxGuard is a browser-based Proxmox VE security auditor: you paste your real config files (sshd_config, cluster.fw, user.cfg, storage.cfg, and the API token list) and it grades your security posture across six weighted categories, then generates a remediation script for every failed check. It exists because Proxmox hosts drift toward insecure defaults (root SSH, ACCEPT firewall policy, no 2FA) and nobody hand-walks the CIS Benchmark. What sets it apart: every rule traces to a CIS Debian 11 or Proxmox-specific standard, the whole audit runs client-side so no config ever leaves your machine, and it doubles as a firewall visualizer that flags shadowing, contradictions, and unreachable rules before they bite.",
    "proof": {
      "type": "none"
    },
    "capabilities": {
      "title": "16 rules across 6 scored categories",
      "groups": [
        {
          "name": "SSH hardening",
          "count": "4 rules",
          "desc": "Root login, global password auth, default port 22, MaxAuthTries. Weighted 25%."
        },
        {
          "name": "Firewall",
          "count": "3 rules",
          "desc": "Cluster firewall enabled, default INPUT policy, rule existence. Weighted 25%."
        },
        {
          "name": "Authentication",
          "count": "3 rules",
          "desc": "2FA enrollment, root API tokens, overpermissive Administrator roles. Weighted 20%."
        },
        {
          "name": "Container",
          "count": "2 rules",
          "desc": "Privileged LXC containers and container nesting. Weighted 15%."
        },
        {
          "name": "Storage",
          "count": "2 rules",
          "desc": "NFS no_root_squash mounts and broad CIFS permissions. Weighted 10%."
        },
        {
          "name": "API tokens",
          "count": "2 rules",
          "desc": "Full-admin token privileges and tokens without expiration. Weighted 5%."
        },
        {
          "name": "Firewall conflict detection",
          "count": "5 types",
          "desc": "Shadowing, contradictions, unreachable rules, port overlap, protocol mismatch, with drag-drop reordering."
        }
      ],
      "refHref": "https://github.com/lidless-labs/proxguard#how-the-scoring-works"
    },
    "setup": {
      "install": "git clone https://github.com/lidless-labs/proxguard.git && cd proxguard && npm install && npm run dev",
      "env": "No env or backend to configure. Requires Node 20+. Open http://localhost:5190, go to the Audit tab, and paste your Proxmox config files (or load a built-in demo config).",
      "configLabel": "Config files it reads",
      "config": "/etc/ssh/sshd_config\n/etc/pve/firewall/cluster.fw\n/etc/pve/user.cfg\n/etc/pve/storage.cfg\npveum apitoken list"
    },
    "safety": "Everything runs client-side in the browser. Pasted config files are parsed in-page and never sent to any server, so credentials, firewall layouts, and token lists stay on your machine. The tool is read-only: it grades and generates remediation scripts for you to run yourself, it never touches or writes to the Proxmox host.",
    "specs": [
      {
        "n": "16",
        "l": "CIS-backed rules"
      },
      {
        "n": "6",
        "l": "scored categories"
      },
      {
        "n": "5",
        "l": "conflict types"
      },
      {
        "n": "0",
        "l": "bytes leave the browser"
      },
      {
        "n": "MIT",
        "l": "license"
      }
    ]
  },
  "watchtower": {
    "kind": "dashboard",
    "value": "During an incident you are tab-hopping between the LibreNMS UI, the Proxmox console, and a Grafana tab, rebuilding the same picture every time. Watchtower folds device status, topology, interface load, VM health, and the alert feed into one live console that already knows what a homelab operator wants to see.",
    "meta": [
      "self-hosted",
      "LibreNMS + Proxmox",
      "WebSocket live",
      "React 18 + FastAPI",
      "Python 3.12 / Node 20+",
      "MIT"
    ],
    "proof": {
      "type": "none"
    },
    "what": "Watchtower is a self-hosted Network Operations Center dashboard for homelab and small-network operators. It exists because the raw LibreNMS UI is built for engineers who live in it and Grafana makes you hand-wire every panel and query before you see a single device, so Watchtower is the opinionated middle: one console that ships with the NOC view already assembled. It reads LibreNMS and Proxmox through their APIs on a schedule, caches current state in Redis, stores history in InfluxDB, and pushes changes to the browser over WebSockets so device status, interface graphs, topology, and alerts stay current without a page refresh. The frontend is React 18 and TypeScript; the backend is a FastAPI service on Python 3.12 with APScheduler driving the polling loop. It is a read-and-present layer on top of your existing stack, not an SNMP poller or a VM manager, and it runs entirely on a machine you control. It is a work in progress, run from source, and not published to any package registry.",
    "capabilities": {
      "title": "What it watches",
      "groups": [
        {
          "name": "Devices & topology",
          "count": "3 views",
          "desc": "Real-time up / down / degraded status, an interactive React Flow map with link and port detail, and CDP / LLDP auto-discovery from LibreNMS."
        },
        {
          "name": "Interfaces & traffic",
          "count": "3 views",
          "desc": "Per-interface bandwidth, errors, and traffic graphs, port groups aggregated by description, and scheduled WAN speedtests with history."
        },
        {
          "name": "Alerts & notifications",
          "count": "2 systems",
          "desc": "Critical / warning / info feed with an acknowledgment workflow, routed to Discord, Pushover, or email on configurable thresholds."
        },
        {
          "name": "Proxmox & history",
          "count": "2 sources",
          "desc": "VM / LXC status, resource usage, and node health from Proxmox, plus InfluxDB time-series history with configurable retention."
        },
        {
          "name": "Administration",
          "count": "3 controls",
          "desc": "Web settings UI for integrations and thresholds, JWT auth with role-based permissions, and admin user management."
        }
      ],
      "refHref": "https://github.com/lidless-labs/watchtower"
    },
    "setup": {
      "install": "git clone https://github.com/lidless-labs/watchtower.git && cd watchtower",
      "env": "Docker Compose brings up Redis and InfluxDB (set WATCHTOWER_INFLUXDB_PASSWORD and WATCHTOWER_INFLUXDB_ADMIN_TOKEN first). Point config/config.yaml at your LibreNMS and Proxmox instances.",
      "configLabel": "config/config.yaml",
      "config": "data_sources:\n  librenms:\n    url: \"http://librenms.example.internal\"\n    api_key: \"<your-librenms-api-key>\"\n  proxmox:\n    url: \"https://proxmox.example.internal:8006\"\n    token_id: \"watchtower@pam!monitoring\"\n    token_secret: \"<your-token-secret>\""
    },
    "safety": "Self-hosted and local-only: everything runs on a machine you control, with no hosted SaaS and nothing leaving the box. It is a read-and-present layer over LibreNMS and Proxmox, so it does not poll SNMP or manage VMs itself. Access is gated by JWT authentication with role-based permissions, and integration credentials live in your own config file.",
    "specs": [
      {
        "n": "10",
        "l": "watch capabilities"
      },
      {
        "n": "2",
        "l": "data sources (LibreNMS + Proxmox)"
      },
      {
        "n": "WS",
        "l": "live updates"
      },
      {
        "n": "self-hosted",
        "l": "local-only"
      },
      {
        "n": "MIT",
        "l": "license"
      }
    ]
  },
};

// CLI tools show a plating terminal-demo SVG (public/demos/<slug>.svg) instead of
// a conversation. Rendered by lidless-plating-demos; overrides the proof here.
const DEMOS: Record<string, { alt: string; caption: string }> = {
  "eero-cli": { alt: "Recording: terminal session using the eero CLI to sign in via two-step SMS code, list offline mesh devices in a table, and bulk-block devices whose MAC starts with bc24 using block-cleanup.", caption: "eero block-cleanup '^bc24' -y bulk-blocks 3 matching offline devices (1 already-blocked skipped) after two-step SMS auth." },
  "librenms-mcp": { alt: "Recording: an operator running librenmsctrl against a LibreNMS instance. After exporting LIBRENMS_URL and a redacted token, librenmsctrl status reports 48 devices (3 down) and 4 active alerts, devices list --type down lists three down devices, alerts list --state 1 shows four active alerts with a note that writes are confirm-gated, and ports health --metric errors_in --limit 5 ranks ports by inbound errors.", caption: "librenmsctrl status into alerts list --state 1 and ports health, reading a monitored LibreNMS network read-only with writes gated." },
  "n8n-ops-mcp": { alt: "Recording: a terminal running n8nctrl, the operator CLI for n8n, listing three errored executions from the last 24 hours, searching them for ECONNREFUSED and matching one, fetching the failing execution's per-node run log showing a connect ECONNREFUSED to 192.0.2.44 in the httpRequest node, then running a security audit that returns two medium-risk findings across five categories.", caption: "n8nctrl executions list --status error --since 24 triages the day's failed runs, then search, get, and audit run trace one ECONNREFUSED to its node and surface two security findings." },
  "adguard-mcp": { alt: "Recording: an operator running adguardctrl in a terminal, status shows protection ENABLED across 6 filter lists, stats reports 23.2% of 84k queries blocked, check-host confirms youtube.com is FILTERED for the kid-tablet client via a matched blocklist rule, and sync health reports OK.", caption: "adguardctrl check-host youtube.com --client kid-tablet returns FILTERED with the matched Family blocklist rule, alongside network-wide status, stats, and sync health." },
  "immich-mcp": { alt: "Recording: an immichctrl terminal session connecting to an Immich server, printing library stats (48,231 photos, 3,904 videos), running a CLIP smart search for \"sunset over the ocean\" with scored matches, then auditing duplicates to show 37 groups and 8.9 GB reclaimable as a dry run.", caption: "immichctrl duplicates audits the library and surfaces 37 duplicate groups reclaiming 8.9 GB as a dry run." },
  "jellyfin-mcp": { alt: "Recording: an operator runs jellyctrl against a Jellyfin server: jellyctrl status prints server info, sessions --active-only lists three active clients and what they're playing, libraries lists four media libraries, and a search for \"blade runner\" returns two movies.", caption: "jellyctrl sessions --active-only surfaces who's watching what across every Jellyfin client, no dashboard hopping." },
  "soc-stack": { alt: "Recording: a terminal running soc-stack's one-command Proxmox installer. It dry-runs a six-component plan, then deploys wazuh, thehive-cortex, misp, zeek-suricata, dashboards, and mcp into their own LXCs (VMIDs 9001-9006, IPs 192.0.2.11-16), wires four cross-component integrations, and finishes with all components deployed and a jq summary of the result JSON.", caption: "sudo bash install.sh --components all stands up the full Wazuh/TheHive/Cortex/MISP/Zeek/Suricata SOC across six LXCs and wires every integration green in one non-interactive run." },
};
for (const [slug, d] of Object.entries(DEMOS)) {
  if (PAGES[slug]) PAGES[slug].proof = { type: "screenshot", src: `/demos/${slug}.svg`, alt: d.alt, caption: d.caption };
}
