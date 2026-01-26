'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getCoverUrl } from '@/lib/igdb'

interface ActivityItem {
  id: string
  user_id: string
  game_id: number
  game_slug: string
  game_name: string
  game_cover_id: string | null
  status: string
  rating: number | null
  review: string | null
  favorite: boolean
  updated_at: string
  profiles: {
    username: string
    display_name: string | null
    avatar_url: string | null
  }
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex justify-center gap-0.5 mt-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = Math.min(1, Math.max(0, rating - star + 1))
        return (
          <span key={star} className="relative w-3 h-3">
            <span className="absolute text-foreground-muted/30 text-xs">★</span>
            {fill > 0 && (
              <span
                className="absolute text-gold text-xs overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                ★
              </span>
            )}
          </span>
        )
      })}
    </div>
  )
}

export function ActivityFeedClient({ items }: { items: ActivityItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (el) {
      el.addEventListener('scroll', checkScroll)
      window.addEventListener('resize', checkScroll)
      return () => {
        el.removeEventListener('scroll', checkScroll)
        window.removeEventListener('resize', checkScroll)
      }
    }
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 200
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  return (
    <div className="relative">
      {/* Left scroll button */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-background-card border border-purple/30 rounded-full flex items-center justify-center text-foreground active:scale-95"
          aria-label="Scroll left"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Right scroll button */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-background-card border border-purple/30 rounded-full flex items-center justify-center text-foreground active:scale-95"
          aria-label="Scroll right"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide px-1 py-1"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {items.map((item) => (
          <div key={item.id} className="flex-none w-24">
            {/* Game cover */}
            <Link href={`/game/${item.game_slug}`} className="block">
              <div className="w-24 h-32 bg-background-card rounded-lg overflow-hidden">
                {item.game_cover_id ? (
                  <Image
                    src={getCoverUrl(item.game_cover_id)}
                    alt={item.game_name}
                    width={96}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl bg-gradient-to-br from-purple/20 to-purple-dark/40">
                    🎮
                  </div>
                )}
              </div>
            </Link>

            {/* Friend info below poster */}
            <div className="mt-2 flex flex-col items-center">
              {/* Avatar */}
              <Link href={`/user/${item.profiles.username}`}>
                <div className="w-7 h-7 rounded-full bg-background-secondary overflow-hidden ring-2 ring-background">
                  {item.profiles.avatar_url ? (
                    <Image
                      src={item.profiles.avatar_url}
                      alt={item.profiles.username}
                      width={28}
                      height={28}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs bg-gradient-to-br from-purple/30 to-purple-dark/30">
                      {item.profiles.username[0].toUpperCase()}
                    </div>
                  )}
                </div>
              </Link>

              {/* Name */}
              <Link
                href={`/user/${item.profiles.username}`}
                className="text-xs text-foreground-muted mt-1 truncate max-w-full text-center"
              >
                {item.profiles.display_name || item.profiles.username}
              </Link>

              {/* Rating */}
              {item.rating && <StarDisplay rating={item.rating} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
