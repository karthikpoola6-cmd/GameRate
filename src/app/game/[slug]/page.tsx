import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getGameBySlug, getCoverUrl, getScreenshotUrl, type IGDBGame } from "@/lib/igdb";
import { Navigation } from "@/components/Navigation";
import { GameLogButtons } from "@/components/GameLogButtons";
import { AddToListButton } from "@/components/AddToListButton";

// Website category mapping from IGDB
const WEBSITE_CATEGORIES: Record<number, { name: string; icon: string }> = {
  1: { name: "Official", icon: "🌐" },
  2: { name: "Wikia", icon: "📖" },
  3: { name: "Wikipedia", icon: "📚" },
  4: { name: "Facebook", icon: "📘" },
  5: { name: "Twitter", icon: "🐦" },
  6: { name: "Twitch", icon: "📺" },
  8: { name: "Instagram", icon: "📷" },
  9: { name: "YouTube", icon: "▶️" },
  10: { name: "iPhone", icon: "📱" },
  11: { name: "iPad", icon: "📱" },
  12: { name: "Android", icon: "🤖" },
  13: { name: "Steam", icon: "🎮" },
  14: { name: "Reddit", icon: "🔴" },
  15: { name: "Itch", icon: "🎯" },
  16: { name: "Epic Games", icon: "🎮" },
  17: { name: "GOG", icon: "🎮" },
  18: { name: "Discord", icon: "💬" },
};

