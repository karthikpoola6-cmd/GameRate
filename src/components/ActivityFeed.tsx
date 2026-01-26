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

  // Use database function to get most recent activity per friend (efficient DISTINCT ON)
  const { data: activity } = await supabase
    .rpc('get_friend_activity', { follower_user_id: userId })

  // Sort by updated_at (DISTINCT ON returns grouped, not sorted by date)
  // and limit to 10 friends
  let feedItems: ActivityItem[] | null = null
  if (activity && activity.length > 0) {
    feedItems = (activity as any[])
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 10)
      .map(item => ({
        ...item,
        profiles: {
          username: item.username,
          display_name: item.display_name,
          avatar_url: item.avatar_url
        }
      })) as ActivityItem[]
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
