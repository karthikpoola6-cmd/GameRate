'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export function PlayerSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        router.push(`/players?q=${encodeURIComponent(query.trim())}`)
      } else {
        router.push('/players')
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, router])

  return (
    <div className="relative w-full">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by username..."
        className="w-full bg-background-secondary border border-purple/20 rounded-lg py-3 px-4 pl-11 text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/20 transition-all"
      />
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted"
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
    </div>
  )
}
