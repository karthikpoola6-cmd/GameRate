'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { GameLog } from '@/lib/types'

interface GameLogButtonsProps {
  gameId: number
  gameSlug: string
  gameName: string
  gameCoverId: string | null
}

export function GameLogButtons({ gameId, gameSlug, gameName, gameCoverId }: GameLogButtonsProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)
  const [gameLog, setGameLog] = useState<GameLog | null>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [review, setReview] = useState('')
  const [hoverRating, setHoverRating] = useState(0)
  const [saving, setSaving] = useState(false)
  const [favoriteCount, setFavoriteCount] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  // Load user's existing log for this game
  useEffect(() => {
    async function loadGameLog() {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setIsLoggedIn(false)
        setLoading(false)
        return
      }

      setIsLoggedIn(true)

      const { data } = await supabase
        .from('game_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('game_id', gameId)
        .single()

      if (data) {
        setGameLog(data as GameLog)
        setReview(data.review || '')
      }

      // Get count of user's favorites
      const { count } = await supabase
        .from('game_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('favorite', true)

      setFavoriteCount(count || 0)
      setLoading(false)
    }

    loadGameLog()
  }, [supabase, gameId])

  async function handleWantToPlay() {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }

    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setSaving(false)
      return
    }

    if (gameLog?.status === 'want_to_play') {
      // Remove from want to play
      await supabase
        .from('game_logs')
        .delete()
        .eq('id', gameLog.id)
      setGameLog(null)
    } else if (gameLog) {
      // Update existing to want to play (clears rating)
      const { data, error } = await supabase
        .from('game_logs')
        .update({
          status: 'want_to_play',
          rating: null,
        })
        .eq('id', gameLog.id)
        .select()
        .single()

      if (!error && data) {
        setGameLog(data as GameLog)
      }
    } else {
      // Add new want to play
      const { data, error } = await supabase
        .from('game_logs')
        .insert({
          user_id: user.id,
          game_id: gameId,
          game_slug: gameSlug,
          game_name: gameName,
          game_cover_id: gameCoverId,
          status: 'want_to_play',
          rating: null,
          review: null,
          favorite: false,
        })
        .select()
        .single()

      if (!error && data) {
        setGameLog(data as GameLog)
      }
    }
    setSaving(false)
    router.refresh()
  }

  async function handleRating(rating: number) {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }

    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setSaving(false)
      return
    }

    // Handle clearing rating (rating = 0)
    const ratingValue = rating === 0 ? null : rating

    if (gameLog) {
      // Update existing log
      const { data, error } = await supabase
        .from('game_logs')
        .update({
          status: 'played',
          rating: ratingValue,
        })
        .eq('id', gameLog.id)
        .select()
        .single()

      if (!error && data) {
        setGameLog(data as GameLog)
      }
    } else if (ratingValue !== null) {
      // Only create new log if actually rating (not clearing)
      const { data, error } = await supabase
        .from('game_logs')
        .insert({
          user_id: user.id,
          game_id: gameId,
          game_slug: gameSlug,
          game_name: gameName,
          game_cover_id: gameCoverId,
          status: 'played',
          rating: ratingValue,
          review: null,
          favorite: false,
        })
        .select()
        .single()

      if (!error && data) {
        setGameLog(data as GameLog)
      }
    }
    setSaving(false)
    router.refresh()
  }

  async function handleFavorite() {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }

    // Check if already at 5 favorites and trying to add (not remove)
    const isCurrentlyFavorite = gameLog?.favorite || false
    if (!isCurrentlyFavorite && favoriteCount >= 5) {
      // Can't add more - button should be disabled but this is a safety check
      return
    }

    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setSaving(false)
      return
    }

    if (gameLog) {
      // Toggle favorite on existing log
      const { data, error } = await supabase
        .from('game_logs')
        .update({ favorite: !gameLog.favorite })
        .eq('id', gameLog.id)
        .select()
        .single()

      if (!error && data) {
        setGameLog(data as GameLog)
        // Update count
        setFavoriteCount(prev => data.favorite ? prev + 1 : prev - 1)
      }
    } else {
      // Create new log marked as favorite (implies played)
      const { data, error } = await supabase
        .from('game_logs')
        .insert({
          user_id: user.id,
          game_id: gameId,
          game_slug: gameSlug,
          game_name: gameName,
          game_cover_id: gameCoverId,
          status: 'played',
          rating: null,
          review: null,
          favorite: true,
        })
        .select()
        .single()

      if (!error && data) {
        setGameLog(data as GameLog)
        setFavoriteCount(prev => prev + 1)
      }
    }
    setSaving(false)
    router.refresh()
  }

  async function handleSaveReview() {
    if (!isLoggedIn) {
      router.push('/login')
      return
    }

    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setSaving(false)
      return
    }

    if (gameLog) {
      // Update existing log with review
      const { data, error } = await supabase
        .from('game_logs')
        .update({ review: review || null })
        .eq('id', gameLog.id)
        .select()
        .single()

      if (!error && data) {
        setGameLog(data as GameLog)
        setShowReviewForm(false)
      }
    } else {
      // Create new log with review (implies played)
      const { data, error } = await supabase
        .from('game_logs')
        .insert({
          user_id: user.id,
          game_id: gameId,
          game_slug: gameSlug,
          game_name: gameName,
          game_cover_id: gameCoverId,
          status: 'played',
          rating: null,
          review: review || null,
          favorite: false,
        })
        .select()
        .single()

      if (!error && data) {
        setGameLog(data as GameLog)
        setShowReviewForm(false)
      }
    }
    setSaving(false)
    router.refresh()
  }

  async function handleRemoveLog() {
    if (!gameLog) return

    setSaving(true)
    await supabase
      .from('game_logs')
      .delete()
      .eq('id', gameLog.id)

    setGameLog(null)
    setReview('')
    setShowReviewForm(false)
    setSaving(false)
    router.refresh()
  }

  // Calculate display rating
  const displayRating = hoverRating || gameLog?.rating || 0

  if (loading) {
    return (
      <div className="flex flex-wrap gap-3 mt-6">
        <div className="h-12 w-32 bg-background-card rounded-lg animate-pulse" />
        <div className="h-12 w-48 bg-background-card rounded-lg animate-pulse" />
      </div>
    )
  }

  const isWantToPlay = gameLog?.status === 'want_to_play'
  const isPlayed = gameLog?.status === 'played'
  const isFavorite = gameLog?.favorite || false

  return (
    <div className="space-y-4 mt-6">
      {/* Main Actions Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Want to Play Button */}
        <button
          onClick={handleWantToPlay}
          disabled={saving}
          className={`px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            isWantToPlay
              ? 'bg-purple text-white'
              : 'bg-background-card hover:bg-background-secondary text-foreground border border-purple/20'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={isWantToPlay ? "M5 13l4 4L19 7" : "M12 4v16m8-8H4"}
            />
          </svg>
          Want to Play
        </button>

        {/* Favorite Button */}
        {(() => {
          const isFull = favoriteCount >= 5 && !isFavorite
          return (
            <button
              onClick={handleFavorite}
              disabled={saving || isFull}
              className={`px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 border ${
                isFavorite
                  ? 'bg-red-500/20 border-red-500/40 text-red-400'
                  : isFull
                  ? 'bg-background-card border-purple/10 text-foreground-muted/50 cursor-not-allowed'
                  : 'bg-background-card border-purple/20 text-foreground hover:text-red-400'
              }`}
              title={isFull ? 'Remove a favorite from another game first' : ''}
            >
              <svg
                className="w-5 h-5"
                fill={isFavorite ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              {isFavorite ? 'Favorited' : isFull ? 'Favorites Full' : 'Favorite'}
            </button>
          )
        })()}

        {/* Review Button */}
        <button
          onClick={() => setShowReviewForm(!showReviewForm)}
          disabled={saving}
          className={`px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 border ${
            gameLog?.review
              ? 'bg-purple/20 border-purple/40 text-purple-light'
              : 'bg-background-card border-purple/20 text-foreground hover:text-purple'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          {gameLog?.review ? 'Edit Review' : 'Review'}
        </button>
      </div>

      {/* Star Rating Row */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-foreground-muted">Your rating:</span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((starNum) => {
            const currentRating = gameLog?.rating || 0
            const previewRating = hoverRating || currentRating

            // Determine star fill state for display
            const isFull = previewRating >= starNum
            const isHalf = !isFull && previewRating >= starNum - 0.5

            // Click logic: full -> half -> clear
            const handleStarClick = () => {
              // Find which star is currently "active" (the rightmost filled/half star)
              const activeStar = currentRating > 0 ? Math.ceil(currentRating) : 0

              if (starNum === activeStar) {
                // Clicking the active star - cycle through: full -> half -> clear
                if (currentRating === starNum) {
                  // Currently full -> make it half
                  handleRating(starNum - 0.5)
                } else {
                  // Currently half -> clear entirely
                  handleRating(0)
                }
              } else {
                // Clicking a different star -> set to that full star
                handleRating(starNum)
              }
            }

            return (
              <button
                key={`${starNum}-${currentRating}`}
                type="button"
                disabled={saving}
                onClick={handleStarClick}
                onMouseEnter={() => setHoverRating(starNum)}
                onMouseLeave={() => setHoverRating(0)}
                className="relative h-8 w-8 hover:scale-110 transition-transform"
                aria-label={`Rate ${starNum} stars`}
              >
                {/* Empty star (background) */}
                <svg
                  className="absolute top-0 left-0 h-8 w-8 text-foreground-muted/30"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                {/* Half star - using overflow hidden instead of clipPath for mobile Safari */}
                {isHalf && (
                  <div
                    className="absolute top-0 left-0 h-8 overflow-hidden"
                    style={{ width: '50%' }}
                  >
                    <svg
                      className="h-8 w-8 text-gold"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </div>
                )}
                {/* Full star */}
                {isFull && (
                  <svg
                    className="absolute top-0 left-0 h-8 w-8 text-gold"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
        {(hoverRating || (gameLog?.rating ?? 0) > 0) && (
          <span className="text-sm font-medium text-gold min-w-[2rem]">
            {hoverRating || gameLog?.rating}
          </span>
        )}
      </div>

      {/* Status Display */}
      {gameLog && (
        <div className="flex items-center gap-3 text-sm">
          <span className={`px-3 py-1 rounded-full ${
            isPlayed ? 'bg-green-500/20 text-green-400' : 'bg-purple/20 text-purple-light'
          }`}>
            {isPlayed
              ? gameLog.rating
                ? `Played - ${gameLog.rating} star${gameLog.rating === 1 ? '' : 's'}`
                : 'Played'
              : 'Want to Play'
            }
          </span>

          <button
            onClick={handleRemoveLog}
            disabled={saving}
            className="text-foreground-muted hover:text-red-500 transition-colors"
          >
            Remove from library
          </button>
        </div>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <div className="bg-background-card rounded-xl p-4 border border-purple/10">
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Write your thoughts about this game..."
            className="w-full bg-background-secondary border border-purple/20 rounded-lg p-3 text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/20 transition-all resize-none"
            rows={4}
          />
          <div className="flex justify-end gap-3 mt-3">
            <button
              onClick={() => {
                setReview(gameLog?.review || '')
                setShowReviewForm(false)
              }}
              className="px-4 py-2 text-foreground-muted hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveReview}
              disabled={saving || !review.trim()}
              className="px-4 py-2 bg-purple hover:bg-purple-dark disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              {saving ? 'Saving...' : 'Save Review'}
            </button>
          </div>
        </div>
      )}

      {/* Display existing review */}
      {gameLog?.review && !showReviewForm && (
        <div className="bg-background-card rounded-xl p-4 border border-purple/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-foreground-muted">Your review</span>
          </div>
          <p className="text-foreground whitespace-pre-wrap">{gameLog.review}</p>
        </div>
      )}
    </div>
  )
}
