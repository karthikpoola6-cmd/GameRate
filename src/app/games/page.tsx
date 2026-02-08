import Link from 'next/link'
import Image from 'next/image'
import { Navigation } from '@/components/Navigation'
import { getPopularGames, getRecentGames, getCoverUrl, type IGDBGame } from '@/lib/igdb'

export const revalidate = 300 // Cache for 5 minutes

function GameCard({ game }: { game: IGDBGame }) {
  const year = game.first_release_date
    ? new Date(game.first_release_date * 1000).getFullYear()
    : null
  const rating = game.rating ? (game.rating / 20).toFixed(1) : null

  return (
    <Link href={`/game/${game.slug}`} className="group">
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
          {year && <span className="text-xs text-foreground-muted">{year}</span>}
          {rating && <span className="text-xs text-gold">{rating}</span>}
        </div>
      </div>
    </Link>
  )
}

export default async function GamesPage() {
  const [popularGames, recentGames] = await Promise.all([
    getPopularGames(18),
    getRecentGames(18),
  ])

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Browse Games</h1>

          {/* Popular Games */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold mb-4 text-foreground-muted">Popular Games</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {popularGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </section>

          {/* Recent Releases */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-foreground-muted">Recent Releases</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {recentGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
