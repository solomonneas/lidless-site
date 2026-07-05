# lidless.dev update note: operator CLIs (control CLIs / tools) rollout

> Naming updated 2026-06-29: dropped "toolkit". Umbrella word is **"tools"**; per-product descriptor is **"control CLI"** (the `*ctl` ones) or **"search tool"** (the verb ones). Commands: `*ctl` for control, verbs for search.

Date: 2026-06-28
Status: TODO - website copy + pages not yet updated to reflect the new CLIs.

## What changed (in the repos)

The MCP packages are no longer "just MCP servers." Each now ships a shared core + two thin adapters: an MCP server (agent layer) and a read-only operator CLI (operator layer for shells, cron, CI). The product category is **operator toolkit**; the package keeps its name, the CLI is named after the command an operator types (`*ctl` / a verb), and the MCP server is a subcommand (`<cmd> mcp`) with the old `<tool>-mcp` bin kept as a back-compat alias. See the decision card / handoffs (`mcp-cli-toolkit-strategy`, `mcp-fleet-org-migration-state`) for the full rationale.

## Naming model to reflect on the site

- Umbrella word = **"tools"** ("Lidless tools"). Per product: "<X> control CLI" for the `*ctl` ones, "<X> search tool" for the verbs. Do NOT use "toolkit" in copy.
- Commands: `*ctl` for control/ops (adguardctl, librenmsctl, proxmoxctl, n8nctl, wazuhctl, immichctl, ...), verbs for search (code-search, reelgrep, attack, zeeklens, evegrep).
- For each product: name the CLI command, state it is read-only (v1), and that the MCP server is the agent integration of the same core. Old command names (proxops, n8n-ops) stay as aliases - mention the canonical `*ctl` name.
- Never put `-toolkit` / `-tools` / `-ctl` as a package or repo suffix; the command is the bin, not the package.

## Brand split (important)

lidless.dev is the security / SOC / infra brand. Feature the infra + security toolkits here. The dev/media tools (`code-search`, `reelgrep`) belong to the Escoffier/dev brand, NOT lidless.dev - do not list them on lidless.dev.

## CLIs shipped (as of 2026-06-28) - surface these on lidless.dev

| Toolkit | CLI command | Repo | v1 surface |
|---|---|---|---|
| n8n-ops | `n8nctl` (alias `n8n-ops`) | lidless-labs/n8n-ops-mcp | read-only: workflows/executions/credentials/audit |
| AdGuard | `adguardctl` | lidless-labs/adguard-mcp | read-only: status/stats/querylog/rules/rewrites/sync |
| LibreNMS | `librenmsctl` | lidless-labs/librenms-mcp | read-only: devices/ports/alerts/events |
| Proxmox | `proxmoxctl` (alias `proxops`) | lidless-labs/proxmox-mcp | read-only: inventory/configs/storage/backups/snapshots/audit/tasks (live 2026-06-28) |

(Not lidless.dev: `code-search` = escoffier-labs/code-search-mcp; `reelgrep` = solomonneas/reelgrep-mcp.)

## Concrete page/copy changes needed

1. Per-product page/section: change "MCP server" framing to "operator toolkit (MCP + CLI)"; add the CLI command name and a short read-only command example block; note `<cmd> mcp` starts the server and the `<tool>-mcp` bin still works.
2. Add CLI install/usage (e.g. `npx @<scope>/<pkg>@latest <cmd> ...`, or global install then `<cmd>`).
3. If there is a catalog/grid, add a "CLI" badge/column for the toolkits that now have one.
4. Keep "read-only v1" honest in copy: write commands (and Proxmox's gated snapshot/backup/lifecycle ops) are a deliberate later step, not shipped yet.
5. Cross-check the README of each repo as the source of truth for the exact command list (the repos' README `## CLI` sections were updated alongside the code).

## Follow-ups not yet done

- Pending fleet items: `proxops` gated-write v2 (snapshot/backup/lifecycle behind src/gates.ts), and the deferred zeek/suricata log-analysis CLIs.
- The `@solomonneas` -> `escoffier-labs`/`lidless-labs` npm scope migration is still half-done (see `mcp-fleet-org-migration-state`); align any npm install snippets on the site with whatever scope is settled during that migration.
