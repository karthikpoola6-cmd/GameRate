import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navigation } from '@/components/Navigation'
import { GamesGridClient } from './GamesGridClient'
import type { GameLog } from '@/lib/types'

export const dynamic = 'force-dynamic'

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
    .eq('username', username.toLowerCase())
    .single()

  if (!profile) {
    notFound()
  }

  // Get all rated games
  const { data: ratedGames } = await supabase
    .from('game_logs')
    .select('*')
    .eq('user_id', profile.id)
    .not('rating', 'is', null)
    .order('updated_at', { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link
              href={`/user/${username}`}
              className="text-purple hover:text-purple-light transition-colors text-sm"
            >
              ← Back to profile
            </Link>
            <h1 className="text-3xl font-bold mt-4">
              {profile.display_name || profile.username}&apos;s Ratings
            </h1>
            <p className="text-foreground-muted mt-1">
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
    .eq('username', username.toLowerCase())
    .single()

  if (!profile) {
    return { title: 'User Not Found | SavePoint' }
  }

  return {
    title: `${profile.display_name || profile.username}'s Ratings | SavePoint`,
  }
}
