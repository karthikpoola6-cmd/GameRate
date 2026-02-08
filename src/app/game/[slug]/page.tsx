import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getGameBySlug, getCoverUrl, getScreenshotUrl } from "@/lib/igdb";
import { Navigation } from "@/components/Navigation";
import { GameLogButtons } from "@/components/GameLogButtons";
import { AddToListButton } from "@/components/AddToListButton";
import { BackButton } from "@/components/BackButton";
import { PlayedByClient } from "./PlayedByClient";
import { createClient } from "@/lib/supabase/server";


interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function GamePage({ params }: PageProps) {
  const { slug } = await params;
  const game = await getGameBySlug(slug);

  if (!game) {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user: currentUser } } = await supabase.auth.getUser();

  // Get friends who played this game
  let playedByFriends: { id: string; username: string; display_name: string | null; avatar_url: string | null; rating: number | null; review: string | null }[] = [];

  if (currentUser) {
    // Get who the current user follows
    const { data: followingData } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', currentUser.id);

    const followingIds = followingData?.map(f => f.following_id) || [];

    if (followingIds.length > 0) {
      // Get friends who have actually played this game (exclude want_to_play)
      const { data: friendLogs } = await supabase
        .from('game_logs')
        .select('user_id, rating, review, status, profiles:user_id(id, username, display_name, avatar_url)')
        .eq('game_id', game.id)
        .in('user_id', followingIds)
        .neq('status', 'want_to_play')
        .limit(10);

      if (friendLogs) {
        playedByFriends = friendLogs.map(log => ({
          id: (log.profiles as any).id,
          username: (log.profiles as any).username,
          display_name: (log.profiles as any).display_name,
          avatar_url: (log.profiles as any).avatar_url,
          rating: log.rating,
          review: log.review,
        }));
      }
    }
  }

  // Get current user's game log for custom backdrop
  let userGameLog: { id: string; custom_backdrop_id: string | null } | null = null
  if (currentUser) {
    const { data: gameLog } = await supabase
      .from('game_logs')
      .select('id, custom_backdrop_id')
      .eq('user_id', currentUser.id)
      .eq('game_id', game.id)
      .single()
    userGameLog = gameLog
  }

  // Determine which backdrop to display
  const displayBackdropId = userGameLog?.custom_backdrop_id || game.screenshots?.[0]?.image_id

  const releaseYear = game.first_release_date
    ? new Date(game.first_release_date * 1000).getFullYear()
    : null;

  const developers = game.involved_companies?.filter((c) => c.developer) || [];

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Backdrop Screenshot - Letterboxd style */}
      <div className="relative w-full h-[45vh] min-h-[300px]">
        {displayBackdropId ? (
          <>
            <Image
              src={getScreenshotUrl(displayBackdropId, "1080p")}
              alt=""
              fill
              className="object-cover opacity-95"
              priority
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/15 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-purple/20 to-background" />
        )}

        {/* Back button */}
        <BackButton />

        {/* 3 Dots Menu - only show if user has game logged */}
        {userGameLog && game.screenshots && game.screenshots.length > 1 && (
          <Link
            href={`/game/${slug}/backdrop`}
            className="absolute top-3 right-3 z-10 flex items-center gap-1 p-2"
          >
            <span className="w-1.5 h-1.5 bg-white rounded-full drop-shadow-lg" />
            <span className="w-1.5 h-1.5 bg-white rounded-full drop-shadow-lg" />
            <span className="w-1.5 h-1.5 bg-white rounded-full drop-shadow-lg" />
          </Link>
        )}
      </div>

      {/* Main Content - Title left, Poster right */}
      <div className="px-4 -mt-20 relative z-10">
        <div className="max-w-4xl lg:max-w-6xl mx-auto">
          <div className="flex gap-4">
            {/* Left side - Title and info */}
            <div className="flex-1 min-w-0 pt-4">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">{game.name}</h1>

              <div className="flex items-center gap-2 mt-2 text-sm text-foreground-muted">
                {releaseYear && <span>{releaseYear}</span>}
                {developers.length > 0 && (
                  <>
                    <span>•</span>
                    <span>{developers[0].company.name}</span>
                  </>
                )}
              </div>

              {/* Genres */}
              {game.genres && game.genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {game.genres.slice(0, 3).map((genre) => (
                    <span
                      key={genre.id}
                      className="px-2 py-0.5 bg-purple/20 text-purple-light rounded text-xs"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Right side - Poster */}
            <div className="flex-shrink-0">
              <div className="relative w-28 sm:w-32 lg:w-44 aspect-[3/4] bg-background-card rounded-lg overflow-hidden shadow-xl ring-1 ring-white/10">
                {game.cover?.image_id ? (
                  <Image
                    src={getCoverUrl(game.cover.image_id)}
                    alt={game.name}
                    fill
                    className="object-cover"
                    priority
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-purple/20 to-purple-dark/40 flex items-center justify-center">
                    <span className="text-3xl">🎮</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Rating display */}
          {game.rating && (
            <div className="mt-4 flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => {
                  const normalizedRating = game.rating! / 20;
                  const fill = Math.min(1, Math.max(0, normalizedRating - star + 1));
                  return (
                    <span key={star} className="relative w-4 h-4">
                      <span className="absolute text-foreground-muted/30 text-base">★</span>
                      {fill > 0 && (
                        <span
                          className="absolute text-gold text-base overflow-hidden"
                          style={{ width: `${fill * 100}%` }}
                        >
                          ★
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
              <span className="text-foreground-muted text-sm">
                {(game.rating / 20).toFixed(1)}
              </span>
              {game.rating_count && (
                <span className="text-foreground-muted/60 text-xs">
                  ({game.rating_count.toLocaleString()})
                </span>
              )}
            </div>
          )}

          {/* Game Actions */}
          <GameLogButtons
            gameId={game.id}
            gameSlug={slug}
            gameName={game.name}
            gameCoverId={game.cover?.image_id || null}
          />

          {/* Add to List */}
          <div className="mt-4">
            <AddToListButton
              game={{
                id: game.id,
                slug: slug,
                name: game.name,
                cover_id: game.cover?.image_id,
              }}
            />
          </div>

          {/* Summary */}
          {game.summary && (
            <div className="mt-6">
              <p className="text-foreground-muted text-sm leading-relaxed line-clamp-4">
                {game.summary}
              </p>
            </div>
          )}

          {/* Played By Friends */}
          {playedByFriends.length > 0 && (
            <div className="mt-8 pt-6 border-t border-purple/10">
              <h3 className="text-xs uppercase tracking-wider text-foreground-muted mb-3">Played by</h3>
              <PlayedByClient friends={playedByFriends} gameName={game.name} />
            </div>
          )}

          {/* Screenshots */}
          {game.screenshots && game.screenshots.length > 1 && (
            <div className="mt-8">
              <h3 className="text-xs uppercase tracking-wider text-foreground-muted mb-3">Screenshots</h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                {game.screenshots.slice(1, 7).map((screenshot) => (
                  <div
                    key={screenshot.id}
                    className="relative aspect-video bg-background-card rounded-lg overflow-hidden"
                  >
                    <Image
                      src={getScreenshotUrl(screenshot.image_id, "screenshot_big")}
                      alt={`${game.name} screenshot`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Game Details */}
          <div className="mt-8 pb-8">
            <h3 className="text-xs uppercase tracking-wider text-foreground-muted mb-3">Details</h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              {developers.length > 0 && (
                <div>
                  <span className="text-foreground-muted">Developer</span>
                  <p className="text-foreground">{developers.map(d => d.company.name).join(', ')}</p>
                </div>
              )}
              {game.platforms && game.platforms.length > 0 && (
                <div>
                  <span className="text-foreground-muted">Platforms</span>
                  <p className="text-foreground">
                    {game.platforms.slice(0, 4).map(p => p.abbreviation || p.name).join(', ')}
                  </p>
                </div>
              )}
              {game.aggregated_rating && (
                <div>
                  <span className="text-foreground-muted">Critics</span>
                  <p className="text-foreground">{Math.round(game.aggregated_rating)}/100</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const game = await getGameBySlug(slug);

  if (!game) {
    return {
      title: "Game Not Found | GameRate",
    };
  }

  return {
    title: `${game.name} | GameRate`,
    description: game.summary?.slice(0, 160) || `View details about ${game.name} on GameRate`,
  };
}
