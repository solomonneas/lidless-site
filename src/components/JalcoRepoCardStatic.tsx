import { repoCardVariants } from "./repo-card"
import { githubStarsButtonVariants } from "./github-stars-button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { formatCount, formatRelativeDate, type GitHubRepoData } from "@/lib/github-data"

export interface RepoAction {
  href: string
  label: string
  kind: "repo" | "commits" | "readme" | "npm" | "stars"
}

interface JalcoRepoCardStaticProps {
  repoSlug: string
  label: string
  desc: string
  data: GitHubRepoData | null
  actions: RepoAction[]
  /** Tighter card: drops the topics and meta rows and reduces padding/gap. */
  compact?: boolean
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" fill="currentColor" className={className}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  )
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" fill="currentColor" className={className}>
      <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.75.75 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25z" />
    </svg>
  )
}

function ForkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" fill="currentColor" className={className}>
      <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0zM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5zM8 12.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5z" />
    </svg>
  )
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" fill="currentColor" className={className}>
      <path d="M7.775 3.275a.75.75 0 0 0-1.06-1.06L2.94 5.99a3.75 3.75 0 0 0 5.304 5.304l.389-.389a.75.75 0 0 0-1.06-1.06l-.389.389a2.25 2.25 0 0 1-3.182-3.182l3.773-3.777Zm.45 9.45a.75.75 0 0 0 1.06 1.06l3.775-3.775a3.75 3.75 0 0 0-5.304-5.304l-.389.389a.75.75 0 1 0 1.06 1.06l.389-.389a2.25 2.25 0 1 1 3.182 3.182l-3.773 3.777Z" />
      <path d="M5.705 11.355a.75.75 0 0 0 1.06 0l4.59-4.59a.75.75 0 0 0-1.06-1.06l-4.59 4.59a.75.75 0 0 0 0 1.06Z" />
    </svg>
  )
}

function actionIcon(kind: RepoAction["kind"]) {
  if (kind === "stars") return <StarIcon className="size-3.5" />
  if (kind === "commits") return <ForkIcon className="size-3.5" />
  return <LinkIcon className="size-3.5" />
}

export function JalcoRepoCardStatic({
  repoSlug,
  label,
  desc,
  data,
  actions,
  compact = false,
}: JalcoRepoCardStaticProps) {
  const repoData = data ?? {
    fullName: repoSlug,
    description: desc,
    language: null,
    languageColor: null,
    stars: 0,
    forks: 0,
    openIssues: 0,
    license: null,
    topics: [],
    updatedAt: null,
    isFork: false,
    isArchived: false,
    homepage: null,
  }
  const topics = repoData.topics.slice(0, 4)

  return (
    <div
      data-slot="repo-card"
      className={cn(
        repoCardVariants({ variant: "default", size: "lg" }),
        "jalco-repo-card border-b-0",
        compact && "gap-2.5 p-4",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="mb-2 font-mono text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-primary">
            {label}
          </p>
          <div className="flex items-center gap-2">
            <GitHubIcon className="size-4 shrink-0 text-muted-foreground" />
            <span data-slot="repo-name" className="truncate font-semibold">
              {repoData.fullName}
            </span>
          </div>
        </div>
        <a
          href={`https://github.com/${repoSlug}/stargazers`}
          target="_blank"
          rel="noopener noreferrer"
          data-slot="github-stars-button"
          aria-label={`${repoData.fullName} on GitHub - ${repoData.stars.toLocaleString("en-US")} stars`}
          className={cn(githubStarsButtonVariants({ variant: "subtle", size: "sm" }), "border-b-0")}
        >
          <StarIcon className="shrink-0" />
          <span className="tabular-nums">{formatCount(repoData.stars)}</span>
        </a>
      </div>

      <p data-slot="repo-description" className="text-sm text-muted-foreground">
        {repoData.description || desc}
      </p>

      {!compact && topics.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {topics.map((topic) => (
            <Badge
              key={topic}
              variant="topic"
              size="xs"
              className="py-0.5 text-[11px]"
            >
              {topic}
            </Badge>
          ))}
        </div>
      )}

      {!compact && (
      <div data-slot="repo-meta" className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        {repoData.language && (
          <span className="inline-flex items-center gap-1.5">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: repoData.languageColor ?? "#8b8b8b" }}
              aria-hidden="true"
            />
            {repoData.language}
          </span>
        )}
        {repoData.forks > 0 && (
          <span className="inline-flex items-center gap-1 tabular-nums">
            <ForkIcon className="size-3.5 opacity-60" />
            {formatCount(repoData.forks)}
          </span>
        )}
        {repoData.license && repoData.license !== "NOASSERTION" && <span>{repoData.license}</span>}
        {repoData.updatedAt && <span>Updated {formatRelativeDate(repoData.updatedAt)}</span>}
      </div>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        {actions.map((action) => (
          <a
            key={`${action.kind}-${action.href}`}
            href={action.href}
            target="_blank"
            rel="noopener noreferrer"
            data-slot="repo-action-link"
            className={cn(githubStarsButtonVariants({ variant: action.kind === "repo" ? "primary" : "outline", size: "sm" }), "border-b-0")}
          >
            {actionIcon(action.kind)}
            <span>{action.label}</span>
          </a>
        ))}
      </div>
    </div>
  )
}
