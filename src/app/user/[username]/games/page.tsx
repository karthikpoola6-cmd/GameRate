import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navigation } from '@/components/Navigation'
import { GamesGridClient } from './GamesGridClient'
import type { GameLog } from '@/lib/types'


interface PageProps {
  params: Promise<{ username: string }>
}

export default async function UserGamesPage({ params }: PageProps) {
  const { username } = await params
  const supabase = await createClient()

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', username)
    .single()

  if (!profile) {
    notFound()
  }

  // Get all rated games (ordered by when rating was set)
  const { data: ratedGames } = await supabase
    .from('game_logs')
    .select('*')
    .eq('user_id', profile.id)
    .not('rating', 'is', null)
    .order('rated_at', { ascending: false, nullsFirst: false })

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="pt-4 lg:pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link
              href={`/user/${username}`}
              className="text-purple text-sm"
            >
              ← Back to profile
            </Link>
            <h1 className="text-xl font-bold mt-3">
              {profile.display_name || profile.username}&apos;s Ratings
            </h1>
            <p className="text-foreground-muted text-sm">
              {ratedGames?.length || 0} rated games
            </p>
          </div>

          {/* Games Grid with Filters */}
          <GamesGridClient games={(ratedGames as GameLog[]) || []} />
        </div>
      </main>
    </div>
  )
}

export async function generateMetadata({ params }: PageProps) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name')
    .ilike('username', username)
    .single()

  if (!profile) {
    return { title: 'User Not Found | GameRate' }
  }

  return {
    title: `${profile.display_name || profile.username}'s Ratings | GameRate`,
  }
}
