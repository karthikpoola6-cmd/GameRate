import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { createClient } from '@/lib/supabase/server'
import { getCoverUrl } from '@/lib/igdb'


interface ListWithItems {
  id: string
  name: string
  description: string | null
  is_public: boolean
  is_ranked: boolean
  created_at: string
  list_items: { game_cover_id: string | null; position: number }[]
}

export default async function UserListsPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const supabase = await createClient()
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

  const isOwnProfile = currentUser?.id === profile.id

  // Get lists - show all if own profile, only public otherwise
  let query = supabase
    .from('lists')
    .select('id, name, description, is_public, is_ranked, created_at, list_items(game_cover_id, position)')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })

  if (!isOwnProfile) {
    query = query.eq('is_public', true)
  }

  const { data: lists } = await query
  const typedLists = (lists || []) as ListWithItems[]

  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navigation />

      <main className="pt-4 lg:pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Link
                href={`/user/${username}`}
                className="text-purple text-sm"
              >
                ← Back to profile
              </Link>
              <h1 className="text-2xl font-bold mt-3">
                {isOwnProfile ? 'Your Lists' : `${profile.display_name || profile.username}'s Lists`}
              </h1>
              <p className="text-foreground-muted text-sm">{typedLists.length} lists</p>
            </div>

            {isOwnProfile && (
              <Link
                href="/lists/new"
                className="bg-purple text-white px-4 py-2 rounded-lg font-medium text-sm"
              >
                Create List
              </Link>
            )}
          </div>

          {typedLists.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-foreground-muted mb-4">
                {isOwnProfile ? "You haven't created any lists yet" : "No public lists"}
              </p>
              {isOwnProfile && (
                <Link
                  href="/lists/new"
                  className="text-purple"
                >
                  Create your first list →
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {typedLists.map((list) => (
                <Link
                  key={list.id}
                  href={`/list/${list.id}`}
                  className="block"
                >
                  {/* List header */}
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-foreground">{list.name}</h3>
                    <span className="text-sm text-foreground-muted">
                      {list.list_items.length} games
                    </span>
                  </div>

                  {/* Game posters row */}
                  <div className="flex gap-1">
                    {[...list.list_items]
                      .sort((a, b) => a.position - b.position)
                      .slice(0, 6)
                      .map((item, i) => (
                        <div key={i} className="w-12 h-16 bg-background-card rounded overflow-hidden flex-shrink-0">
                          {item.game_cover_id && (
                            <Image
                              src={getCoverUrl(item.game_cover_id, 'cover_small')}
                              alt=""
                              width={48}
                              height={64}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          )}
                        </div>
                      ))}
                  </div>

                  {/* Description */}
                  {list.description && (
                    <p className="text-xs text-foreground-muted mt-2 line-clamp-1">
                      {list.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
