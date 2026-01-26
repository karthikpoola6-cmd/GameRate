import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Navigation } from '@/components/Navigation'
import { FavoriteGames } from '@/components/FavoriteGames'
import { getCoverUrl } from '@/lib/igdb'
import { FollowButtonClient } from './FollowButton'
import type { Profile, GameLog } from '@/lib/types'

// Always fetch fresh data for user profiles
export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ username: string }>
}

export default async function ProfilePage({ params }: PageProps) {
  const { username } = await params
  const supabase = await createClient()

  // Get current user
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username.toLowerCase())
    .single()

  if (!profile) {
    notFound()
  }

  // Get stats and games
  const [
    { count: gamesCount },
    { count: followersCount },
    { count: followingCount },
    { data: recentGames },
    { data: favoriteGames },
  ] = await Promise.all([
    supabase.from('game_logs').select('*', { count: 'exact', head: true }).eq('user_id', profile.id),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', profile.id),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', profile.id),
    supabase
      .from('game_logs')
      .select('*')
      .eq('user_id', profile.id)
      .not('rating', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(8),
    supabase
      .from('game_logs')
      .select('*')
      .eq('user_id', profile.id)
      .eq('favorite', true)
      .order('updated_at', { ascending: false })
      .limit(5),
  ])

  // Check if current user follows this profile
  let isFollowing = false
  if (currentUser && currentUser.id !== profile.id) {
    const { data: followData } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', currentUser.id)
      .eq('following_id', profile.id)
      .single()
    isFollowing = !!followData
  }

  const isOwnProfile = currentUser?.id === profile.id

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Profile Header */}
      <div className="pt-24 pb-8 px-4 bg-background-secondary/30">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="w-32 h-32 bg-purple/20 rounded-full flex items-center justify-center text-4xl font-bold text-purple flex-shrink-0">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.username}
                  width={128}
                  height={128}
                  className="rounded-full object-cover"
                />
              ) : (
                profile.username.slice(0, 2).toUpperCase()
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl font-bold">
                {profile.display_name || profile.username}
              </h1>
              <p className="text-foreground-muted">@{profile.username}</p>

              {profile.bio && (
                <p className="mt-3 text-foreground-muted max-w-lg">{profile.bio}</p>
              )}

              {/* Stats */}
              <div className="flex gap-6 mt-4 justify-center sm:justify-start">
                <div className="text-center">
                  <div className="text-xl font-bold">{gamesCount || 0}</div>
                  <div className="text-sm text-foreground-muted">Games</div>
                </div>
                <Link href={`/user/${username}/followers`} className="text-center hover:text-purple transition-colors">
                  <div className="text-xl font-bold">{followersCount || 0}</div>
                  <div className="text-sm text-foreground-muted">Followers</div>
                </Link>
                <Link href={`/user/${username}/following`} className="text-center hover:text-purple transition-colors">
                  <div className="text-xl font-bold">{followingCount || 0}</div>
                  <div className="text-sm text-foreground-muted">Following</div>
                </Link>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {isOwnProfile ? (
                <Link
                  href="/settings/profile"
                  className="bg-background-card hover:bg-background-secondary text-foreground px-6 py-2 rounded-lg font-medium transition-colors border border-purple/20"
                >
                  Edit Profile
                </Link>
              ) : currentUser ? (
                <FollowButtonClient
                  profileId={profile.id}
                  initialFollowing={isFollowing}
                />
              ) : (
                <Link
                  href="/login"
                  className="bg-purple hover:bg-purple-dark text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Sign in to follow
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-12">
        {/* Top 5 Favorites */}
        {(isOwnProfile || (favoriteGames && favoriteGames.length > 0)) && (
          <FavoriteGames
            favorites={(favoriteGames as GameLog[]) || []}
            isOwnProfile={isOwnProfile}
          />
        )}

        {/* Recent Ratings */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Recent Ratings</h2>
            {(gamesCount || 0) > 0 && (
              <Link
                href={`/user/${username}/games`}
                className="text-purple hover:text-purple-light text-sm transition-colors"
              >
                View all →
              </Link>
            )}
          </div>

          {recentGames && recentGames.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {recentGames.map((game: GameLog) => (
                <Link key={game.id} href={`/game/${game.game_slug}`} className="group">
                  <div className="relative aspect-[3/4] bg-background-card rounded-lg overflow-hidden">
                    {game.game_cover_id ? (
                      <Image
                        src={getCoverUrl(game.game_cover_id)}
                        alt={game.game_name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-purple/20 flex items-center justify-center">
                        <span className="text-3xl">🎮</span>
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-sm truncate group-hover:text-purple transition-colors">
                    {game.game_name}
                  </p>
                  {game.rating && (
                    <div className="flex gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const fill = Math.min(1, Math.max(0, game.rating! - star + 1))
                        return (
                          <span key={star} className="relative w-3 h-3">
                            <span className="absolute text-foreground-muted/30 text-xs">★</span>
                            {fill > 0 && (
                              <span
                                className="absolute text-gold text-xs overflow-hidden"
                                style={{ width: `${fill * 100}%` }}
                              >
                                ★
                              </span>
                            )}
                          </span>
                        )
                      })}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-background-card rounded-xl p-8 text-center border border-purple/10">
              <p className="text-foreground-muted">
                {isOwnProfile
                  ? "You haven't logged any games yet."
                  : "This user hasn't logged any games yet."}
              </p>
              {isOwnProfile && (
                <Link
                  href="/"
                  className="inline-block mt-4 text-purple hover:text-purple-light transition-colors"
                >
                  Browse games to get started →
                </Link>
              )}
            </div>
          )}
        </section>
      </div>

    </div>
  )
}

export async function generateMetadata({ params }: PageProps) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name, bio')
    .eq('username', username.toLowerCase())
    .single()

  if (!profile) {
    return { title: 'User Not Found | SavePoint' }
  }

  return {
    title: `${profile.display_name || profile.username} (@${profile.username}) | SavePoint`,
    description: profile.bio || `Check out ${profile.username}'s gaming profile on SavePoint`,
  }
}
