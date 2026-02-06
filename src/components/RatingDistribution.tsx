'use client'

import { useState, useEffect, useRef } from 'react'

interface RatingDistributionProps {
  distribution: Record<number, number>
  maxCount: number
}

export function RatingDistribution({ distribution, maxCount }: RatingDistributionProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [isInView, setIsInView] = useState(false)
  const [hasEntered, setHasEntered] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const ratingSteps = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]

  const totalRatings = Object.values(distribution).reduce((a, b) => a + b, 0)

  // Track when component enters/exits viewport
  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
        if (entry.isIntersecting && !hasEntered) {
          setTimeout(() => setHasEntered(true), 100)
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [hasEntered])

  // Don't render if no ratings
  if (totalRatings === 0) return null

  return (
    <div ref={containerRef} className="w-full">
      {/* Bars */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '3px',
          height: '48px',
        }}
      >
        {ratingSteps.map((rating, index) => {
          const count = Number(distribution[rating] ?? 0)
          const heightPx = maxCount > 0 ? Math.max((count / maxCount) * 48, count > 0 ? 4 : 2) : 2
          const isSelected = selected === rating
          const shouldBreathe = isInView && hasEntered && count > 0

          return (
            <div
              key={rating}
              onClick={() => setSelected(selected === rating ? null : rating)}
              style={{
                flex: 1,
                height: hasEntered ? `${heightPx}px` : '2px',
                backgroundColor: isSelected
                  ? '#a78bfa'
                  : count > 0
                    ? 'rgba(139, 92, 246, 0.35)'
                    : 'rgba(139, 92, 246, 0.15)',
                borderRadius: '2px 2px 0 0',
                cursor: 'pointer',
                transformOrigin: 'bottom',
                transition: hasEntered
                  ? 'background-color 0.15s'
                  : `height 0.5s cubic-bezier(0.25, 0.1, 0.25, 1) ${index * 40}ms, background-color 0.15s`,
                animation: shouldBreathe
                  ? `bar-breathe 3s ease-in-out ${index * 0.2}s infinite`
                  : 'none',
                willChange: shouldBreathe ? 'transform' : 'auto',
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
      <div className="h-4 -mt-0.5 flex items-center justify-center gap-1.5">
        {selected !== null ? (
          <>
            <span className="text-gold text-xs">
              {'★'.repeat(Math.floor(selected))}
              {selected % 1 >= 0.5 && '½'}
            </span>
            <span className="text-xs text-foreground-muted">
              {distribution[selected] || 0} {(distribution[selected] || 0) === 1 ? 'game' : 'games'}
            </span>
          </>
        ) : (
          <span className="text-[10px] text-foreground-muted/50">tap a bar</span>
        )}
      </div>
    </div>
  )
}
