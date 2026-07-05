# MCP vs CLI Audit

Date: 2026-06-27
Scope: Lidless Labs MCP/tool catalog plus adjacent active repos.

## Audit Rule

Keep MCP when the tool is strongest as agent context: exploratory triage, cross-tool investigation, natural-language query shaping, or multi-step reasoning.

Add a real CLI when the tool is strongest as repeatable operations: cron, CI, scripts, bulk export, deterministic checks, safety-gated admin actions, or commands a human would want to run without opening an AI client.

Most current packages expose a `bin`, but that bin launches the MCP server. It is not a user-facing operator CLI.

## Highest Priority CLI Tracks

### n8n-ops-mcp

Verdict: should be both MCP and CLI.

Why: workflow validation, credential blast-radius checks, schedule/webhook inventory, execution stats, retry queues, and audit output are repeatable operations. These belong in cron, CI, release checks, and incident scripts.

Recommended CLI surface:

- `n8n-ops audit`
- `n8n-ops validate-workflow <file|id>`
- `n8n-ops executions search --status failed --since 24h`
- `n8n-ops credentials blast-radius <credential>`
- `n8n-ops schedules list`

### code-search-mcp

Verdict: should become CLI-first, with MCP as the agent adapter.

Why: search is useful inside agents, but the primitive is a local code-search command. It should be scriptable, pipeable, and easy to use from any shell.

Recommended CLI surface:

- `code-search "query"`
- `code-search --mode hybrid --limit 20 "query"`
- `code-search health`
- `code-search index --summarize`

### reelgrep-mcp

Verdict: should be CLI-first.

Why: media/subtitle search is naturally a command. MCP is useful when an agent is assembling clips or doing research, but the daily utility should be shell-friendly.

Recommended CLI surface:

- `reelgrep search "phrase"`
- `reelgrep subtitles ingest <path>`
- `reelgrep export --format srt|json`

### proxmox-mcp

Verdict: should be both, with the CLI limited to explicit, safety-gated operations.

Why: Proxmox admin work needs repeatability and human-readable dry-runs. MCP is useful for guided operations, but audits, inventory, snapshots, task logs, and controlled lifecycle actions should be scriptable.

Recommended CLI surface:

- `proxops inventory`
- `proxops audit-permissions`
- `proxops task-log <upid>`
- `proxops snapshot create <vmid> --name <name>`
- `proxops backup run <vmid> --dry-run`

### adguard-mcp

Verdict: should be both.

Why: DNS filtering and blocklist management are classic CLI jobs. MCP is useful for natural-language DNS investigation, but rules, rewrites, client lists, and query logs should be easy to inspect and diff from a terminal.

Recommended CLI surface:

- `adguardctl status`
- `adguardctl query-log --domain example.com`
- `adguardctl rewrites list`
- `adguardctl rules add/remove/list`
- `adguardctl filters refresh`

### librenms-mcp

Verdict: should be both.

Why: network monitoring wants quick terminal checks, cron summaries, and alert handling. MCP is still useful for triage narratives across devices and ports.

Recommended CLI surface:

- `librenmsctl status`
- `librenmsctl alerts list --state active`
- `librenmsctl device show <hostname>`
- `librenmsctl port health <device> <port>`
- `librenmsctl maintenance set <device> --until <time>`

## Medium Priority CLI Tracks

### mitre-mcp

Verdict: should be CLI-first for local ATT&CK lookup and export, MCP for mapping inside investigations.

Why: the local cache, technique lookup, Navigator layer generation, and mapping functions are useful outside an AI client.

Recommended CLI surface:

- `attack lookup T1059`
- `attack search "powershell"`
- `attack group APT29 --techniques`
- `attack navigator export --techniques T1059,T1003`

### zeek-mcp and suricata-mcp

Verdict: should be both.

Why: log parsing, PCAP-derived summaries, beaconing checks, JA3 lookups, timelines, and IOC matching are excellent CLI workflows. MCP is useful for investigation chaining and explanation.

Recommended shared CLI surface:

- `zeeklens query conn.log --where ...`
- `zeeklens beaconing dns.log`
- `evegrep alerts eve.json --severity high`
- `evegrep timeline eve.json`
- `evegrep correlate --zeek <dir> --suricata eve.json`

### immich-mcp

Verdict: should be both, but avoid destructive convenience commands until the safety model is boring.

Why: duplicate reports, album maintenance, jobs, backup checks, and metadata exports are terminal-friendly. MCP is better for semantic search and photo-library reasoning.

Recommended CLI surface:

- `immichctl status`
- `immichctl duplicates report`
- `immichctl jobs list`
- `immichctl albums export`

### jellyfin-mcp

Verdict: should be both.

Why: library scans, task state, sessions, user reports, and playlist exports are admin tasks that fit a CLI. MCP remains useful for media-agent workflows.

Recommended CLI surface:

- `jellyctl status`
- `jellyctl libraries scan`
- `jellyctl sessions list`
- `jellyctl users report`

### maltego-mcp

Verdict: should be CLI-adjacent, especially for transforms and graph export.

Why: Maltego's real value is graph production and transforms. MCP is fine for agent-built graphs, but transforms, MTZ generation, and graph conversion should be runnable without an MCP client.

Recommended CLI surface:

- `maltegokit graph create`
- `maltegokit graph expand-domain <domain>`
- `maltegokit mtz build`
- `maltegokit transform test`

## Keep MCP-First

### Wazuh, TheHive, Cortex, and MISP

Verdict: keep MCP-first, add only narrow companion CLIs where automation is obvious.

Why: these are strongest when an agent can pivot between alerts, cases, observables, analyzers, responders, and threat-intel context. A broad CLI would duplicate existing product APIs and dashboards. The useful CLI layer should focus on reports and repeatable checks, not every API operation.

Good companion commands:

- `wazuhctl alerts summary --since 24h`
- `wazuhctl agents stale`
- `thehivectl cases report --open`
- `cortexctl jobs report --failed`
- `mispctl export iocs --event <id>`

## Deprioritize or Archive

### rapid7-mcp, sophos-mcp, and goplaces-mcp

Verdict: keep out of the active Lidless Labs story unless they are revived with real backends, tests, and a clear use case.

Why: prior memory marks Rapid7/Sophos as dropped from the active suite, and GoPlaces is staged/disabled. Do not let these dilute the public catalog.

## Product Direction

The better architecture is shared core plus two adapters:

- `core`: config, clients, schemas, safety gates, output formatters
- `mcp`: thin tool registration around core functions
- `cli`: thin command wrapper around the same core functions

This avoids two codebases and makes the packages easier to trust. MCP should be the agent integration layer. CLI should be the operator layer.

## Suggested Order

1. Build `code-search` CLI first. It is small, clean, and immediately useful.
2. Build `n8n-ops` CLI second. It has the strongest operational value.
3. Build `adguardctl` or `librenmsctl` third. They validate the network-ops pattern.
4. Add `proxops` after the safety gates and dry-run output are polished.
5. Split Zeek/Suricata into shared log-analysis CLI packages only after the first four prove the adapter pattern.

