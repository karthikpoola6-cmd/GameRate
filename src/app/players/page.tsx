import Link from 'next/link'
import Image from 'next/image'
import { Navigation } from '@/components/Navigation'
import { PlayerSearch } from '@/components/PlayerSearch'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

interface PlayerResult {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
}

export default async function PlayersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q: searchQuery } = await searchParams
  const supabase = await createClient()

  let players: PlayerResult[] = []

  // Only fetch if there's a search query
  if (searchQuery && searchQuery.trim().length >= 2) {
    const { data } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`)
      .limit(20)

    players = data || []
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Find Players</h1>
            <p className="text-foreground-muted">Search for friends by username</p>
          </div>

          <PlayerSearch />

          {/* Results */}
          {searchQuery && searchQuery.trim().length >= 2 && (
            <div className="mt-8">
              {players.length === 0 ? (
                <p className="text-center text-foreground-muted">
                  No players found for &quot;{searchQuery}&quot;
                </p>
              ) : (
                <div className="space-y-3">
                  {players.map((player) => (
                    <Link
                      key={player.id}
                      href={`/user/${player.username}`}
                      className="flex items-center gap-4 p-4 bg-background-card border border-purple/10 rounded-lg hover:border-purple/30 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full bg-background-secondary overflow-hidden flex-shrink-0">
                        {player.avatar_url ? (
                          <Image
                            src={player.avatar_url}
                            alt={player.username}
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xl bg-gradient-to-br from-purple/30 to-purple-dark/30">
                            {player.username[0].toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">
                          {player.display_name || player.username}
                        </h3>
                        <p className="text-sm text-foreground-muted">@{player.username}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Hint when no search */}
          {(!searchQuery || searchQuery.trim().length < 2) && (
            <p className="text-center text-foreground-muted mt-8 text-sm">
              Enter at least 2 characters to search
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
