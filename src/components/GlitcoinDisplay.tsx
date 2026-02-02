'use client'

import { GLITCOIN_TO_DOLLAR } from '@/types'

interface GlitcoinDisplayProps {
  amount: number
  showDollarEquivalent?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function GlitcoinDisplay({
  amount,
  showDollarEquivalent = false,
  size = 'md',
  className = ''
}: GlitcoinDisplayProps) {
  const dollarAmount = amount * GLITCOIN_TO_DOLLAR

  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-6xl'
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span className={`font-bold glitcoin-text ${sizeClasses[size]}`}>
        {amount}Ġ
      </span>
      {showDollarEquivalent && (
        <span className="text-muted-foreground text-sm">
          (${dollarAmount})
        </span>
      )}
    </div>
  )
}