function StarRating({ rating, size = "default" }: { rating: number; size?: "default" | "large" }) {
  const normalizedRating = rating / 20;
  const fullStars = Math.floor(normalizedRating);
  const hasHalf = normalizedRating % 1 >= 0.5;
  const starSize = size === "large" ? "w-6 h-6" : "w-4 h-4";

  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`${starSize} ${
            i < fullStars
              ? "text-gold"
              : i === fullStars && hasHalf
              ? "text-gold"
              : "text-foreground-muted/30"
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className={`ml-2 ${size === "large" ? "text-xl font-semibold" : "text-sm"} text-foreground-muted`}>
        {normalizedRating.toFixed(1)}
      </span>
    </div>
  );
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function GamePage({ params }: PageProps) {
  const { slug } = await params;
  const game = await getGameBySlug(slug);

  if (!game) {
    notFound();
  }

  const releaseYear = game.first_release_date
    ? new Date(game.first_release_date * 1000).getFullYear()
    : null;

  const releaseDate = game.first_release_date
    ? new Date(game.first_release_date * 1000).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  const developers = game.involved_companies?.filter((c) => c.developer) || [];
  const publishers = game.involved_companies?.filter((c) => c.publisher) || [];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section with Screenshot Background */}
      <div className="relative pt-16">
        {/* Background Screenshot */}
        {game.screenshots && game.screenshots.length > 0 && (
          <div className="absolute inset-0 h-[450px] overflow-hidden">
            <Image
              src={getScreenshotUrl(game.screenshots[0].image_id, "1080p")}
              alt=""
              fill
              className="object-cover opacity-50"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
          </div>
        )}

        {/* Game Info */}
        <div className="relative max-w-6xl mx-auto px-4 pt-12 pb-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Cover Art */}
            <div className="flex-shrink-0">
              <div className="relative w-64 aspect-[3/4] bg-background-card rounded-lg overflow-hidden shadow-2xl ring-1 ring-purple/20">
                {game.cover?.image_id ? (
                  <Image
                    src={getCoverUrl(game.cover.image_id)}
                    alt={game.name}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-purple/20 to-purple-dark/40 flex items-center justify-center">
                    <span className="text-6xl">🎮</span>
                  </div>
                )}
              </div>
            </div>

            {/* Game Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-4 flex-wrap">
                <h1 className="text-4xl md:text-5xl font-bold">{game.name}</h1>
                {releaseYear && (
                  <span className="text-2xl text-foreground-muted font-light mt-2">
                    ({releaseYear})
                  </span>
                )}
              </div>

              {/* Genres */}
              {game.genres && game.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {game.genres.map((genre) => (
                    <span
                      key={genre.id}
                      className="px-3 py-1 bg-purple/20 text-purple-light rounded-full text-sm"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Rating */}
              {game.rating && (
                <div className="mt-6">
                  <StarRating rating={game.rating} size="large" />
                  {game.rating_count && (
                    <p className="text-sm text-foreground-muted mt-1">
                      Based on {game.rating_count.toLocaleString()} ratings
                    </p>
                  )}
                </div>
              )}

              {/* Game Logging Actions */}
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
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Summary */}
            {game.summary && (
              <section>
                <h2 className="text-xl font-semibold mb-4">About</h2>
                <p className="text-foreground-muted leading-relaxed">{game.summary}</p>
              </section>
            )}

            {/* Storyline */}
            {game.storyline && (
              <section>
                <h2 className="text-xl font-semibold mb-4">Storyline</h2>
                <p className="text-foreground-muted leading-relaxed">{game.storyline}</p>
              </section>
            )}

            {/* Screenshots */}
            {game.screenshots && game.screenshots.length > 1 && (
              <section>
                <h2 className="text-xl font-semibold mb-4">Screenshots</h2>
                <div className="grid grid-cols-2 gap-4">
                  {game.screenshots.slice(1, 5).map((screenshot) => (
                    <div
                      key={screenshot.id}
                      className="relative aspect-video bg-background-card rounded-lg overflow-hidden"
                    >
                      <Image
                        src={getScreenshotUrl(screenshot.image_id, "screenshot_big")}
                        alt={`${game.name} screenshot`}
                        fill
                        className="object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Game Info Card */}
            <div className="bg-background-card rounded-xl p-6 border border-purple/10">
              <h3 className="text-lg font-semibold mb-4">Game Info</h3>

              <dl className="space-y-4">
                {releaseDate && (
                  <div>
                    <dt className="text-sm text-foreground-muted">Release Date</dt>
                    <dd className="text-foreground mt-1">{releaseDate}</dd>
                  </div>
                )}

                {developers.length > 0 && (
                  <div>
                    <dt className="text-sm text-foreground-muted">
                      {developers.length > 1 ? "Developers" : "Developer"}
                    </dt>
                    <dd className="text-foreground mt-1">
                      {developers.map((c) => c.company.name).join(", ")}
                    </dd>
                  </div>
                )}

                {publishers.length > 0 && (
                  <div>
                    <dt className="text-sm text-foreground-muted">
                      {publishers.length > 1 ? "Publishers" : "Publisher"}
                    </dt>
                    <dd className="text-foreground mt-1">
                      {publishers.map((c) => c.company.name).join(", ")}
                    </dd>
                  </div>
                )}

                {game.platforms && game.platforms.length > 0 && (
                  <div>
                    <dt className="text-sm text-foreground-muted">Platforms</dt>
                    <dd className="flex flex-wrap gap-2 mt-2">
                      {game.platforms.map((platform) => (
                        <span
                          key={platform.id}
                          className="px-2 py-1 bg-background-secondary text-foreground-muted rounded text-xs"
                        >
                          {platform.abbreviation || platform.name}
                        </span>
                      ))}
                    </dd>
                  </div>
                )}

                {game.aggregated_rating && (
                  <div>
                    <dt className="text-sm text-foreground-muted">Critics Score</dt>
                    <dd className="text-foreground mt-1">
                      <span className="text-2xl font-bold text-gold">
                        {Math.round(game.aggregated_rating)}
                      </span>
                      <span className="text-foreground-muted text-sm ml-1">/ 100</span>
                      {game.aggregated_rating_count && (
                        <span className="text-foreground-muted text-xs block">
                          {game.aggregated_rating_count} reviews
                        </span>
                      )}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Links */}
            {game.websites && game.websites.length > 0 && (
              <div className="bg-background-card rounded-xl p-6 border border-purple/10">
                <h3 className="text-lg font-semibold mb-4">Links</h3>
                <div className="space-y-2">
                  {game.websites.slice(0, 6).map((website) => {
                    const categoryInfo = WEBSITE_CATEGORIES[website.category] || {
                      name: "Link",
                      icon: "🔗",
                    };
                    return (
                      <a
                        key={website.id}
                        href={website.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-foreground-muted hover:text-purple-light transition-colors py-2"
                      >
                        <span>{categoryInfo.icon}</span>
                        <span>{categoryInfo.name}</span>
                        <svg
                          className="w-4 h-4 ml-auto opacity-50"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-purple/10 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-foreground-muted text-sm">
            © 2025 SavePoint. Built for gamers.
          </span>
          <div className="flex items-center gap-6 text-sm text-foreground-muted">
            <Link href="/about" className="hover:text-foreground transition-colors">About</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const game = await getGameBySlug(slug);

  if (!game) {
    return {
      title: "Game Not Found | SavePoint",
    };
  }

  return {
    title: `${game.name} | SavePoint`,
    description: game.summary?.slice(0, 160) || `View details about ${game.name} on SavePoint`,
  };
}
