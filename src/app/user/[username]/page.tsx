import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Navigation } from '@/components/Navigation'
import { FavoriteGames } from '@/components/FavoriteGames'
import { RatingDistribution } from '@/components/RatingDistribution'
import { Button } from '@/components/ui/button'
import { getCoverUrl } from '@/lib/igdb'
import { FollowButtonClient } from './FollowButton'
import type { GameLog } from '@/lib/types'

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

  // Get profile (case-insensitive lookup)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', username)
    .single()

  if (!profile) {
    notFound()
  }

  // Get stats, games, lists, and reviews
  const isOwnProfileCheck = currentUser?.id === profile.id

  const [
    { count: gamesCount },
    { count: followersCount },
    { count: followingCount },
    { data: recentGames },
    { data: favoriteGames },
    { count: listsCount },
    { count: reviewsCount },
    { count: wantToPlayCount },
    { data: allRatings },
  ] = await Promise.all([
    supabase.from('game_logs').select('*', { count: 'exact', head: true }).eq('user_id', profile.id).not('rating', 'is', null),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', profile.id),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', profile.id),
    supabase
      .from('game_logs')
      .select('*')
      .eq('user_id', profile.id)
      .not('rating', 'is', null)
      .order('rated_at', { ascending: false, nullsFirst: false })
      .limit(8),
    supabase
      .from('game_logs')
      .select('*')
      .eq('user_id', profile.id)
      .eq('favorite', true)
      .order('updated_at', { ascending: false })
      .limit(5),
    // Get lists count (public only if not own profile)
    (async () => {
      let query = supabase
        .from('lists')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id)

      if (!isOwnProfileCheck) {
        query = query.eq('is_public', true)
      }

      return query
    })(),
    // Get reviews count
    supabase
      .from('game_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile.id)
      .not('review', 'is', null),
    // Get want to play count
    supabase
      .from('game_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', profile.id)
      .eq('status', 'want_to_play'),
    // Get all ratings for distribution
    supabase
      .from('game_logs')
      .select('rating')
      .eq('user_id', profile.id)
      .not('rating', 'is', null),
  ])

  // Calculate rating distribution
  const ratingDistribution: Record<number, number> = {
    0.5: 0, 1: 0, 1.5: 0, 2: 0, 2.5: 0, 3: 0, 3.5: 0, 4: 0, 4.5: 0, 5: 0
  }

  if (allRatings && allRatings.length > 0) {
    allRatings.forEach(g => {
      const rating = Number(g.rating)
      // Round to nearest 0.5 to handle any floating point issues
      const rounded = Math.round(rating * 2) / 2
      if (rounded >= 0.5 && rounded <= 5) {
        ratingDistribution[rounded] = (ratingDistribution[rounded] || 0) + 1
      }
    })
  }

  const maxCount = Math.max(...Object.values(ratingDistribution), 1)

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
      <div className="pt-20 pb-8 px-4 bg-background-secondary/30">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            {/* Avatar */}
            <div className="w-32 h-32 bg-purple/20 rounded-full flex items-center justify-center text-4xl font-bold text-purple flex-shrink-0 ring-2 ring-gold/50">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.username}
                  width={128}
                  height={128}
                  className="rounded-full object-cover"
                  unoptimized
                  priority
                />
              ) : (
                profile.username.slice(0, 2).toUpperCase()
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-lg font-bold">
                {profile.display_name || profile.username}
              </h1>

              {profile.bio && (
                <p className="mt-3 text-foreground-muted max-w-lg">{profile.bio}</p>
              )}

              {/* Stats */}
              <div className="flex gap-6 mt-4 justify-center sm:justify-start">
                <div className="text-center">
                  <div className="text-xl font-bold">{gamesCount || 0}</div>
                  <div className="text-sm text-foreground-muted">Games</div>
                </div>
                <Link href={`/user/${username}/followers`} className="text-center">
                  <div className="text-xl font-bold">{followersCount || 0}</div>
                  <div className="text-sm text-foreground-muted">Followers</div>
                </Link>
                <Link href={`/user/${username}/following`} className="text-center">
                  <div className="text-xl font-bold">{followingCount || 0}</div>
                  <div className="text-sm text-foreground-muted">Following</div>
                </Link>
              </div>
            </div>

            {/* Actions */}
            {!isOwnProfile && (
              <div className="flex gap-2">
                {currentUser ? (
                  <FollowButtonClient
                    profileId={profile.id}
                    initialFollowing={isFollowing}
                  />
                ) : (
                  <Button size="sm" asChild>
                    <Link href="/login">Sign in to follow</Link>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 pt-4 pb-8 space-y-8">
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
                className="text-purple text-sm"
              >
                View all →
              </Link>
            )}
          </div>

          {/* Rating Distribution */}
          <div className="mb-4">
            <RatingDistribution distribution={ratingDistribution} maxCount={maxCount} />
          </div>

          {recentGames && recentGames.length > 0 ? (
            <div
              className="gap-2 sm:gap-4"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))'
              }}
            >
              {recentGames.map((game: GameLog) => (
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
                  {game.rating && (
                    <div className="flex mt-0.5">
                      <span className="text-gold text-[10px] sm:text-xs">
                        {'★'.repeat(Math.floor(game.rating))}
                        {game.rating % 1 >= 0.5 && '½'}
                      </span>
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
                  className="inline-block mt-4 text-purple"
                >
                  Browse games to get started →
                </Link>
              )}
            </div>
          )}
        </section>

        {/* Lists, Reviews & Want to Play Navigation */}
        <div className="border border-purple/10 rounded-lg overflow-hidden">
          <Link
            href={`/user/${username}/lists`}
            className="flex items-center justify-between py-3 px-4 border-b border-purple/10"
          >
            <span className="font-medium">Lists</span>
            <span className="text-foreground-muted text-sm">{listsCount || 0} →</span>
          </Link>
          <Link
            href={`/user/${username}/reviews`}
            className="flex items-center justify-between py-3 px-4 border-b border-purple/10"
          >
            <span className="font-medium">Reviews</span>
            <span className="text-foreground-muted text-sm">{reviewsCount || 0} →</span>
          </Link>
          <Link
            href={`/user/${username}/want-to-play`}
            className="flex items-center justify-between py-3 px-4"
          >
            <span className="font-medium">Want to Play</span>
            <span className="text-foreground-muted text-sm">{wantToPlayCount || 0} →</span>
          </Link>
        </div>
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
    .ilike('username', username)
    .single()

  if (!profile) {
    return { title: 'User Not Found | GameRate' }
  }

  return {
    title: `${profile.display_name || profile.username} (@${profile.username}) | GameRate`,
    description: profile.bio || `Check out ${profile.username}'s gaming profile on GameRate`,
  }
}
