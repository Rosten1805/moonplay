import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium tracking-wide uppercase transition-colors select-none',
  {
    variants: {
      variant: {
        default: 'border-accent/30 bg-accent/10 text-accent',
        violet: 'border-pink-accent/30 bg-pink-muted text-pink-accent',
        success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
        warning: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
        error: 'border-red-500/30 bg-red-500/10 text-red-400',
        ghost: 'border-synth-border bg-synth-bg-3 text-synth-text-dim',
        mp3: 'border-accent/30 bg-accent/10 text-accent',
        mp4: 'border-pink-accent/30 bg-pink-muted text-pink-accent',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
