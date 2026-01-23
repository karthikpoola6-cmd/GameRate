import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
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

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, display_name')
    .eq('username', username.toLowerCase())
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Link
              href={`/user/${username}`}
              className="text-purple hover:text-purple-light transition-colors text-sm"
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
                <Link
                  key={user.id}
                  href={`/user/${user.username}`}
                  className="flex items-center gap-4 p-4 bg-background-card border border-purple/10 rounded-lg hover:border-purple/30 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-background-secondary overflow-hidden flex-shrink-0">
                    {user.avatar_url ? (
                      <Image
                        src={user.avatar_url}
                        alt={user.username}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl bg-gradient-to-br from-purple/30 to-purple-dark/30">
                        {user.username[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold">{user.display_name || user.username}</h3>
                    <p className="text-sm text-foreground-muted">@{user.username}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
