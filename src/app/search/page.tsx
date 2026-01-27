import Link from 'next/link'
import Image from 'next/image'
import { Navigation } from '@/components/Navigation'
import { SearchBar } from '@/components/SearchBar'
import { getCoverUrl } from '@/lib/igdb'

const TWITCH_AUTH_URL = 'https://id.twitch.tv/oauth2/token'
const IGDB_API_URL = 'https://api.igdb.com/v4'

let cachedToken: { token: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 300000) {
    return cachedToken.token
  }

  const clientId = process.env.TWITCH_CLIENT_ID
  const clientSecret = process.env.TWITCH_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Missing TWITCH_CLIENT_ID or TWITCH_CLIENT_SECRET')
  }

  const response = await fetch(TWITCH_AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to get Twitch access token: ${response.statusText}`)
  }

  const data = await response.json()
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  }

  return cachedToken.token
}

interface SearchResult {
  id: number
  name: string
  slug: string
  cover?: { image_id: string }
  first_release_date?: number
  rating?: number
  genres?: { name: string }[]
}

async function searchGames(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return []

  const accessToken = await getAccessToken()
  const clientId = process.env.TWITCH_CLIENT_ID!

  const response = await fetch(`${IGDB_API_URL}/games`, {
    method: 'POST',
    headers: {
      'Client-ID': clientId,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'text/plain',
    },
    body: `
      search "${query}";
      fields name, slug, cover.image_id, first_release_date, rating, genres.name;
      limit 24;
    `,
  })

  if (!response.ok) {
    throw new Error(`IGDB API error: ${response.statusText}`)
  }

  return response.json()
}

export const dynamic = 'force-dynamic'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q: query } = await searchParams
  const results = query ? await searchGames(query) : []

  const getYear = (timestamp?: number) => {
    if (!timestamp) return null
    return new Date(timestamp * 1000).getFullYear()
  }

  const getRating = (rating?: number) => {
    if (!rating) return null
    return (rating / 20).toFixed(1)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Search Input */}
          <div className="max-w-2xl mx-auto mb-12">
            <h1 className="text-3xl font-bold mb-6 text-center">Search Games</h1>
            <SearchBar variant="hero" placeholder="Search for a game..." />
          </div>

          {/* Results */}
          {query && (
            <>
              <p className="text-foreground-muted mb-6">
                {results.length > 0
                  ? `Found ${results.length} results for "${query}"`
                  : `No results found for "${query}"`}
              </p>

              {results.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {results.map((game) => (
                    <Link key={game.id} href={`/game/${game.slug}`} className="group">
                      <div className="relative aspect-[3/4] bg-background-card rounded-lg overflow-hidden transition-transform duration-200 group-hover:scale-105 group-hover:ring-2 group-hover:ring-purple">
                        {game.cover?.image_id ? (
                          <Image
                            src={getCoverUrl(game.cover.image_id)}
                            alt={game.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                            unoptimized
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-purple/20 to-purple-dark/40 flex items-center justify-center">
                            <span className="text-4xl">🎮</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-2">
                        <h3 className="text-sm font-medium text-foreground truncate group-hover:text-purple-light transition-colors">
                          {game.name}
                        </h3>
                        <div className="flex items-center justify-between mt-1">
                          {getYear(game.first_release_date) && (
                            <span className="text-xs text-foreground-muted">{getYear(game.first_release_date)}</span>
                          )}
                          {getRating(game.rating) && (
                            <span className="text-xs text-gold">{getRating(game.rating)}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}

          {!query && (
            <p className="text-foreground-muted text-center">Enter a game title to search</p>
          )}
        </div>
      </main>
    </div>
  )
}
