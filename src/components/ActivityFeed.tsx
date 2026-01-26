import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ActivityFeedClient } from './ActivityFeedClient'

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

export async function ActivityFeed({ userId }: { userId: string }) {
  const supabase = await createClient()

  // First, get the list of users this person follows
  const { data: followingData } = await supabase
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId)

  const followingIds = followingData?.map(f => f.following_id) || []

  let feedItems: ActivityItem[] | null = null

  // Get activity from people the user follows (only ratings)
  if (followingIds.length > 0) {
    const { data: activity } = await supabase
      .from('game_logs')
      .select(`
        *,
        profiles:user_id (username, display_name, avatar_url)
      `)
      .in('user_id', followingIds)
      .not('rating', 'is', null)
      .order('updated_at', { ascending: false })
      .limit(50)

    // Filter to only show the most recent activity per friend
    if (activity) {
      const seenUsers = new Set<string>()
      feedItems = activity.filter((item) => {
        if (seenUsers.has(item.user_id)) {
          return false
        }
        seenUsers.add(item.user_id)
        return true
      }).slice(0, 10) as ActivityItem[]
    }
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

  return <ActivityFeedClient items={feedItems} />
}
