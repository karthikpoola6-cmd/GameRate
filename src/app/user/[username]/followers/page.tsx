import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { UserListItem } from '@/components/UserListItem'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface FollowUser {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
}

export default async function FollowersPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()

  // Get current user
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, display_name')
    .ilike('username', username)
    .single()

  if (!profile) {
    notFound()
  }

  // Get followers
  const { data: followsData } = await supabase
    .from('follows')
    .select('follower_id')
    .eq('following_id', profile.id)

  const followerIds = followsData?.map(f => f.follower_id) || []

  let followers: FollowUser[] = []
  if (followerIds.length > 0) {
    const { data } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .in('id', followerIds)

    followers = data || []
  }

  // Get who the current user is following (to show/hide follow buttons)
  let currentUserFollowingIds: string[] = []
  if (currentUser) {
    const { data: currentUserFollows } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', currentUser.id)

    currentUserFollowingIds = currentUserFollows?.map(f => f.following_id) || []
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Link
              href={`/user/${username}`}
              className="text-purple text-sm"
            >
              ← Back to profile
            </Link>
            <h1 className="text-2xl font-bold mt-4">
              {profile.display_name || profile.username}&apos;s Followers
            </h1>
            <p className="text-foreground-muted">{followers.length} followers</p>
          </div>

          {followers.length === 0 ? (
            <p className="text-center text-foreground-muted py-8">No followers yet</p>
          ) : (
            <div className="space-y-3">
              {followers.map((user) => (
                <UserListItem
                  key={user.id}
                  user={user}
                  currentUserId={currentUser?.id || null}
                  initialFollowing={currentUserFollowingIds.includes(user.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
