# Hackathon Submissions — Feb 8, 2026

## Research Summary
Searched for virtual hackathons on Devpost that allow existing/pre-built projects. Most hackathons require building during the event window, but found two viable options.

### Rejected
- **CodeSpring Hackathon** — Requires project to be built during the hackathon period. GameRate was built before. Left/withdrew from this one.
- **Dev Season of Code** — Also requires building during the event.
- **Hackonomics 2026** (March 30 deadline) — Theme is finance/fintech, doesn't fit a gaming app.

### Submitted To

#### 1. DeveloperWeek 2026 Hackathon
- **Deadline**: February 20, 2026
- **Why it fits**: Rules focus on innovation and technical achievement, no explicit "must be built during event" requirement. Open to all developers.
- **Age/eligibility**: 18+, no student restriction. Karthik qualifies (21, college senior).
- **URL**: devpost.com (DeveloperWeek 2026 hackathon page)

#### 2. Global Innovation Build Challenge V1
- **Deadline**: February 28, 2026
- **Why it fits**: No explicit "built during hackathon" clause. Emphasizes innovation and real-world impact.
- **Age/eligibility**: Open to all ages/backgrounds. No restrictions.

---

## Devpost Submission Draft

### Inspiration
People say don't mix work with play, but when you do, you get passion. I've always loved escaping reality and exploring new worlds through games. Long nights with my brother debating which game was better and why, without a proper way to keep track. We ended up writing out rankings and ratings in our notes app, and that's what sparked GameRate.
As a college student, I wanted a real app to track my gaming journey on mobile. Something simple, social, and with an actually good design. It didn't exist, so I taught myself to build it. React, databases, APIs, the whole stack. What started as a passion project became something I'm genuinely proud of.

### What it does
GameRate is a mobile-first PWA. Add it to your home screen, and it feels like a native app, no app store needed. You can rate games with half-stars because sometimes a game is more than a 4 but not quite a 5. You can pin your all-time Top 5 favorites to your profile, create personal lists like "Best RPGs of All Time" or "Hidden Gems", follow friends to see what they're playing and rating, write reviews, and track your full gaming journey across played, playing, want to play, and dropped.

### How we built it
I wanted GameRate to feel like something you'd download from the App Store. Smooth, fast, and native on your phone. So I built it as a Progressive Web App with Next.js 16 and React 19, using server components for fast loading and client components for interactivity. TypeScript end-to-end, no exceptions.
The backend runs on Supabase. PostgreSQL with Row-Level Security so users can only touch their own data, plus built-in auth and image storage. Game data comes from the IGDB API through Twitch OAuth, pulling in covers, screenshots, genres, platforms, and similar games. Everything is styled with Tailwind CSS, mobile-first from the ground up, and a service worker with a web manifest lets you add it to your home screen like a real app.

### Challenges we ran into
The biggest challenge was making a website actually feel like a native app. Bottom navigation flickering, viewport quirks on iOS, scroll behavior, and tap targets. Every small mobile detail compounds. Getting GameRate to feel like something you'd download from an app store took more iteration than any single feature I built.
IGDB's API had its own surprises. Twitch OAuth tokens expire, and a stale token mid-request fails silently. I built in-memory token caching with a buffer before expiry so searches never break. On top of that, IGDB returns separate entries for things like "The Last of Us", "The Last of Us Remastered", and the GOTY Edition. I had to write deduplication logic to keep the game feed clean. Then there were React hydration mismatches. Avatars loaded from Supabase caused the server and client to render different states on first load. I solved it with localStorage caching so the initial render stays in sync.

### Accomplishments that we're proud of
The thing I'm most proud of is that GameRate actually feels like a real app. Not a website pretending to be one. You add it to your home screen and it launches fullscreen, has smooth navigation, a bottom tab bar, and transitions that feel native. People I've shown it to didn't realize it was built with web tech until I told them.
I'm also proud that I built this entire stack from scratch as a college student who didn't know React or databases when I started. Every feature, every page, every API route. There's no template or boilerplate under the hood. I learned by building, and the app is proof of that.
The small details matter to me too. Half-star ratings exist because I got frustrated rounding my opinions. The Top 5 showcase exists because every gamer has one and deserves a place to show it. The deduplication logic exists because seeing three versions of the same game in a feed is a bad experience. These aren't flashy features, but they're the kind of decisions that make an app feel like someone who actually uses it built it.
And honestly, I'm mostly proud that it works. You can sign up, search for a game, rate it, write a review, add it to a list, follow a friend, and see their activity. That's a full social platform, and it all runs on a clean Supabase backend with Row-Level Security keeping everyone's data safe.

### What we learned
I didn't know React, databases, or APIs when I started this. I learned them because I needed them to build something I actually cared about, and that made all the difference. Building GameRate taught me that mobile-first isn't a CSS trick, it's a mindset. Every interaction, every animation, every layout decision has to start from the phone.
It also taught me to ship the core loop first. Rate a game, see it on your profile, share it with a friend. Everything else builds on top of that. And using Supabase with Next.js showed me how powerful the combo is. Row-Level Security means the database handles authorization, so I didn't need a custom backend for it.

### What's next for GameRate
GameRate is the app I always wanted. I'm working on a global activity feed, game-specific discussions, and smarter friend-based recommendations. But the heart of it stays the same. Your friends, your taste, your games. Maybe even a real iOS/Google Play Store deployment.

---

## Submission Checklist
- [ ] Record demo video (2-3 min walkthrough: sign up → search → rate → review → lists → profile → follow → PWA install)
- [ ] Ensure GitHub repo is public (or provide access)
- [ ] Submit to DeveloperWeek 2026 by Feb 20
- [ ] Submit to Global Innovation Build Challenge V1 by Feb 28
- [ ] Add screenshots to Devpost gallery (use existing `public/screenshots/`)
- [ ] Link live app: https://gamerate.vercel.app

## Tech Stack (for Devpost "Built With" field)
Next.js 16, React 19, TypeScript, Tailwind CSS, Supabase (PostgreSQL, Auth, Storage), IGDB API, Twitch OAuth, Vercel, PWA (Service Worker + Web Manifest)
