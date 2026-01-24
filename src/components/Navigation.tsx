import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { UserMenu } from './UserMenu'
import { SearchBar } from './SearchBar'

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
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-purple/10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <span className="text-2xl font-bold bg-gradient-to-r from-purple to-gold bg-clip-text text-transparent">
            SavePoint
          </span>
        </Link>

        {/* Search Bar - Hidden on mobile, shown on md+ */}
        <div className="hidden md:block flex-1 max-w-md">
          <SearchBar variant="nav" placeholder="Search games..." />
        </div>

        {/* Mobile search icon */}
        <Link
          href="/search"
          className="md:hidden text-foreground-muted hover:text-foreground transition-colors p-2"
          aria-label="Search"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </Link>

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

        {user ? (
          <UserMenu email={user.email || ''} username={username} avatarUrl={avatarUrl} />
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-foreground-muted hover:text-foreground transition-colors text-sm"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="bg-purple hover:bg-purple-dark text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
            >
              Create account
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
