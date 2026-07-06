// Standalone in the fleet kit: the ActivityEntry shape is inlined so this file
// has no dependency on the @jalco/activity-graph component. A site that also
// installs activity-graph can import ActivityEntry from it instead; the shape
// matches.
export interface ActivityEntry {
  /** ISO date string (YYYY-MM-DD). */
  date: string
  /** Activity count for this date. */
  count: number
}

export interface GitHubContributions {
  total: number
  entries: ActivityEntry[]
}

export interface GitHubRepoData {
  fullName: string
  description: string | null
  language: string | null
  languageColor: string | null
  stars: number
  forks: number
  openIssues: number
  license: string | null
  topics: string[]
  updatedAt: string | null
  isFork: boolean
  isArchived: boolean
  homepage: string | null
}

export interface GitHubRepo {
  fullName: string
  stars: number
  forks: number
  watchers: number
  issues: number
}

export interface GitHubReleaseData {
  tag: string
  name: string | null
  preRelease: boolean
  draft: boolean
  publishedAt: string
  url: string
  body: string | null
  assetCount: number
}

export type CIStatus = "success" | "failure" | "pending" | "cancelled" | "skipped"

export interface CIStatusData {
  workflowName: string
  status: CIStatus
  url: string
  branch: string
  startedAt: string | null
  durationSeconds: number | null
}

export interface CommitGraphEntry {
  hash: string
  message: string
  author: {
    name: string
    avatarUrl?: string
  }
  date: string
  parents: string[]
  refs?: string[]
  tag?: string
}

const repoCache = new Map<string, Promise<GitHubRepoData | null>>()
const releaseCache = new Map<string, Promise<GitHubReleaseData | null>>()
const ciCache = new Map<string, Promise<CIStatusData | null>>()
const commitCache = new Map<string, Promise<CommitGraphEntry[]>>()
const contributionCache = new Map<string, Promise<GitHubContributions | null>>()
const releasesCache = new Map<string, Promise<GitHubReleaseData[]>>()

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  MDX: "#fcb32c",
}

function githubHeaders() {
  return {
    Accept: "application/vnd.github.v3+json",
    ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
  }
}

async function getJson(url: string, headers: Record<string, string> = { Accept: "application/json" }) {
  const response = await fetch(url, { headers })
  if (!response.ok) {
    console.warn(`[github-data] ${response.status} ${url}`)
    return null
  }
  return response.json()
}

export function getLanguageColor(language: string): string {
  return LANGUAGE_COLORS[language] ?? "#8b8b8b"
}

export function fetchGitHubContributions(username: string): Promise<GitHubContributions | null> {
  const key = username.toLowerCase()
  if (!contributionCache.has(key)) {
    contributionCache.set(key, (async () => {
      const data = await getJson(
        `https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}?y=last`,
        { Accept: "application/json", "User-Agent": "jalco-ui/1.0" },
      )
      if (!data) return null
      const entries: ActivityEntry[] = (data.contributions ?? [])
        .map((entry: { date: string; count?: number }) => ({ date: entry.date, count: entry.count ?? 0 }))
      const total = Object.values(data.total ?? {}).reduce((sum: number, value) => {
        return sum + (typeof value === "number" ? value : 0)
      }, 0)
      return entries.length || total ? { total, entries } : null
    })())
  }
  return contributionCache.get(key)!
}

export function fetchGitHubRepoData(owner: string, repo: string): Promise<GitHubRepoData | null> {
  const key = `${owner}/${repo}`.toLowerCase()
  if (!repoCache.has(key)) {
    repoCache.set(key, (async () => {
      const data = await getJson(`https://api.github.com/repos/${owner}/${repo}`, githubHeaders())
      if (!data || typeof data.full_name !== "string") return null
      return {
        fullName: data.full_name,
        description: data.description ?? null,
        language: data.language ?? null,
        languageColor: data.language ? getLanguageColor(data.language) : null,
        stars: data.stargazers_count ?? 0,
        forks: data.forks_count ?? 0,
        openIssues: data.open_issues_count ?? 0,
        license: data.license?.spdx_id ?? null,
        topics: Array.isArray(data.topics) ? data.topics : [],
        updatedAt: data.pushed_at ?? null,
        isFork: data.fork ?? false,
        isArchived: data.archived ?? false,
        homepage: data.homepage || null,
      }
    })())
  }
  return repoCache.get(key)!
}

export async function fetchGitHubRepo(owner: string, repo: string): Promise<GitHubRepo | null> {
  const data = await fetchGitHubRepoData(owner, repo)
  if (!data) return null
  return {
    fullName: data.fullName,
    stars: data.stars,
    forks: data.forks,
    watchers: 0,
    issues: data.openIssues,
  }
}

export function fetchLatestRelease(owner: string, repo: string): Promise<GitHubReleaseData | null> {
  const key = `${owner}/${repo}`.toLowerCase()
  if (!releaseCache.has(key)) {
    releaseCache.set(key, (async () => {
      const data = await getJson(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, githubHeaders())
      if (!data || typeof data.tag_name !== "string") return null
      return {
        tag: data.tag_name,
        name: data.name ?? null,
        preRelease: data.prerelease === true,
        draft: data.draft === true,
        publishedAt: data.published_at,
        url: data.html_url,
        body: data.body ?? null,
        assetCount: Array.isArray(data.assets) ? data.assets.length : 0,
      }
    })())
  }
  return releaseCache.get(key)!
}

