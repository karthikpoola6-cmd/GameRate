import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Navigation } from '@/components/Navigation'
import { ListViewClient } from '@/components/ListViewClient'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface ListItem {
  id: string
  game_id: number
  game_slug: string
  game_name: string
  game_cover_id: string | null
  position: number
  notes: string | null
  added_at: string
  rating?: number | null
}

interface ListWithDetails {
  id: string
  name: string
  description: string | null
  is_public: boolean
  is_ranked: boolean
  user_id: string
  created_at: string
  updated_at: string
  profiles: {
    username: string
    display_name: string | null
    avatar_url: string | null
  }
  list_items: ListItem[]
}

export default async function ListPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: list } = await supabase
    .from('lists')
    .select(`
      *,
      profiles:user_id (username, display_name, avatar_url),
      list_items (*)
    `)
    .eq('id', id)
    .single()

  if (!list) {
    notFound()
  }

  const typedList = list as unknown as ListWithDetails
  const isOwner = user?.id === typedList.user_id

  // Check if user can view (public or owner)
  if (!typedList.is_public && !isOwner) {
    notFound()
  }

  // Sort items by position
  const sortedItems = [...typedList.list_items].sort((a, b) => a.position - b.position)

  // Fetch the list owner's ratings for these games
  const gameIds = sortedItems.map(item => item.game_id)
  let ratingMap: Record<number, number | null> = {}

  if (gameIds.length > 0) {
    const { data: ratings } = await supabase
      .from('game_logs')
      .select('game_id, rating')
      .eq('user_id', typedList.user_id)
      .in('game_id', gameIds)

    // Create a map of game_id -> rating
    ratings?.forEach(r => {
      ratingMap[r.game_id] = r.rating
    })
  }

  // Add ratings to items
  const itemsWithRatings = sortedItems.map(item => ({
    ...item,
    rating: ratingMap[item.game_id] ?? null
  }))

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back link */}
          <Link
            href={`/user/${typedList.profiles.username}/lists`}
            className="text-purple text-sm"
          >
            ← Back to {isOwner ? 'your' : `${typedList.profiles.username}'s`} lists
          </Link>

          {/* Header */}
          <div className="mb-8 mt-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">{typedList.name}</h1>
                {typedList.description && (
                  <p className="text-foreground-muted mt-2">{typedList.description}</p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {typedList.is_ranked && (
                  <span className="px-2 py-1 bg-gold/20 text-gold text-xs rounded">
                    Ranked
                  </span>
                )}
                {!typedList.is_public && (
                  <span className="px-2 py-1 bg-purple/20 text-purple text-xs rounded">
                    Private
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 mt-4 text-sm text-foreground-muted">
              <Link
                href={`/user/${typedList.profiles.username}`}
              >
                by @{typedList.profiles.username}
              </Link>
              <span>{sortedItems.length} games</span>
            </div>
          </div>

          {/* Games */}
          <ListViewClient
            listId={typedList.id}
            items={itemsWithRatings}
            listOwnerId={typedList.user_id}
            initialIsRanked={typedList.is_ranked}
          />
        </div>
      </main>
    </div>
  )
}
