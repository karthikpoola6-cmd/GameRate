'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { getCoverUrl } from '@/lib/igdb'

interface SearchResult {
  id: number
  name: string
  slug: string
  cover?: { image_id: string }
  first_release_date?: number
}

interface AddGameToListProps {
  listId: string
  onGameAdded: (game: {
    id: string
    game_id: number
    game_slug: string
    game_name: string
    game_cover_id: string | null
    position: number
    notes: string | null
  }) => void
  currentItemCount: number
}

export function AddGameToList({ listId, onGameAdded, currentItemCount }: AddGameToListProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [adding, setAdding] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Search for games
  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        setResults(data.results || [])
      } catch {
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setQuery('')
        setResults([])
        setError(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  async function handleAddGame(game: SearchResult) {
    setAdding(game.id)
    setError(null)

    try {
      const response = await fetch(`/api/lists/${listId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_id: game.id,
          game_slug: game.slug,
          game_name: game.name,
          game_cover_id: game.cover?.image_id || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        if (response.status === 409) {
          setError('Game already in list')
        } else {
          setError(data.error || 'Failed to add game')
        }
        setAdding(null)
        return
      }

      const data = await response.json()

      // Notify parent of new item
      onGameAdded({
        id: data.item.id,
        game_id: game.id,
        game_slug: game.slug,
        game_name: game.name,
        game_cover_id: game.cover?.image_id || null,
        position: currentItemCount,
        notes: null,
      })

      // Reset and close
      setQuery('')
      setResults([])
      setIsOpen(false)
      setError(null)
    } catch {
      setError('Something went wrong')
    } finally {
      setAdding(null)
    }
  }

  const getYear = (timestamp?: number) => {
    if (!timestamp) return null
    return new Date(timestamp * 1000).getFullYear()
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-purple hover:bg-purple-dark text-white rounded-lg font-medium transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Game
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-background-card border border-purple/20 rounded-lg shadow-xl z-50">
          {/* Search input */}
          <div className="p-3 border-b border-purple/10">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for a game..."
                className="w-full bg-background-secondary border border-purple/20 rounded-lg py-2 px-4 pl-10 text-sm text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:border-purple"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {isLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-purple/30 border-t-purple rounded-full animate-spin" />
                </div>
              )}
            </div>
            {error && (
              <p className="text-red-400 text-xs mt-2">{error}</p>
            )}
          </div>

          {/* Results */}
          <div className="max-h-64 overflow-y-auto">
            {query.length < 2 ? (
              <p className="text-center text-foreground-muted text-sm py-6">
                Type to search games
              </p>
            ) : results.length === 0 && !isLoading ? (
              <p className="text-center text-foreground-muted text-sm py-6">
                No games found
              </p>
            ) : (
              results.map((game) => (
                <button
                  key={game.id}
                  onClick={() => handleAddGame(game)}
                  disabled={adding === game.id}
                  className="w-full flex items-center gap-3 p-3 text-left hover:bg-background-secondary transition-colors disabled:opacity-50"
                >
                  <div className="w-10 h-14 bg-background-secondary rounded overflow-hidden flex-shrink-0">
                    {game.cover?.image_id ? (
                      <Image
                        src={getCoverUrl(game.cover.image_id, 'cover_small')}
                        alt={game.name}
                        width={40}
                        height={56}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-foreground-muted">
                        🎮
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{game.name}</p>
                    {getYear(game.first_release_date) && (
                      <p className="text-xs text-foreground-muted">{getYear(game.first_release_date)}</p>
                    )}
                  </div>
                  {adding === game.id ? (
                    <div className="w-4 h-4 border-2 border-purple/30 border-t-purple rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
