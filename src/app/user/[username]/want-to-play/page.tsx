import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Navigation } from '@/components/Navigation'
import { getCoverUrl } from '@/lib/igdb'
import type { GameLog } from '@/lib/types'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ username: string }>
}

export default async function WantToPlayPage({ params }: PageProps) {
  const { username } = await params
  const supabase = await createClient()

  // Get current user
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', username)
    .single()

  if (!profile) {
    notFound()
  }

  const isOwnProfile = currentUser?.id === profile.id

  // Get want to play games
  const { data: games } = await supabase
    .from('game_logs')
    .select('*')
    .eq('user_id', profile.id)
    .eq('status', 'want_to_play')
    .order('updated_at', { ascending: false })

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="max-w-4xl mx-auto px-4 pt-4 lg:pt-24 pb-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/user/${username}`}
            className="text-purple text-sm"
          >
            ← Back to {isOwnProfile ? 'your' : `${profile.display_name || profile.username}'s`} profile
          </Link>
          <h1 className="text-2xl font-bold mt-4">
            {isOwnProfile ? 'Want to Play' : `${profile.display_name || profile.username}'s Backlog`}
          </h1>
          <p className="text-foreground-muted mt-1">
            {games?.length || 0} {games?.length === 1 ? 'game' : 'games'}
          </p>
        </div>

        {/* Games Grid */}
        {games && games.length > 0 ? (
          <div
            className="gap-2 sm:gap-4"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))'
            }}
          >
            {games.map((game: GameLog) => (
              <Link key={game.id} href={`/game/${game.game_slug}`}>
                <div className="relative aspect-[3/4] bg-background-card rounded-md sm:rounded-lg overflow-hidden">
                  {game.game_cover_id ? (
                    <Image
                      src={getCoverUrl(game.game_cover_id)}
                      alt={game.game_name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 bg-purple/20 flex items-center justify-center">
                      <span className="text-2xl sm:text-3xl">🎮</span>
                    </div>
                  )}
                </div>
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm truncate">
                  {game.game_name}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="glass rounded-xl p-8 text-center border border-purple/10">
            <p className="text-foreground-muted">
              {isOwnProfile
                ? "You haven't added any games to your backlog yet."
                : "No games in the backlog yet."}
            </p>
            {isOwnProfile && (
              <Link
                href="/"
                className="inline-block mt-4 text-purple"
              >
                Browse games to add some →
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: PageProps) {
  const { username } = await params

  return {
    title: `Want to Play | @${username} | GameRate`,
  }
}
