import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { createClient } from '@/lib/supabase/server'
import { getCoverUrl } from '@/lib/igdb'

export const dynamic = 'force-dynamic'

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
    .eq('username', username.toLowerCase())
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
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link
                href={`/user/${username}`}
                className="text-purple hover:text-purple-light transition-colors text-sm"
              >
                ← Back to profile
              </Link>
              <h1 className="text-2xl font-bold mt-4">
                {isOwnProfile ? 'Your Lists' : `${profile.display_name || profile.username}'s Lists`}
              </h1>
              <p className="text-foreground-muted">{typedLists.length} lists</p>
            </div>

            {isOwnProfile && (
              <Link
                href="/lists/new"
                className="bg-purple hover:bg-purple-dark text-white px-4 py-2 rounded-lg font-medium transition-colors"
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
                  className="text-purple hover:text-purple-light transition-colors"
                >
                  Create your first list →
                </Link>
              )}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {typedLists.map((list) => (
                <Link
                  key={list.id}
                  href={`/list/${list.id}`}
                  className="block bg-background-card border border-purple/10 rounded-lg p-4 hover:border-purple/30 transition-colors"
                >
                  {/* Cover preview - sorted by position */}
                  <div className="flex gap-1 mb-3 h-16 overflow-hidden rounded">
                    {[...list.list_items]
                      .sort((a, b) => a.position - b.position)
                      .slice(0, 4)
                      .map((item, i) => (
                        <div key={i} className="flex-1 bg-background-secondary">
                          {item.game_cover_id && (
                            <Image
                              src={getCoverUrl(item.game_cover_id, 'cover_small')}
                              alt=""
                              width={45}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      ))}
                    {list.list_items.length < 4 &&
                      [...Array(4 - list.list_items.length)].map((_, i) => (
                        <div key={`empty-${i}`} className="flex-1 bg-background-secondary" />
                      ))}
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{list.name}</h3>
                      {list.description && (
                        <p className="text-sm text-foreground-muted truncate mt-1">
                          {list.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {list.is_ranked && (
                        <span className="px-2 py-0.5 bg-gold/20 text-gold text-xs rounded">
                          Ranked
                        </span>
                      )}
                      {!list.is_public && (
                        <span className="px-2 py-0.5 bg-purple/20 text-purple text-xs rounded">
                          Private
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-foreground-muted mt-2">
                    {list.list_items.length} games
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
