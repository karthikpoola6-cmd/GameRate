import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { getCoverUrl } from '@/lib/igdb'

interface ActivityItem {
  id: string
  user_id: string
  game_id: number
  game_slug: string
  game_name: string
  game_cover_id: string | null
  status: string
  rating: number | null
  review: string | null
  favorite: boolean
  updated_at: string
  profiles: {
    username: string
    display_name: string | null
    avatar_url: string | null
  }
}

function getActivityText(item: ActivityItem): string {
  if (item.favorite) {
    return 'added to favorites'
  }
  if (item.review) {
    return 'reviewed'
  }
  if (item.rating) {
    return 'rated'
  }
  if (item.status === 'want_to_play') {
    return 'wants to play'
  }
  return 'logged'
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="text-gold ml-1">
      {'★'.repeat(Math.floor(rating))}
      {rating % 1 >= 0.5 && '½'}
    </span>
  )
}

function timeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString()
}

export async function ActivityFeed({ userId }: { userId: string }) {
  const supabase = await createClient()

  // First, get the list of users this person follows
  const { data: followingData } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId)

  const followingIds = followingData?.map(f => f.following_id) || []

  let feedItems: ActivityItem[] | null = null

  // Get activity from people the user follows
  if (followingIds.length > 0) {
    const { data: activity } = await supabase
      .from('game_logs')
      .select(`
        *,
        profiles:user_id (username, display_name, avatar_url)
      `)
      .in('user_id', followingIds)
      .order('updated_at', { ascending: false })
      .limit(20)

    feedItems = activity as ActivityItem[] | null
  }

  // If no activity from follows, show recent activity from anyone
  if (!feedItems || feedItems.length === 0) {
    const { data: recentActivity } = await supabase
      .from('game_logs')
      .select(`
        *,
        profiles:user_id (username, display_name, avatar_url)
      `)
      .neq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(15)

    feedItems = recentActivity as ActivityItem[] | null
  }

  if (!feedItems || feedItems.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-foreground-muted mb-4">No activity yet</p>
        <p className="text-sm text-foreground-muted">
          Follow other players to see their activity here
        </p>
        <Link
          href="/players"
          className="inline-block mt-4 text-purple hover:text-purple-light transition-colors"
        >
          Find players to follow →
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {feedItems.map((item) => (
        <div
          key={item.id}
          className="flex gap-4 p-4 bg-background-card border border-purple/10 rounded-lg"
        >
          {/* Avatar */}
          <Link href={`/user/${item.profiles.username}`} className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-background-secondary overflow-hidden">
              {item.profiles.avatar_url ? (
                <Image
                  src={item.profiles.avatar_url}
                  alt={item.profiles.username}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm bg-gradient-to-br from-purple/30 to-purple-dark/30">
                  {item.profiles.username[0].toUpperCase()}
                </div>
              )}
            </div>
          </Link>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <Link
                href={`/user/${item.profiles.username}`}
                className="font-semibold hover:text-purple transition-colors"
              >
                {item.profiles.display_name || item.profiles.username}
              </Link>
              {' '}
              <span className="text-foreground-muted">{getActivityText(item)}</span>
              {' '}
              <Link
                href={`/game/${item.game_slug}`}
                className="font-medium hover:text-purple transition-colors"
              >
                {item.game_name}
              </Link>
              {item.rating && <StarDisplay rating={item.rating} />}
            </p>

            {/* Review snippet */}
            {item.review && (
              <p className="text-sm text-foreground-muted mt-1 line-clamp-2">
                &quot;{item.review}&quot;
              </p>
            )}

            <p className="text-xs text-foreground-muted mt-2">
              {timeAgo(item.updated_at)}
            </p>
          </div>

          {/* Game cover */}
          <Link href={`/game/${item.game_slug}`} className="flex-shrink-0">
            <div className="w-12 h-16 bg-background-secondary rounded overflow-hidden">
              {item.game_cover_id ? (
                <Image
                  src={getCoverUrl(item.game_cover_id, 'cover_small')}
                  alt={item.game_name}
                  width={48}
                  height={64}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg">
                  🎮
                </div>
              )}
            </div>
          </Link>
        </div>
      ))}
    </div>
  )
}
