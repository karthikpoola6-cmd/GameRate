import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { ScrollReveal } from "@/components/ScrollReveal";
import { WordReveal } from "@/components/WordReveal";

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
    <div className="min-h-screen">
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
            className="text-sm text-purple-light border border-purple/30 px-4 py-1.5 rounded-lg"
            style={{ boxShadow: '0 0 12px rgba(139, 92, 246, 0.25)' }}
          >
            Sign in
          </Link>
        </div>
      </nav>

      {/* Section 1: Hero */}
      <section className="pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <WordReveal
              baseDelay={100}
              stagger={70}
              words={[
                { text: 'Track' },
                { text: 'games' },
                { text: "you've" },
                { text: 'played.', className: 'bg-gradient-to-r from-purple to-purple-light bg-clip-text text-transparent' },
              ]}
            />
            <br />
            <WordReveal
              baseDelay={400}
              stagger={70}
              words={[
                { text: 'Save' },
                { text: 'those' },
                { text: 'you' },
                { text: 'want.', className: 'bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent' },
              ]}
            />
          </h1>
          <p className="text-lg text-foreground-muted max-w-2xl mx-auto">
            <WordReveal
              baseDelay={700}
              stagger={30}
              words={[
                { text: 'The' },
                { text: 'social' },
                { text: 'network' },
                { text: 'for' },
                { text: 'gamers.' },
                { text: 'Rate' },
                { text: 'and' },
                { text: 'review' },
                { text: 'games,' },
                { text: 'create' },
                { text: 'lists,' },
                { text: 'follow' },
                { text: 'friends,' },
                { text: 'and' },
                { text: 'discover' },
                { text: 'your' },
                { text: 'next' },
                { text: 'favorite' },
                { text: 'game.' },
              ]}
            />
          </p>
        </div>
      </section>

      {/* Section 2: Add GameRate to Home Screen */}
      <section className="py-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <ScrollReveal distance={30}>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple/10 border border-purple/20 mb-6">
              <Image
                src="/GameRate.png"
                alt="GameRate"
                width={40}
                height={40}
                className="w-10 h-10"
              />
            </div>
            <h2 className="text-2xl font-bold mb-3">
              Add GameRate to Your Home Screen
            </h2>
            <p className="text-foreground-muted mb-8">
              Add GameRate to your phone for the full app experience — no app store needed.
            </p>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 gap-4 text-left">
            {/* iOS Instructions */}
            <ScrollReveal delay={100} distance={40}>
              <div className="bg-background-card rounded-xl p-5 border border-purple/10 h-full">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-foreground-muted" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  <span className="font-semibold">iPhone & iPad</span>
                </div>
                <ol className="space-y-2 text-sm text-foreground-muted">
                  <li className="flex items-start gap-2">
                    <span className="text-purple font-medium">1.</span>
                    <span>Tap the <span className="text-foreground">Share</span> button in Safari</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple font-medium">2.</span>
                    <span>Scroll down and tap <span className="text-foreground">Add to Home Screen</span></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple font-medium">3.</span>
                    <span>Tap <span className="text-foreground">Add</span> to confirm</span>
                  </li>
                </ol>
              </div>
            </ScrollReveal>

            {/* Android Instructions */}
            <ScrollReveal delay={250} distance={40}>
              <div className="bg-background-card rounded-xl p-5 border border-purple/10 h-full">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-foreground-muted" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.29-.15-.65-.06-.83.22l-1.88 3.24c-1.39-.59-2.94-.92-4.47-.92s-3.08.33-4.47.92L5.65 5.67c-.19-.29-.54-.38-.84-.22-.31.16-.43.54-.27.85L6.4 9.48C3.3 11.25 1.28 14.44 1 18h22c-.28-3.56-2.3-6.75-5.4-8.52zM7 15.25c-.69 0-1.25-.56-1.25-1.25S6.31 12.75 7 12.75s1.25.56 1.25 1.25-.56 1.25-1.25 1.25zm10 0c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25z"/>
                  </svg>
                  <span className="font-semibold">Android</span>
                </div>
                <ol className="space-y-2 text-sm text-foreground-muted">
                  <li className="flex items-start gap-2">
                    <span className="text-purple font-medium">1.</span>
                    <span>Tap the <span className="text-foreground">menu</span> (three dots) in Chrome</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple font-medium">2.</span>
                    <span>Tap <span className="text-foreground">Add to Home screen</span></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple font-medium">3.</span>
                    <span>Tap <span className="text-foreground">Add</span> to confirm</span>
                  </li>
                </ol>
              </div>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={400} distance={30}>
            <div className="mt-8">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center h-12 px-8 rounded-lg text-purple-light border border-purple/30 font-medium text-lg"
                style={{ boxShadow: '0 0 12px rgba(139, 92, 246, 0.25)' }}
              >
                Get Started
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Section 3: What You Can Do Header */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal distance={30}>
            <h2 className="text-3xl font-bold text-center mb-8">What You Can Do</h2>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Section 4: Top 5 Favorites */}
            <ScrollReveal delay={0} distance={50}>
              <div className="bg-background-card rounded-xl p-6 border border-purple/10 h-full">
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
            </ScrollReveal>

            {/* Section 5: Rating Feature */}
            <ScrollReveal delay={150} distance={50}>
              <div className="bg-background-card rounded-xl p-6 border border-purple/10 h-full">
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
            </ScrollReveal>

            {/* Section 6: Follow Friends */}
            <ScrollReveal delay={300} distance={50}>
              <div className="bg-background-card rounded-xl p-6 border border-purple/10 h-full">
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
            </ScrollReveal>

            {/* Section 7: Lists & Reviews */}
            <ScrollReveal delay={300} distance={50}>
              <div className="bg-background-card rounded-xl p-6 border border-purple/10 h-full">
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
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Section 8: Why I Built GameRate */}
      <section className="pt-8 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal distance={30}>
            <h2 className="text-3xl font-bold text-center mb-8">
              Why I Built{" "}
              <span className="text-purple">GameRate</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={200} distance={40}>
            <div className="bg-background-card rounded-xl p-6 md:p-8 border border-purple/10">
              <p className="text-foreground-muted leading-relaxed mb-4">
                People say don&apos;t mix work with play, but when you do, you get passion. I&apos;ve always loved escaping reality and exploring new worlds through games. Long nights with my brother debating which game was better and why, without a proper way to keep track. We ended up writing out rankings and ratings in our notes app, and that&apos;s what inspired GameRate, a mobile app for those nights.
              </p>
              <p className="text-foreground-muted leading-relaxed mb-4">
                As a college student, I wanted a real app to track my gaming journey on mobile. Something simple, social, and actually well-designed. It didn&apos;t exist. So I taught myself to build it: React, databases, APIs, the whole stack. What started as a passion project became something I&apos;m genuinely proud of.
              </p>
              <p className="text-foreground-muted leading-relaxed">
                GameRate is the app I always wanted. I hope you enjoy it too.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

    </div>
  );
}
