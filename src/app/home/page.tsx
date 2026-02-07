import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getPopularGames, getCoverUrl, type IGDBGame } from "@/lib/igdb";
import { Navigation } from "@/components/Navigation";
import { ActivityFeed } from "@/components/ActivityFeed";
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
          {year && <span className="text-[10px] sm:text-xs text-foreground-muted">{year}</span>}
          {rating && <span className="text-[10px] sm:text-xs text-gold">{rating}</span>}
        </div>
      </div>
    </Link>
  );
}

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/login');
  }

  // Check if user has completed profile setup
  const { data: profile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', user.id)
    .single();

  // If no profile or username, redirect to setup
  if (!profile?.username) {
    redirect('/setup-username');
  }

  const popularGames = await getPopularGames(16);

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="pt-4 lg:pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Activity Feed */}
          <section className="mb-12">
            <h2 className="text-lg font-medium tracking-wide mb-6">Friend Activity</h2>
            <ActivityFeed userId={user.id} />
          </section>

          {/* Popular Games */}
          <section>
            <h2 className="text-lg font-medium tracking-wide mb-6">Popular Games</h2>
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
