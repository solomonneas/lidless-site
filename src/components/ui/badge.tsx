import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center",
  {
    variants: {
      variant: {
        default:
          "shrink-0 gap-1 whitespace-nowrap rounded-sm border border-border bg-card font-mono font-medium text-foreground transition-colors",
        outline:
          "shrink-0 gap-1 whitespace-nowrap rounded-sm border border-border bg-transparent font-mono font-medium text-muted-foreground transition-colors",
        muted:
          "shrink-0 gap-1 whitespace-nowrap rounded-sm border border-border bg-muted/50 font-mono font-medium text-muted-foreground transition-colors",
        primary:
          "shrink-0 gap-1 whitespace-nowrap rounded-sm border border-primary/20 bg-primary/10 font-mono font-medium text-primary transition-colors",
        accent:
          "shrink-0 gap-1 whitespace-nowrap rounded-sm border border-[color-mix(in_srgb,var(--accent)_18%,transparent)] bg-[color-mix(in_srgb,var(--accent)_8%,transparent)] font-mono font-medium text-[color-mix(in_srgb,var(--accent)_90%,currentColor)] transition-colors",
        topic: "rounded-full bg-primary/10 font-medium text-primary",
      },
      size: {
        xs: "px-2 py-[0.2rem] text-[0.7rem]",
        sm: "px-2.5 py-1 text-xs",
        default: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Badge({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
