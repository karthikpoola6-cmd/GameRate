'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getCoverUrl } from '@/lib/igdb'
import type { IGDBGame } from '@/lib/igdb'

const DISPLAY_COUNT = 16
const STORAGE_KEY = 'popularGamesSelection'

function GameCard({ game }: { game: IGDBGame }) {
  const year = game.first_release_date
    ? new Date(game.first_release_date * 1000).getFullYear()
    : null
  const rating = game.rating ? (game.rating / 20).toFixed(1) : null

  return (
    <Link href={`/game/${game.slug}`}>
      <div className="relative aspect-[3/4] bg-background-card rounded-md sm:rounded-lg overflow-hidden">
        {game.cover?.image_id ? (
          <Image
            src={getCoverUrl(game.cover.image_id)}
            alt={game.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 25vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
            loading="lazy"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-purple/20 to-purple-dark/40 flex items-center justify-center">
            <span className="text-2xl sm:text-4xl">🎮</span>
          </div>
        )}
      </div>
      <div className="mt-1 sm:mt-2">
        <h3 className="text-xs sm:text-sm font-medium text-foreground truncate">
          {game.name}
        </h3>
        <div className="flex items-center justify-between mt-0.5 sm:mt-1">
          {year && <span className="text-[10px] sm:text-xs text-foreground-muted">{year}</span>}
          {rating && <span className="text-[10px] sm:text-xs text-gold">{rating}</span>}
        </div>
      </div>
    </Link>
  )
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function PopularGamesClient({ pool }: { pool: IGDBGame[] }) {
  // Start with first 16 for SSR/hydration (deterministic, no mismatch)
  const [games, setGames] = useState<IGDBGame[]>(pool.slice(0, DISPLAY_COUNT))

  useEffect(() => {
    // Check sessionStorage for a previous selection
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const ids: number[] = JSON.parse(stored)
        const selected = ids
          .map(id => pool.find(g => g.id === id))
          .filter((g): g is IGDBGame => g != null)
        if (selected.length === DISPLAY_COUNT) {
          setGames(selected)
          return
        }
      } catch {
        // invalid storage, fall through to re-shuffle
      }
    }

    // Pick a fresh random 16 and persist for this session
    const picked = shuffle(pool).slice(0, DISPLAY_COUNT)
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(picked.map(g => g.id)))
    setGames(picked)
  }, [pool])

  return (
    <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-4">
      {games.map((game) => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  )
}
