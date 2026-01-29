'use client'

import { useState } from 'react'

interface RatingDistributionProps {
  distribution: Record<number, number>
  maxCount: number
}

export function RatingDistribution({ distribution, maxCount }: RatingDistributionProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const ratingSteps = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]

  const totalRatings = Object.values(distribution).reduce((a, b) => a + b, 0)

  // Don't render if no ratings
  if (totalRatings === 0) return null

  return (
    <div className="w-full">
      {/* Bars */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '3px',
          height: '48px',
        }}
      >
        {ratingSteps.map((rating) => {
          const count = Number(distribution[rating] ?? 0)
          const heightPx = maxCount > 0 ? Math.max((count / maxCount) * 48, count > 0 ? 4 : 2) : 2
          const isSelected = selected === rating

          return (
            <div
              key={rating}
              onClick={() => setSelected(selected === rating ? null : rating)}
              style={{
                flex: 1,
                height: `${heightPx}px`,
                backgroundColor: isSelected
                  ? '#a78bfa' // purple-400
                  : count > 0
                    ? 'rgba(139, 92, 246, 0.35)' // purple with opacity
                    : 'rgba(139, 92, 246, 0.15)', // very subtle purple
                borderRadius: '2px 2px 0 0',
                cursor: 'pointer',
                transition: 'background-color 0.15s',
              }}
            />
          )
        })}
      </div>

      {/* Baseline with stars */}
      <div className="flex items-center justify-between border-t border-purple/20 pt-1.5 mt-0.5">
        <span className="text-gold text-[10px]">★</span>
        <span className="text-gold text-[10px]">★★★★★</span>
      </div>

      {/* Selected count - bottom */}
      <div className="h-5 flex items-center justify-center">
        {selected !== null ? (
          <span className="text-xs text-foreground-muted">
            {distribution[selected] || 0} {(distribution[selected] || 0) === 1 ? 'game' : 'games'}
          </span>
        ) : (
          <span className="text-[10px] text-foreground-muted/50">tap a bar</span>
        )}
      </div>
    </div>
  )
}
