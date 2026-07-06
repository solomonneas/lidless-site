import { releaseBadgeInlineVariants } from "./release-badge"
import { ciBadgeInlineVariants } from "./ci-badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  formatRelativeDate,
  formatDuration,
  type GitHubReleaseData,
  type CIStatusData,
} from "@/lib/github-data"

interface JalcoProjectBadgesStaticProps {
  release: GitHubReleaseData | null
  ci: CIStatusData | null
}

function TagIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" fill="currentColor" className={className}>
      <path d="M1 7.775V2.75C1 1.784 1.784 1 2.75 1h5.025c.464 0 .91.184 1.238.513l6.25 6.25a1.75 1.75 0 0 1 0 2.474l-5.026 5.026a1.75 1.75 0 0 1-2.474 0l-6.25-6.25A1.752 1.752 0 0 1 1 7.775Zm1.5 0c0 .066.026.13.073.177l6.25 6.25a.25.25 0 0 0 .354 0l5.025-5.025a.25.25 0 0 0 0-.354l-6.25-6.25a.25.25 0 0 0-.177-.073H2.75a.25.25 0 0 0-.25.25ZM6 5a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z" />
    </svg>
  )
}

function BranchIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="5" cy="3.5" r="1.5" />
      <circle cx="5" cy="12.5" r="1.5" />
      <circle cx="11" cy="6.5" r="1.5" />
      <path d="M5 5v6M9.5 6.5H7a2 2 0 0 1-2-2" />
    </svg>
  )
}

function statusClass(status: CIStatusData["status"]) {
  if (status === "success") return "text-emerald-700 dark:text-emerald-400"
  if (status === "failure") return "text-red-700 dark:text-red-400"
  if (status === "pending") return "text-amber-700 dark:text-amber-400"
  return "text-zinc-600 dark:text-zinc-400"
}

function statusDot(status: CIStatusData["status"]) {
  if (status === "success") return "bg-emerald-500"
  if (status === "failure") return "bg-red-500"
  if (status === "pending") return "bg-amber-500"
  return "bg-zinc-400"
}

function statusLabel(status: CIStatusData["status"]) {
  if (status === "success") return "passing"
  if (status === "failure") return "failing"
  return status
}

export function JalcoProjectBadgesStatic({ release, ci }: JalcoProjectBadgesStaticProps) {
  if (!release && !ci) return null

  return (
    <div className="flex flex-wrap gap-2" data-slot="project-status-badges">
      {release && (
        <a
          href={release.url}
          target="_blank"
          rel="noopener noreferrer"
          data-slot="release-badge"
          aria-label={`${release.tag} release on GitHub`}
          className={cn(releaseBadgeInlineVariants({ variant: "outline", size: "sm" }), "border-b-0")}
        >
          <TagIcon className="shrink-0" />
          <span data-slot="release-badge-tag" className="tabular-nums">{release.tag}</span>
          <Separator orientation="vertical" className="h-3.5 bg-current opacity-20" />
          <span data-slot="release-badge-date" className="text-[0.8em] opacity-70">{formatRelativeDate(release.publishedAt)}</span>
        </a>
      )}
      {ci && (
        <a
          href={ci.url}
          target="_blank"
          rel="noopener noreferrer"
          data-slot="ci-badge"
          data-status={ci.status}
          aria-label={`${ci.workflowName}: ${statusLabel(ci.status)}`}
          className={cn(
            ciBadgeInlineVariants({ size: "sm" }),
            "rounded-md border border-border bg-muted/50 text-muted-foreground shadow-xs hover:bg-accent hover:text-accent-foreground border-b-0"
          )}
        >
          <span data-slot="ci-badge-dot" className={cn("size-2 shrink-0 rounded-full", statusDot(ci.status))} aria-hidden="true" />
          <span data-slot="ci-badge-status" className={cn("font-semibold", statusClass(ci.status))}>{statusLabel(ci.status)}</span>
          <Separator orientation="vertical" className="h-3.5 bg-current opacity-20" />
          <span className="flex items-center gap-1 opacity-70">
            <BranchIcon className="size-3" />
            <span data-slot="ci-badge-branch" className="max-w-[6rem] truncate text-[0.85em]">{ci.branch}</span>
          </span>
          {ci.durationSeconds != null && (
            <>
              <Separator orientation="vertical" className="h-3.5 bg-current opacity-20" />
              <span data-slot="ci-badge-duration" className="text-[0.85em] tabular-nums opacity-70">{formatDuration(ci.durationSeconds)}</span>
            </>
          )}
        </a>
      )}
    </div>
  )
}
