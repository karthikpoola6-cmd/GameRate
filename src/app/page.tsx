import Link from "next/link";
import Image from "next/image";
import { getPopularGames, getCoverUrl, type IGDBGame } from "@/lib/igdb";
import { Navigation } from "@/components/Navigation";
import { ActivityFeed } from "@/components/ActivityFeed";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic'

function GameCard({ game }: { game: IGDBGame }) {
  const year = game.first_release_date
    ? new Date(game.first_release_date * 1000).getFullYear()
    : null;
  const rating = game.rating ? (game.rating / 20).toFixed(1) : null;

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
  );
}

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const popularGames = await getPopularGames(12);

  // Logged-in user view
  if (user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />

        <main className="pt-4 lg:pt-24 pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Activity Feed */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Friend Activity</h2>
              <ActivityFeed userId={user.id} />
            </section>

            {/* Popular Games */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Popular Games</h2>
                <Link href="/games" className="text-purple hover:text-purple-light transition-colors text-sm">
                  View all →
                </Link>
              </div>
              <div
                className="gap-2 sm:gap-4"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))'
                }}
              >
                {popularGames.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>
    );
  }

  // Logged-out user view
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Track games you&apos;ve{" "}
            <span className="bg-gradient-to-r from-purple to-purple-light bg-clip-text text-transparent">
              played
            </span>
            .
            <br />
            Save those you{" "}
            <span className="bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent">
              want
            </span>
            .
          </h1>
          <p className="text-lg text-foreground-muted mb-10 max-w-2xl mx-auto">
            The social network for gamers. Rate and review games, create lists, follow friends, and discover your next favorite game.
          </p>

          <Button size="lg" asChild>
            <Link href="/signup">Get started — it&apos;s free</Link>
          </Button>
        </div>
      </section>

      {/* Featured Games */}
      <section className="py-16 px-4 bg-background-secondary/50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Popular Games</h2>
            <Link href="/games" className="text-purple hover:text-purple-light transition-colors text-sm">
              View all →
            </Link>
          </div>

          <div
            className="gap-2 sm:gap-4"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))'
            }}
          >
            {popularGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Your gaming journey,{" "}
            <span className="text-purple">organized</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-background-card rounded-xl p-6 border border-purple/10">
              <div className="w-12 h-12 bg-purple/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Rate & Review</h3>
              <p className="text-foreground-muted">
                Keep a diary of every game you play. Rate them, write reviews, and track your gaming history.
              </p>
            </div>

            <div className="bg-background-card rounded-xl p-6 border border-purple/10">
              <div className="w-12 h-12 bg-gold/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Lists</h3>
              <p className="text-foreground-muted">
                Organize games into lists. Best RPGs, hidden gems, games to play - whatever you want.
              </p>
            </div>

            <div className="bg-background-card rounded-xl p-6 border border-purple/10">
              <div className="w-12 h-12 bg-purple/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Follow Friends</h3>
              <p className="text-foreground-muted">
                See what your friends are playing, get recommendations, and share your gaming taste.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-background-secondary/50 to-background">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to start tracking?</h2>
          <p className="text-foreground-muted mb-8">
            Join thousands of gamers who use SavePoint to track their gaming journey.
          </p>
          <Button size="lg" asChild>
            <Link href="/signup">Get started — it&apos;s free</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-purple/10">
        <div className="max-w-6xl mx-auto text-center">
          <span className="text-foreground-muted text-sm">
            © 2025 SavePoint. Built for gamers.
          </span>
        </div>
      </footer>
    </div>
  );
}
