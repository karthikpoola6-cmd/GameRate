import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Navigation } from '@/components/Navigation'
import { FavoriteGames } from '@/components/FavoriteGames'
import { Button } from '@/components/ui/button'
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

  // Get stats, games, lists, and reviews
  const isOwnProfileCheck = currentUser?.id === profile.id

  const [
    { count: gamesCount },
    { count: followersCount },
    { count: followingCount },
    { data: recentGames },
    { data: favoriteGames },
    { data: userLists, count: listsCount },
    { data: userReviews, count: reviewsCount },
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
    // Get user's lists (public only if not own profile) - just 1 most recent
    (async () => {
      let query = supabase
        .from('lists')
        .select('id, name, list_items(game_cover_id, position)', { count: 'exact' })
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (!isOwnProfileCheck) {
        query = query.eq('is_public', true)
      }

      return query
    })(),
    // Get user's most recent review
    supabase
      .from('game_logs')
      .select('id, game_slug, game_name, game_cover_id, rating, review, updated_at', { count: 'exact' })
      .eq('user_id', profile.id)
      .not('review', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(1),
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
            <div className="flex gap-2">
              {isOwnProfile ? (
                <Button variant="outline" size="sm" asChild>
                  <Link href="/settings/profile">Edit Profile</Link>
                </Button>
              ) : currentUser ? (
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
                  className="inline-block mt-4 text-purple hover:text-purple-light transition-colors"
                >
                  Browse games to get started →
                </Link>
              )}
            </div>
          )}
        </section>

        {/* Reviews Section */}
        {(reviewsCount || 0) > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Reviews</h2>
              <Link
                href={`/user/${username}/reviews`}
                className="text-foreground-muted text-sm"
              >
                {reviewsCount} →
              </Link>
            </div>
            <div>
              {userReviews?.map((review: { id: string; game_slug: string; game_name: string; game_cover_id: string | null; rating: number | null; review: string; updated_at: string }) => (
                <Link
                  key={review.id}
                  href={`/game/${review.game_slug}`}
                  className="flex gap-3 group"
                >
                  <div className="w-12 h-16 bg-background-card rounded overflow-hidden flex-shrink-0">
                    {review.game_cover_id ? (
                      <Image
                        src={getCoverUrl(review.game_cover_id, 'cover_small')}
                        alt={review.game_name}
                        width={48}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-purple/20">
                        <span className="text-lg">🎮</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{review.game_name}</p>
                      {review.rating && (
                        <span className="text-gold text-xs flex-shrink-0">
                          {'★'.repeat(Math.floor(review.rating))}
                          {review.rating % 1 >= 0.5 && '½'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-foreground-muted line-clamp-2 mt-1">{review.review}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Lists Section */}
        {(listsCount || 0) > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Lists</h2>
              <Link
                href={`/user/${username}/lists`}
                className="text-foreground-muted text-sm"
              >
                {listsCount} →
              </Link>
            </div>
            <div className="space-y-3">
              {userLists?.map((list: { id: string; name: string; list_items: { game_cover_id: string | null; position: number }[] }) => (
                <Link
                  key={list.id}
                  href={`/list/${list.id}`}
                  className="flex items-center gap-3"
                >
                  <div className="flex gap-0.5 flex-shrink-0">
                    {[...list.list_items]
                      .sort((a, b) => a.position - b.position)
                      .slice(0, 4)
                      .map((item, i) => (
                        <div key={i} className="w-8 h-10 bg-background-card rounded overflow-hidden">
                          {item.game_cover_id && (
                            <Image
                              src={getCoverUrl(item.game_cover_id, 'cover_small')}
                              alt=""
                              width={32}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{list.name}</p>
                    <p className="text-xs text-foreground-muted">{list.list_items.length} games</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
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
    return { title: 'User Not Found | GameRate' }
  }

  return {
    title: `${profile.display_name || profile.username} (@${profile.username}) | GameRate`,
    description: profile.bio || `Check out ${profile.username}'s gaming profile on GameRate`,
  }
}