// All (non-draft) releases for a repo, newest first. Prereleases are included;
// callers filter them if they want. For a multi-release changelog blog.
export function fetchReleases(owner: string, repo: string, limit = 20): Promise<GitHubReleaseData[]> {
  const key = `${owner}/${repo}/${limit}`.toLowerCase()
  if (!releasesCache.has(key)) {
    releasesCache.set(key, (async () => {
      const data = await getJson(
        `https://api.github.com/repos/${owner}/${repo}/releases?per_page=${limit}`,
        githubHeaders(),
      )
      if (!Array.isArray(data)) return []
      return data
        .filter((d) => d && typeof d.tag_name === "string" && d.draft !== true)
        .map((d) => ({
          tag: d.tag_name,
          name: d.name ?? null,
          preRelease: d.prerelease === true,
          draft: d.draft === true,
          publishedAt: d.published_at,
          url: d.html_url,
          body: d.body ?? null,
          assetCount: Array.isArray(d.assets) ? d.assets.length : 0,
        }))
    })())
  }
  return releasesCache.get(key)!
}

export function fetchCIStatus(
  owner: string,
  repo: string,
  workflow?: string,
  branch?: string,
): Promise<CIStatusData | null> {
  const key = `${owner}/${repo}/${workflow ?? ""}/${branch ?? ""}`.toLowerCase()
  if (!ciCache.has(key)) {
    ciCache.set(key, (async () => {
      const params = new URLSearchParams({ per_page: "1" })
      if (branch) params.set("branch", branch)
      const workflowPath = workflow ? `/workflows/${encodeURIComponent(workflow)}` : ""
      const data = await getJson(
        `https://api.github.com/repos/${owner}/${repo}/actions${workflowPath}/runs?${params}`,
        githubHeaders(),
      )
      const run = data?.workflow_runs?.[0]
      if (!run) return null
      let durationSeconds: number | null = null
      if (run.run_started_at && run.updated_at) {
        const start = new Date(run.run_started_at).getTime()
        const end = new Date(run.updated_at).getTime()
        if (end > start) durationSeconds = Math.round((end - start) / 1000)
      }
      return {
        workflowName: run.name ?? "CI",
        status: mapStatus(run.status, run.conclusion),
        url: run.html_url,
        branch: run.head_branch ?? branch ?? "main",
        startedAt: run.run_started_at ?? null,
        durationSeconds,
      }
    })())
  }
  return ciCache.get(key)!
}

export function fetchRecentCommits(
  owner: string,
  repo: string,
  limit = 8,
): Promise<CommitGraphEntry[]> {
  const key = `${owner}/${repo}/${limit}`.toLowerCase()
  if (!commitCache.has(key)) {
    commitCache.set(key, (async () => {
      const data = await getJson(
        `https://api.github.com/repos/${owner}/${repo}/commits?per_page=${limit}`,
        githubHeaders(),
      )
      if (!Array.isArray(data)) return []
      return data.map((commit) => ({
        hash: commit.sha,
        message: commit.commit?.message?.split("\n")[0] ?? commit.sha.slice(0, 7),
        author: {
          name: commit.commit?.author?.name ?? commit.author?.login ?? "unknown",
          avatarUrl: commit.author?.avatar_url,
        },
        date: commit.commit?.author?.date ?? commit.commit?.committer?.date ?? new Date().toISOString(),
        parents: Array.isArray(commit.parents) ? commit.parents.map((parent: { sha: string }) => parent.sha) : [],
      }))
    })())
  }
  return commitCache.get(key)!
}

function mapStatus(status: string, conclusion: string | null): CIStatus {
  if (status === "completed") {
    if (conclusion === "success") return "success"
    if (conclusion === "failure") return "failure"
    if (conclusion === "cancelled") return "cancelled"
    if (conclusion === "skipped") return "skipped"
    return "failure"
  }
  return "pending"
}

export function formatCount(count: number): string {
  if (count >= 1_000_000) {
    const value = count / 1_000_000
    return `${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}m`
  }
  if (count >= 1_000) {
    const value = count / 1_000
    return `${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}k`
  }
  return count.toLocaleString("en-US")
}

export const formatStarCount = formatCount

export function formatRelativeDate(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / 86_400_000)

  if (diffDays === 0) {
    const diffHrs = Math.floor(diffMs / 3_600_000)
    if (diffHrs === 0) {
      const diffMins = Math.floor(diffMs / 60_000)
      return diffMins <= 1 ? "just now" : `${diffMins}m ago`
    }
    return `${diffHrs}h ago`
  }
  if (diffDays === 1) return "yesterday"
  if (diffDays < 30) return `${diffDays}d ago`
  const months = Math.floor(diffDays / 30)
  if (months < 12) return `${months}mo ago`
  const years = Math.floor(diffDays / 365)
  return `${years}y ago`
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins < 60) return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`
  const hrs = Math.floor(mins / 60)
  const remainMins = mins % 60
  return remainMins > 0 ? `${hrs}h ${remainMins}m` : `${hrs}h`
}
