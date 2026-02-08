import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { ScrollReveal } from "@/components/ScrollReveal";
import { WordReveal } from "@/components/WordReveal";
import { FadeIn } from "@/components/FadeIn";


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
            <span className="text-xl font-medium tracking-wider bg-gradient-to-r from-purple to-gold bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-display)' }}>
              GameRate
            </span>
          </Link>
          <Link
            href="/login"
            className="text-sm text-purple-light border border-purple/30 px-4 py-1.5 rounded-lg tracking-wider"
            style={{ fontFamily: 'var(--font-display)', boxShadow: '0 0 12px rgba(139, 92, 246, 0.25)' }}
          >
            Sign in
          </Link>
        </div>
      </nav>

      {/* Section 1: Hero */}
      <section className="pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium mb-6 tracking-wide" style={{ textShadow: '0 0 20px rgba(139, 92, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.2)' }}>
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
          <FadeIn delay={900} distance={20}>
            <div className="mt-8">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center h-12 px-8 rounded-lg text-purple-light border border-purple/30 font-medium text-lg tracking-wider"
                style={{ fontFamily: 'var(--font-display)', boxShadow: '0 0 12px rgba(139, 92, 246, 0.25)' }}
              >
                Get Started
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Section 2: App Showcase */}
      <section className="py-16">
        <ScrollReveal distance={30}>
          <div className="text-center px-4 mb-8">
            <h2 className="text-2xl font-medium tracking-wide mb-2" style={{ textShadow: '0 0 15px rgba(139, 92, 246, 0.4)' }}>
              See It In Action
            </h2>
            <p className="text-foreground-muted text-sm lg:hidden">Swipe to explore</p>
          </div>
        </ScrollReveal>

        <div
          className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-6 scrollbar-hide lg:justify-center lg:overflow-x-visible"
          style={{ paddingLeft: 'calc(50% - 120px)', paddingRight: 'calc(50% - 120px)' }}
        >
          {[
            { src: '/screenshots/screenshot-2.png', label: 'Your Profile' },
            { src: '/screenshots/screenshot-5.jpg', label: 'Game Details' },
            { src: '/screenshots/screenshot-1.jpg', label: 'Home Feed' },
            { src: '/screenshots/screenshot-7.jpg', label: 'Ranked Lists' },
          ].map((shot) => (
            <div key={shot.label} className="flex-shrink-0 snap-center flex flex-col items-center">
              <div
                className="w-[240px] rounded-[40px] overflow-hidden border-[4px] border-white/10"
                style={{ boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 40px rgba(139, 92, 246, 0.15)' }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={shot.src} alt={shot.label} className="w-full block" draggable={false} />
              </div>
              <p
                className="text-xs text-foreground-muted mt-3 tracking-wider"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {shot.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Features */}
      <section className="py-12 px-4">
        <div className="max-w-md md:max-w-2xl mx-auto">
          <ScrollReveal distance={30}>
            <h2 className="text-2xl font-medium tracking-wide text-center mb-6" style={{ textShadow: '0 0 15px rgba(139, 92, 246, 0.4)' }}>What You Can Do</h2>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              {
                icon: <svg className="w-5 h-5 text-gold" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>,
                title: 'Half-Star Ratings',
                desc: 'Rate every game with precision',
                delay: 0,
              },
              {
                icon: <svg className="w-5 h-5 text-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
                title: 'Top 5 Favorites',
                desc: 'Pin your best games to your profile',
                delay: 80,
              },
              {
                icon: <svg className="w-5 h-5 text-purple-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
                title: 'Follow Friends',
                desc: 'See what your friends are playing',
                delay: 160,
              },
              {
                icon: <svg className="w-5 h-5 text-purple-light" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
                title: 'Lists & Reviews',
                desc: 'Organize and share your thoughts',
                delay: 240,
              },
            ].map((feature) => (
              <ScrollReveal key={feature.title} delay={feature.delay} distance={30}>
                <div className="glass rounded-xl p-4 border border-purple/10 h-full">
                  <div className="mb-2">{feature.icon}</div>
                  <h4 className="text-sm font-medium tracking-wide mb-1">{feature.title}</h4>
                  <p className="text-foreground-muted text-xs leading-relaxed">{feature.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Section 8: Why I Built GameRate */}
      <section className="pt-8 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal distance={30}>
            <h2 className="text-2xl font-medium tracking-wide text-center mb-8" style={{ textShadow: '0 0 15px rgba(139, 92, 246, 0.4)' }}>
              Why I Built{" "}
              <span className="text-purple">GameRate</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={200} distance={40}>
            <div className="glass rounded-xl p-6 md:p-8 border border-purple/10">
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

      {/* Section 9: Add to Home Screen */}
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
            <h2 className="text-xl font-medium tracking-wide mb-3" style={{ textShadow: '0 0 15px rgba(139, 92, 246, 0.4)' }}>
              Add GameRate to Your Home Screen
            </h2>
            <p className="text-foreground-muted mb-8">
              Add GameRate to your phone for the full app experience — no app store needed.
            </p>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 gap-4 text-left">
            <ScrollReveal delay={100} distance={40}>
              <div className="glass rounded-xl p-5 border border-purple/10 h-full">
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

            <ScrollReveal delay={250} distance={40}>
              <div className="glass rounded-xl p-5 border border-purple/10 h-full">
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
        </div>
      </section>

      {/* Final CTA */}
      <section className="pt-4 pb-20 px-4">
        <ScrollReveal distance={20}>
          <div className="text-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center h-12 px-8 rounded-lg text-purple-light border border-purple/30 font-medium text-lg tracking-wider"
              style={{ fontFamily: 'var(--font-display)', boxShadow: '0 0 12px rgba(139, 92, 246, 0.25)' }}
            >
              Start Tracking Your Games
            </Link>
          </div>
        </ScrollReveal>
      </section>

    </div>
  );
}
