import Link from 'next/link'
import Image from 'next/image'
import { Navigation } from '@/components/Navigation'
import { SearchBar } from '@/components/SearchBar'
import { searchGames, getGamesByGenre, getCoverUrl } from '@/lib/igdb'

// IGDB Genre IDs
const GENRES = [
  { id: 12, name: 'Role-playing (RPG)', slug: 'rpg' },
  { id: 5, name: 'Shooter', slug: 'shooter' },
  { id: 31, name: 'Adventure', slug: 'adventure' },
  { id: 8, name: 'Platform', slug: 'platform' },
  { id: 4, name: 'Fighting', slug: 'fighting' },
  { id: 14, name: 'Sport', slug: 'sport' },
  { id: 10, name: 'Racing', slug: 'racing' },
  { id: 15, name: 'Strategy', slug: 'strategy' },
  { id: 32, name: 'Indie', slug: 'indie' },
  { id: 9, name: 'Puzzle', slug: 'puzzle' },
]


export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; genre?: string }>
}) {
  const { q: query, genre: genreSlug } = await searchParams

  const selectedGenre = genreSlug ? GENRES.find(g => g.slug === genreSlug) : null
  const results = query ? await searchGames(query, 24) : []
  const genreGames = selectedGenre ? await getGamesByGenre(selectedGenre.id) : []

  const getYear = (timestamp?: number) => {
    if (!timestamp) return null
    return new Date(timestamp * 1000).getFullYear()
  }

  const getRating = (rating?: number) => {
    if (!rating) return null
    return (rating / 20).toFixed(1)
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Search Input */}
          <div className="max-w-2xl mx-auto mb-8">
            <h1 className="text-2xl font-medium tracking-wide mb-6 text-center">Search Games</h1>
            <SearchBar variant="hero" placeholder="Search for a game..." />
          </div>

          {/* Genre Navigation */}
          {!query && !selectedGenre && (
            <div className="max-w-2xl mx-auto mb-8">
              <h2 className="text-lg font-medium tracking-wide mb-3">Browse by Genre</h2>
              <div className="glass border border-purple/10 rounded-lg overflow-hidden">
                {GENRES.map((genre, index) => (
                  <Link
                    key={genre.id}
                    href={`/search?genre=${genre.slug}`}
                    className={`flex items-center justify-between py-3 px-4 ${
                      index < GENRES.length - 1 ? 'border-b border-purple/10' : ''
                    }`}
                  >
                    <span className="font-medium">{genre.name}</span>
                    <span className="text-foreground-muted text-sm">→</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Genre Results */}
          {selectedGenre && !query && (
            <>
              <div className="flex items-center gap-4 mb-6">
                <Link
                  href="/search"
                  className="text-purple text-sm"
                >
                  ← Back to genres
                </Link>
              </div>
              <h2 className="text-xl font-medium tracking-wide mb-6">Top {selectedGenre.name} Games</h2>

              {genreGames.length > 0 ? (
                <div
                  className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-4"
                >
                  {genreGames.map((game) => (
                    <Link key={game.id} href={`/game/${game.slug}`}>
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
                          {getYear(game.first_release_date) && (
                            <span className="text-[10px] sm:text-xs text-foreground-muted">{getYear(game.first_release_date)}</span>
                          )}
                          {getRating(game.rating) && (
                            <span className="text-[10px] sm:text-xs text-gold">{getRating(game.rating)}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-foreground-muted text-center">No games found for this genre</p>
              )}
            </>
          )}

          {/* Search Results */}
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
                      <div className="relative aspect-[3/4] bg-background-card rounded-lg overflow-hidden">
                        {game.cover?.image_id ? (
                          <Image
                            src={getCoverUrl(game.cover.image_id)}
                            alt={game.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                            loading="lazy"
                            unoptimized
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-purple/20 to-purple-dark/40 flex items-center justify-center">
                            <span className="text-4xl">🎮</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-2">
                        <h3 className="text-sm font-medium text-foreground truncate">
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

          {!query && !selectedGenre && (
            <p className="text-foreground-muted text-center mt-4">Enter a game title to search or browse by genre</p>
          )}
        </div>
      </main>
    </div>
  )
}
