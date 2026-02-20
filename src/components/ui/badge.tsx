import * as React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: 'default' | 'secondary' | 'accent' | 'outline'
}

const badgeVariants = {
  default: 'inline-flex items-center rounded-full border-[hsl(var(--border))] bg-[hsl(var(--background))] px-2.5 py-1 text-xs font-medium text-[hsl(var(--ink))] transition-colors hover:bg-[hsl(var(--accent))]/10 hover:text-[hsl(var(--accent-foreground))]',
  secondary: 'inline-flex items-center rounded-full border-[hsl(var(--border))] bg-[hsl(var(--secondary))] px-2.5 py-1 text-xs font-medium text-[hsl(var(--secondary-foreground))] transition-colors hover:bg-[hsl(var(--secondary))]/80',
  accent: 'inline-flex items-center rounded-full bg-[hsl(var(--accent))] px-2.5 py-1 text-xs font-medium text-[hsl(var(--accent-foreground))] transition-colors hover:bg-[hsl(var(--accent))]/80',
  outline: 'inline-flex items-center rounded-full border-[hsl(var(--border))] bg-transparent px-2.5 py-1 text-xs font-medium text-[hsl(var(--ink))] transition-colors hover:bg-[hsl(var(--accent))]/10 hover:text-[hsl(var(--accent-foreground))]',
}

export function Badge({ children, className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants[variant], className)} {...props}>
      {children}
    </div>
  )
}
