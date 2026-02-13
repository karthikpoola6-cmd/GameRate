'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import type { GameLog } from '@/lib/types'

interface GameLogButtonsProps {
  gameId: number
  gameSlug: string
  gameName: string
  gameCoverId: string | null
  initialGameLog?: GameLog | null
  initialFavoriteCount?: number
  userId?: string | null
}

export function GameLogButtons({ gameId, gameSlug, gameName, gameCoverId, initialGameLog = null, initialFavoriteCount = 0, userId: initialUserId = null }: GameLogButtonsProps) {
  const [userId] = useState<string | null>(initialUserId)
  const [gameLog, setGameLog] = useState<GameLog | null>(initialGameLog)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [review, setReview] = useState(initialGameLog?.review || '')
  const [saving, setSaving] = useState(false)
  const [favoriteCount, setFavoriteCount] = useState(initialFavoriteCount)
  const router = useRouter()
  const supabase = createClient()

  async function handleWantToPlay() {
    if (!userId) {
      router.push('/login')
      return
    }

    setSaving(true)

    if (gameLog?.status === 'want_to_play') {
      // Remove from want to play
      await supabase
        .from('game_logs')
        .delete()
        .eq('id', gameLog.id)
      setGameLog(null)
      toast.success('Removed from Want to Play')
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
        toast.success('Added to Want to Play')
      }
    } else {
      // Add new want to play
      const { data, error } = await supabase
        .from('game_logs')
        .insert({
          user_id: userId,
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
        toast.success('Added to Want to Play')
      }
    }
    setSaving(false)
  }

  async function handleRating(rating: number) {
    if (!userId) {
      router.push('/login')
      return
    }

    setSaving(true)

    // Handle clearing rating (rating = 0)
    if (rating === 0) {
      if (gameLog) {
        // If game is a favorite, keep the log but clear the rating
        if (gameLog.favorite) {
          const { data, error } = await supabase
            .from('game_logs')
            .update({ rating: null })
            .eq('id', gameLog.id)
            .select()
            .single()

          if (!error && data) {
            setGameLog(data as GameLog)
            toast.success('Rating cleared')
          }
        } else {
          // Not a favorite - delete the log entirely
          await supabase
            .from('game_logs')
            .delete()
            .eq('id', gameLog.id)
          setGameLog(null)
          toast.success('Rating cleared')
        }
      }
      setSaving(false)
      return
    }

    if (gameLog) {
      // Update existing log
      const { data, error } = await supabase
        .from('game_logs')
        .update({
          status: 'played',
          rating: rating,
        })
        .eq('id', gameLog.id)
        .select()
        .single()

      if (!error && data) {
        setGameLog(data as GameLog)
      }
    } else {
      // Only create new log if actually rating (not clearing)
      const { data, error } = await supabase
        .from('game_logs')
        .insert({
          user_id: userId,
          game_id: gameId,
          game_slug: gameSlug,
          game_name: gameName,
          game_cover_id: gameCoverId,
          status: 'played',
          rating: rating,
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
  }

  async function handleFavorite() {
    if (!userId) {
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

    if (gameLog) {
      // Toggle favorite on existing log
      const newFavorite = !gameLog.favorite
      const { data, error } = await supabase
        .from('game_logs')
        .update({
          favorite: newFavorite,
          favorite_position: newFavorite ? favoriteCount + 1 : null,
        })
        .eq('id', gameLog.id)
        .select()
        .single()

      if (!error && data) {
        setGameLog(data as GameLog)
        // Update count
        setFavoriteCount(prev => data.favorite ? prev + 1 : prev - 1)
        toast.success(data.favorite ? 'Added to favorites' : 'Removed from favorites')
      }
    } else {
      // Create new log marked as favorite (implies played)
      const { data, error } = await supabase
        .from('game_logs')
        .insert({
          user_id: userId,
          game_id: gameId,
          game_slug: gameSlug,
          game_name: gameName,
          game_cover_id: gameCoverId,
          status: 'played',
          rating: null,
          review: null,
          favorite: true,
          favorite_position: favoriteCount + 1,
        })
        .select()
        .single()

      if (!error && data) {
        setGameLog(data as GameLog)
        setFavoriteCount(prev => prev + 1)
        toast.success('Added to favorites')
      }
    }
    setSaving(false)
  }

  async function handleSaveReview() {
    if (!userId) {
      router.push('/login')
      return
    }

    setSaving(true)

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
        toast.success('Review saved')
      }
    } else {
      // Create new log with review (implies played)
      const { data, error } = await supabase
        .from('game_logs')
        .insert({
          user_id: userId,
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
        toast.success('Review saved')
      }
    }
    setSaving(false)
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
    toast.success('Removed from library')
  }

  const isWantToPlay = gameLog?.status === 'want_to_play'
  const isPlayed = gameLog?.status === 'played'
  const isFavorite = gameLog?.favorite || false

  return (
    <div className="space-y-4 mt-6">
      {/* Main Actions Row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Want to Play Button */}
        <Button
          onClick={handleWantToPlay}
          disabled={saving}
          variant={isWantToPlay ? 'default' : 'outline'}
          size="sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d={isWantToPlay ? "M5 13l4 4L19 7" : "M12 4v16m8-8H4"}
            />
          </svg>
          {isWantToPlay ? 'Want to Play' : 'Want to Play'}
        </Button>

        {/* Favorite Button */}
        {(() => {
          const isFull = favoriteCount >= 5 && !isFavorite
          return (
            <Button
              onClick={handleFavorite}
              disabled={saving || isFull}
              variant="outline"
              size="sm"
              className={isFavorite ? 'border-red-500/40 text-red-400' : ''}
              title={isFull ? 'Remove a favorite from another game first' : ''}
            >
              <svg
                className="w-4 h-4"
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
              {isFavorite ? 'Favorited' : isFull ? 'Full (5/5)' : 'Favorite'}
            </Button>
          )
        })()}

        {/* Review Button */}
        <Button
          onClick={() => setShowReviewForm(!showReviewForm)}
          disabled={saving}
          variant={gameLog?.review ? 'default' : 'outline'}
          size="sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          {gameLog?.review ? 'Edit' : 'Review'}
        </Button>
      </div>

      {/* Star Rating Row */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-foreground-muted">Your rating:</span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((starNum) => {
            const currentRating = gameLog?.rating || 0

            // Determine star fill state for display
            const isFull = currentRating >= starNum
            const isHalf = !isFull && currentRating >= starNum - 0.5

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
                key={starNum}
                type="button"
                disabled={saving}
                onClick={handleStarClick}
                className="relative h-8 w-8"
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
                {/* Half star */}
                {isHalf && (
                  <svg
                    className="absolute top-0 left-0 h-8 w-8 text-gold"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    style={{ clipPath: 'inset(0 50% 0 0)' }}
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
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
        {(gameLog?.rating ?? 0) > 0 && (
          <span className="text-sm font-medium text-gold min-w-[2rem]">
            {gameLog?.rating}
          </span>
        )}
        {!gameLog?.rating && (
          <span className="text-xs text-foreground-muted/40">Tap twice for half</span>
        )}
      </div>

      {/* Status Display */}
      {gameLog && (
        <div className="flex items-center gap-3 text-sm">
          <Badge variant={isPlayed ? 'default' : 'secondary'} className={isPlayed ? 'bg-green-500/20 text-green-400 border-green-500/30' : ''}>
            {isPlayed
              ? gameLog.rating
                ? `Played - ${gameLog.rating}★`
                : 'Played'
              : 'Want to Play'
            }
          </Badge>

          <Button
            variant="ghost"
            size="xs"
            onClick={handleRemoveLog}
            disabled={saving}
            className="text-foreground-muted"
          >
            Remove
          </Button>
        </div>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <div className="glass rounded-xl p-4 border border-purple/10">
          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Write your thoughts about this game..."
            className="w-full bg-background-secondary border border-purple/20 rounded-lg p-3 text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/20 resize-none"
            rows={4}
          />
          <div className="flex justify-end gap-2 mt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setReview(gameLog?.review || '')
                setShowReviewForm(false)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveReview}
              disabled={saving || !review.trim()}
              size="sm"
            >
              {saving ? 'Saving...' : 'Save Review'}
            </Button>
          </div>
        </div>
      )}

      {/* Display existing review */}
      {gameLog?.review && !showReviewForm && (
        <div className="glass rounded-xl p-4 border border-purple/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-foreground-muted">Your review</span>
          </div>
          <p className="text-foreground whitespace-pre-wrap">{gameLog.review}</p>
        </div>
      )}
    </div>
  )
}
