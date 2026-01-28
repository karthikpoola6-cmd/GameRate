import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";

export const dynamic = 'force-dynamic'

export default async function LandingPage() {
  // Check auth server-side
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If logged in, redirect to app home
  if (user) {
    redirect('/home');
  }

  // Not logged in - show marketing page
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-purple/10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-1.5 flex-shrink-0">
            <Image
              src="/GameRate.png"
              alt="GameRate"
              width={36}
              height={36}
              className="w-9 h-9"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple to-gold bg-clip-text text-transparent">
              GameRate
            </span>
          </Link>
          <Link
            href="/login"
            className="text-sm text-foreground-muted"
          >
            Sign in
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-12 px-4">
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
          <p className="text-lg text-foreground-muted max-w-2xl mx-auto mb-8">
            The social network for gamers. Rate and review games, create lists, follow friends, and discover your next favorite game.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center h-12 px-8 rounded-lg bg-purple text-white font-medium text-lg"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4 bg-background-secondary/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">
            Why I Built{" "}
            <span className="text-purple">GameRate</span>
          </h2>
          <div className="bg-background-card rounded-xl p-6 md:p-8 border border-purple/10 mb-12">
            <p className="text-foreground-muted leading-relaxed mb-4">
              I&apos;ve always loved tracking the games I play. Which ones did I finish? What did I think of them? What should I play next? I tried spreadsheets, notes apps, and other game trackers, but nothing felt quite right.
            </p>
            <p className="text-foreground-muted leading-relaxed mb-4">
              I wanted something simple and personal — a place to rate games with my own scale, showcase my favorites, and see what my friends are playing. Not another database of every game ever made, but a personal gaming diary.
            </p>
            <p className="text-foreground-muted leading-relaxed">
              So I built GameRate. It&apos;s the app I always wanted: half-star ratings, a top 5 favorites display, activity feeds from friends, and lists to organize everything. I hope you enjoy using it as much as I enjoyed building it.
            </p>
          </div>

          {/* Feature Highlights with Mockups */}
          <h3 className="text-2xl font-semibold text-center mb-8">What You Can Do</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Top 5 Favorites */}
            <div className="bg-background-card rounded-xl p-6 border border-purple/10">
              <div className="bg-gradient-to-br from-gold/10 to-gold-dark/20 rounded-lg mb-4 py-5 px-3">
                <div className="flex flex-col items-center gap-3">
                  {/* Top row - 3 games */}
                  <div className="flex gap-3 justify-center">
                    {[
                      { name: 'Elden Ring', cover: 'co4jni', rank: 1 },
                      { name: 'God of War', cover: 'co1tmu', rank: 2 },
                      { name: 'RDR2', cover: 'co1q1f', rank: 3 },
                    ].map((game) => (
                      <div key={game.name} className="flex flex-col items-center">
                        <div className="w-[68px] aspect-[3/4] rounded-lg overflow-hidden ring-2 ring-gold/50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`https://images.igdb.com/igdb/image/upload/t_cover_small/${game.cover}.jpg`}
                            alt={game.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="mt-1.5 text-[11px] text-center truncate w-[68px]">
                          <span className="text-gold font-semibold">{game.rank}.</span>{' '}
                          <span className="text-foreground-muted">{game.name}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                  {/* Bottom row - 2 games */}
                  <div className="flex gap-3 justify-center">
                    {[
                      { name: 'Minecraft', cover: 'co49x5', rank: 4 },
                      { name: 'Fortnite', cover: 'co2ekt', rank: 5 },
                    ].map((game) => (
                      <div key={game.name} className="flex flex-col items-center">
                        <div className="w-[68px] aspect-[3/4] rounded-lg overflow-hidden ring-2 ring-gold/50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`https://images.igdb.com/igdb/image/upload/t_cover_small/${game.cover}.jpg`}
                            alt={game.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="mt-1.5 text-[11px] text-center truncate w-[68px]">
                          <span className="text-gold font-semibold">{game.rank}.</span>{' '}
                          <span className="text-foreground-muted">{game.name}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <h4 className="text-lg font-semibold mb-2">Showcase Your Top 5</h4>
              <p className="text-foreground-muted text-sm">
                Pin your all-time favorite games to your profile. Show the world what defines your gaming taste.
              </p>
            </div>

            {/* Rating Feature */}
            <div className="bg-background-card rounded-xl p-6 border border-purple/10">
              <div className="bg-gradient-to-br from-purple/10 to-purple-dark/20 rounded-lg mb-4 py-6 flex items-center justify-center">
                <div className="text-center">
                  <div className="flex justify-center gap-1 mb-2">
                    {[1, 2, 3, 4].map((i) => (
                      <svg key={i} className="w-7 h-7 text-gold" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                    <svg className="w-7 h-7 text-gold" fill="currentColor" viewBox="0 0 24 24">
                      <defs>
                        <linearGradient id="half">
                          <stop offset="50%" stopColor="currentColor" />
                          <stop offset="50%" stopColor="#374151" />
                        </linearGradient>
                      </defs>
                      <path fill="url(#half)" d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  </div>
                  <span className="text-xl font-bold text-gold">4.5</span>
                </div>
              </div>
              <h4 className="text-lg font-semibold mb-2">Rate with Half-Stars</h4>
              <p className="text-foreground-muted text-sm">
                Because sometimes a game is more than a 4 but not quite a 5. Rate games on your own scale with precise half-star increments.
              </p>
            </div>

            {/* Activity Feed */}
            <div className="bg-background-card rounded-xl p-6 border border-purple/10">
              <div className="aspect-[4/3] bg-gradient-to-br from-purple/10 to-purple-dark/20 rounded-lg mb-4 flex items-center justify-center">
                <div className="space-y-2.5 w-full px-3">
                  {[
                    { name: 'Alex', color: 'bg-purple', borderColor: 'border-purple/30' },
                    { name: 'Jordan', color: 'bg-gold', borderColor: 'border-gold/30' },
                    { name: 'Sam', color: 'bg-purple-light', borderColor: 'border-purple-light/30' },
                  ].map((user) => (
                    <div key={user.name} className={`flex items-center gap-3 bg-background/60 rounded-xl p-3 border ${user.borderColor}`}>
                      <div className={`w-9 h-9 ${user.color}/20 rounded-full flex items-center justify-center border ${user.borderColor}`}>
                        <span className="text-sm font-medium">{user.name[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-foreground-muted">@{user.name.toLowerCase()}</p>
                      </div>
                      <button className="w-7 h-7 rounded-full bg-purple flex items-center justify-center flex-shrink-0">
                        <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <h4 className="text-lg font-semibold mb-2">Follow Friends</h4>
              <p className="text-foreground-muted text-sm">
                See what your friends are playing, rating, and adding to their lists. Discover games through people you trust.
              </p>
            </div>

            {/* Lists & Reviews */}
            <div className="bg-background-card rounded-xl p-6 border border-purple/10">
              <div className="aspect-[4/3] bg-gradient-to-br from-gold/10 to-gold-dark/20 rounded-lg mb-4 flex items-center justify-center">
                <div className="space-y-2 w-full px-3">
                  <div className="bg-background/60 rounded-lg p-2.5 border border-gold/20">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-purple text-sm">📋</span>
                      <span className="text-sm font-medium text-foreground">Best RPGs of All Time</span>
                    </div>
                    <p className="text-xs text-foreground-muted pl-6">12 games</p>
                  </div>
                  <div className="bg-background/60 rounded-lg p-2.5 border border-purple/20">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gold text-sm">✍️</span>
                      <span className="text-sm font-medium text-foreground">Review: Elden Ring</span>
                    </div>
                    <p className="text-xs text-foreground-muted pl-6 line-clamp-1">&quot;A masterpiece that redefines the genre...&quot;</p>
                  </div>
                  <div className="bg-background/60 rounded-lg p-2.5 border border-gold/20">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-purple-light text-sm">💎</span>
                      <span className="text-sm font-medium text-foreground">Hidden Gems</span>
                    </div>
                    <p className="text-xs text-foreground-muted pl-6">8 games</p>
                  </div>
                </div>
              </div>
              <h4 className="text-lg font-semibold mb-2">Lists & Reviews</h4>
              <p className="text-foreground-muted text-sm">
                Create lists to organize your games and write reviews to share your thoughts with the community.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
