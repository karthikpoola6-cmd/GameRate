'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { getCoverUrl } from '@/lib/igdb'
import type { GameLog } from '@/lib/types'

interface FavoriteGamesProps {
  favorites: GameLog[]
  isOwnProfile: boolean
}

export function FavoriteGames({ favorites: initialFavorites, isOwnProfile }: FavoriteGamesProps) {
  const [favorites, setFavorites] = useState(initialFavorites)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const supabase = createClient()

  // Sort favorites by position (nulls last), then by updated_at
  const sortedFavorites = [...favorites].sort((a, b) => {
    if (a.favorite_position && b.favorite_position) {
      return a.favorite_position - b.favorite_position
    }
    if (a.favorite_position) return -1
    if (b.favorite_position) return 1
    return 0
  }).slice(0, 5)

  // Create array of 5 slots
  const slots = Array(5).fill(null).map((_, i) => sortedFavorites[i] || null)

  function handleRemoveFavorite(gameId: string) {
    if (!isOwnProfile) return
    setFavorites(prev => prev.filter(f => f.id !== gameId))
    setHasChanges(true)
  }

  function handleMoveUp(index: number) {
    if (index <= 0) return
    const filledSlots = slots.filter(Boolean) as GameLog[]
    if (index >= filledSlots.length) return
    handleReorder(index, index - 1)
  }

  function handleMoveDown(index: number) {
    const filledSlots = slots.filter(Boolean) as GameLog[]
    if (index >= filledSlots.length - 1) return
    handleReorder(index, index + 1)
  }

  function handleReorder(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return

    const newSlots = [...slots]
    const [movedItem] = newSlots.splice(fromIndex, 1)
    newSlots.splice(toIndex, 0, movedItem)

    // Update local state immediately
    const updatedFavorites = favorites.map(fav => {
      const newPosition = newSlots.findIndex(s => s?.id === fav.id)
      if (newPosition !== -1) {
        return { ...fav, favorite_position: newPosition + 1 }
      }
      return fav
    })
    setFavorites(updatedFavorites)
    setHasChanges(true)
  }

  async function saveChanges() {
    setSaving(true)

    // Collect all updates: reordered positions + removed favorites
    const currentIds = new Set(favorites.map(f => f.id))
    const removedFavorites = initialFavorites.filter(f => !currentIds.has(f.id))

    // Batch update positions for remaining favorites
    const filledSlots = slots.filter(Boolean) as GameLog[]
    const positionUpdates = filledSlots.map((slot, i) =>
      supabase
        .from('game_logs')
        .update({ favorite_position: i + 1 })
        .eq('id', slot.id)
    )

    // Batch unfavorite removed games
    const removeUpdates = removedFavorites.map(removed =>
      supabase
        .from('game_logs')
        .update({ favorite: false, favorite_position: null })
        .eq('id', removed.id)
    )

    await Promise.all([...positionUpdates, ...removeUpdates])
    setHasChanges(false)
    setSaving(false)
  }

  // Render half-star rating
  function renderRating(rating: number | null) {
    if (!rating) return null
    return (
      <div className="flex gap-0.5 justify-center">
        {[1, 2, 3, 4, 5].map((star) => {
          const fill = Math.min(1, Math.max(0, rating - star + 1))
          return (
            <svg key={star} className="w-3 h-3" viewBox="0 0 20 20">
              <path
                className="text-foreground-muted/30"
                fill="currentColor"
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              />
              {fill > 0 && (
                <>
                  <defs>
                    <clipPath id={`fav-star-${star}-${rating}`}>
                      <rect x="0" y="0" width={`${fill * 100}%`} height="100%" />
                    </clipPath>
                  </defs>
                  <path
                    className="text-gold"
                    fill="currentColor"
                    clipPath={`url(#fav-star-${star}-${rating})`}
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  />
                </>
              )}
            </svg>
          )
        })}
      </div>
    )
  }

  const filledCount = slots.filter(Boolean).length

  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-lg font-medium tracking-wide">Favorite Games</h2>
        {saving && <span className="text-sm text-foreground-muted">Saving...</span>}
        {!saving && hasChanges && isEditing && (
          <span className="text-sm text-purple">Unsaved</span>
        )}
        {isOwnProfile && !saving && (
          <button
            onPointerDown={async () => {
              if (isEditing && hasChanges) {
                await saveChanges()
              }
              setIsEditing(!isEditing)
            }}
            className={`text-sm px-3 py-1 rounded-full select-none ${
              isEditing
                ? 'bg-purple text-white'
                : 'text-foreground-muted-card'
            }`}
            style={{ touchAction: 'manipulation' }}
          >
            {isEditing ? 'Done' : 'Edit'}
          </button>
        )}
      </div>
      <div className="flex gap-4 justify-center sm:justify-start flex-wrap">
        {slots.map((game, index) => (
          <div
            key={game?.id || `empty-${index}`}
          >
            {game ? (
              <div className="relative">
                {/* Arrow buttons in edit mode */}
                {isEditing && (
                  <div className="flex justify-center gap-1 mb-1">
                    <button
                      onPointerDown={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg select-none ${
                        index === 0
                          ? 'bg-background-card/50 text-foreground-muted/20'
                          : 'bg-purple/20 text-purple active:bg-purple active:text-white active:scale-95'
                      }`}
                      style={{ touchAction: 'manipulation' }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onPointerDown={() => handleMoveDown(index)}
                      disabled={index >= filledCount - 1}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg select-none ${
                        index >= filledCount - 1
                          ? 'bg-background-card/50 text-foreground-muted/20'
                          : 'bg-purple/20 text-purple active:bg-purple active:text-white active:scale-95'
                      }`}
                      style={{ touchAction: 'manipulation' }}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
                <Link
                  href={`/game/${game.game_slug}`}
                  onClick={(e) => isEditing && e.preventDefault()}
                  className={isEditing ? 'pointer-events-none' : ''}
                >
                  <div className={`relative w-28 sm:w-36 aspect-[3/4] bg-background-card rounded-lg overflow-hidden ring-2 ring-gold/50 ${
                    isEditing ? 'animate-wiggle' : ''
                  }`}>
                    {game.game_cover_id ? (
                      <Image
                        src={getCoverUrl(game.game_cover_id)}
                        alt={game.game_name}
                        fill
                        className="object-cover"
                        draggable={false}
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 bg-purple/20 flex items-center justify-center">
                        <span className="text-3xl">🎮</span>
                      </div>
                    )}
                  </div>
                </Link>
                {/* Remove button - only visible in edit mode */}
                {isEditing && (
                  <button
                    onPointerDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      handleRemoveFavorite(game.id)
                    }}
                    className="absolute top-6 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg z-10 select-none active:scale-90 active:bg-red-600"
                    style={{ touchAction: 'manipulation' }}
                    title="Remove from favorites"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                {/* Game name with ranking */}
                <p className="mt-2 text-sm text-center truncate max-w-28 sm:max-w-36">
                  <span className="text-gold font-semibold">{index + 1}.</span>{' '}
                  {game.game_name}
                </p>
                {renderRating(game.rating)}
              </div>
            ) : isOwnProfile ? (
              <Link href="/search" className="w-28 sm:w-36">
                <div className={`aspect-[3/4] bg-background-card/50 rounded-lg border-2 border-dashed border-purple/20 flex flex-col items-center justify-center gap-2 ${
                  isEditing ? 'mt-9' : ''
                }`}>
                  <div className="w-10 h-10 rounded-full bg-purple/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span className="text-foreground-muted/50 text-xs">Add game</span>
                </div>
                {/* Empty slot label */}
                <p className="mt-2 text-sm text-center text-foreground-muted/30">
                  <span className="font-semibold">{index + 1}.</span> Empty
                </p>
              </Link>
            ) : (
              <div className="w-28 sm:w-36">
                <div className="aspect-[3/4] bg-background-card/50 rounded-lg border-2 border-dashed border-purple/20 flex items-center justify-center">
                  <span className="text-foreground-muted/30 text-2xl">{index + 1}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
