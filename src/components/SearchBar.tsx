'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { getCoverUrl } from '@/lib/igdb'

interface SearchResult {
  id: number
  name: string
  slug: string
  cover?: { image_id: string }
  first_release_date?: number
}

interface SearchBarProps {
  variant?: 'nav' | 'hero'
  placeholder?: string
}

export function SearchBar({ variant = 'nav', placeholder = 'Search games...' }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      setIsOpen(false)
      return
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        setResults(data.results || [])
        setIsOpen(true)
        setSelectedIndex(-1)
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && results[selectedIndex]) {
          navigateToGame(results[selectedIndex].slug)
        } else if (query.length >= 2) {
          router.push(`/search?q=${encodeURIComponent(query)}`)
          setIsOpen(false)
        }
        break
      case 'Escape':
        setIsOpen(false)
        inputRef.current?.blur()
        break
    }
  }

  const navigateToGame = (slug: string) => {
    router.push(`/game/${slug}`)
    setQuery('')
    setIsOpen(false)
  }

  const getYear = (timestamp?: number) => {
    if (!timestamp) return null
    return new Date(timestamp * 1000).getFullYear()
  }

  const isHero = variant === 'hero'

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className={`
            w-full bg-background-secondary border border-purple/20
            text-foreground placeholder:text-foreground-muted/50
            focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/20
           
            ${isHero
              ? 'rounded-full py-4 px-6 pl-12'
              : 'rounded-lg py-2 px-4 pl-10 text-sm'
            }
          `}
        />
        <svg
          className={`absolute top-1/2 -translate-y-1/2 text-foreground-muted ${isHero ? 'left-4 w-5 h-5' : 'left-3 w-4 h-4'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        {isLoading && (
          <div className={`absolute top-1/2 -translate-y-1/2 ${isHero ? 'right-4' : 'right-3'}`}>
            <div className="w-4 h-4 border-2 border-purple/30 border-t-purple rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 glass border border-purple/20 rounded-lg shadow-xl overflow-hidden z-50">
          {results.map((result, index) => (
            <button
              key={result.id}
              onClick={() => navigateToGame(result.slug)}
              className={`
                w-full flex items-center gap-3 p-3 text-left
                ${index === selectedIndex ? 'bg-purple/20' : ''}
              `}
            >
              <div className="w-10 h-14 bg-background-secondary rounded overflow-hidden flex-shrink-0">
                {result.cover?.image_id ? (
                  <Image
                    src={getCoverUrl(result.cover.image_id, 'cover_small')}
                    alt={result.name}
                    width={40}
                    height={56}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-foreground-muted">
                    <span className="text-lg">🎮</span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{result.name}</p>
                {getYear(result.first_release_date) && (
                  <p className="text-xs text-foreground-muted">{getYear(result.first_release_date)}</p>
                )}
              </div>
            </button>
          ))}

          {/* See all results */}
          <button
            onClick={() => {
              router.push(`/search?q=${encodeURIComponent(query)}`)
              setIsOpen(false)
            }}
            className="w-full p-3 text-sm text-purple border-t border-purple/10"
          >
            See all results for &quot;{query}&quot;
          </button>
        </div>
      )}

      {/* No results message */}
      {isOpen && query.length >= 2 && !isLoading && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 glass border border-purple/20 rounded-lg shadow-xl p-4 z-50">
          <p className="text-sm text-foreground-muted text-center">No games found for &quot;{query}&quot;</p>
        </div>
      )}
    </div>
  )
}
