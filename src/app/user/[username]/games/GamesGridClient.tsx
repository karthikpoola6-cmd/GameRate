'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getCoverUrl } from '@/lib/igdb'
import type { GameLog } from '@/lib/types'

type SortOption = 'recent' | 'highest' | 'lowest'
type RatingFilter = 'all' | '5' | '4.5' | '4' | '3.5' | '3' | '2.5' | '2' | '1.5' | '1' | '0.5'

const RATING_OPTIONS: { value: RatingFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: '5', label: '5' },
  { value: '4.5', label: '4.5' },
  { value: '4', label: '4' },
  { value: '3.5', label: '3.5' },
  { value: '3', label: '3' },
  { value: '2.5', label: '2.5' },
  { value: '2', label: '2' },
  { value: '1.5', label: '1.5' },
  { value: '1', label: '1' },
  { value: '0.5', label: '0.5' },
]

interface GamesGridClientProps {
  games: GameLog[]
}

export function GamesGridClient({ games }: GamesGridClientProps) {
  const [sort, setSort] = useState<SortOption>('recent')
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all')

  // Filter games
  let filteredGames = [...games]

  if (ratingFilter !== 'all') {
    const filterValue = parseFloat(ratingFilter)
    filteredGames = filteredGames.filter(game => game.rating === filterValue)
  }

  // Sort games
  if (sort === 'highest') {
    filteredGames.sort((a, b) => (b.rating || 0) - (a.rating || 0))
  } else if (sort === 'lowest') {
    filteredGames.sort((a, b) => (a.rating || 0) - (b.rating || 0))
  }
  // 'recent' is already sorted from the server

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground-muted">Sort:</span>
          <div className="flex gap-1">
            {[
              { value: 'recent', label: 'Recent' },
              { value: 'highest', label: 'Highest' },
              { value: 'lowest', label: 'Lowest' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setSort(option.value as SortOption)}
                className={`px-3 py-1.5 text-sm rounded-lg ${
                  sort === option.value
                    ? 'bg-purple text-white'
                    : 'glass text-foreground-muted border border-purple/10'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Rating Filter */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground-muted">Rating:</span>
          <div className="flex gap-1 flex-wrap">
            {RATING_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setRatingFilter(option.value)}
                className={`px-2 py-1 text-sm rounded-lg ${
                  ratingFilter === option.value
                    ? 'bg-gold text-background'
                    : 'glass text-foreground-muted border border-purple/10'
                }`}
              >
                {option.value === 'all' ? 'All' : `${option.label}★`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-foreground-muted mb-4">
        Showing {filteredGames.length} game{filteredGames.length !== 1 ? 's' : ''}
      </p>

      {/* Games Grid */}
      {filteredGames.length > 0 ? (
        <div
          className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-4"
        >
          {filteredGames.map((game) => (
            <Link key={game.id} href={`/game/${game.game_slug}`}>
              <div className="relative aspect-[3/4] bg-background-card rounded-md sm:rounded-lg overflow-hidden">
                {game.game_cover_id ? (
                  <Image
                    src={getCoverUrl(game.game_cover_id)}
                    alt={game.game_name}
                    fill
                    className="object-cover"
                    loading="lazy"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 bg-purple/20 flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl">🎮</span>
                  </div>
                )}
              </div>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm truncate">
                {game.game_name}
              </p>
              {game.rating && (
                <div className="flex mt-0.5">
                  <span className="text-gold text-[10px] sm:text-xs">
                    {'★'.repeat(Math.floor(game.rating))}
                    {game.rating % 1 >= 0.5 && '½'}
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="glass rounded-xl p-8 text-center border border-purple/10">
          <p className="text-foreground-muted">No games match this filter.</p>
          <button
            onClick={() => {
              setSort('recent')
              setRatingFilter('all')
            }}
            className="mt-3 text-purple text-sm"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}
