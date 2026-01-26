import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SearchBar } from './SearchBar'
import { BottomNav } from './BottomNav'
import { Button } from '@/components/ui/button'

export async function Navigation() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get username and avatar if logged in
  let username: string | null = null
  let avatarUrl: string | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', user.id)
      .single()
    username = profile?.username || null
    avatarUrl = profile?.avatar_url || null
  }

  return (
    <>
      {/* Top Navigation - scrolls with page on mobile, fixed on desktop */}
      <nav className="lg:fixed lg:top-0 lg:left-0 lg:right-0 z-50 bg-background border-b border-purple/10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple to-gold bg-clip-text text-transparent">
              GameRate
            </span>
          </Link>

          {/* Search Bar - Hidden on mobile, shown on md+ */}
          <div className="hidden md:block flex-1 max-w-md">
            <SearchBar variant="nav" placeholder="Search games..." />
          </div>

          <div className="hidden lg:flex items-center gap-6">
            <Link href="/games" className="text-foreground-muted hover:text-foreground transition-colors text-sm">
              Games
            </Link>
            <Link href="/lists" className="text-foreground-muted hover:text-foreground transition-colors text-sm">
              Lists
            </Link>
            <Link href="/players" className="text-foreground-muted hover:text-foreground transition-colors text-sm">
              Players
            </Link>
          </div>

          {!user && (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Create account</Link>
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <BottomNav username={username} avatarUrl={avatarUrl} />
    </>
  )
}
