import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { SearchBar } from './SearchBar'
import { BottomNav } from './BottomNav'
import { SettingsMenu } from './SettingsMenu'
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
          <Link href="/home" className="flex items-center gap-1.5 flex-shrink-0">
            <Image
              src="/GameRate.png"
              alt="GameRate"
              width={36}
              height={36}
              className="w-9 h-9"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple to-gold bg-clip-text text-transparent">
              GameRate
            </span>
          </Link>

          {/* Search Bar - Hidden on mobile, shown on md+ */}
          <div className="hidden md:block flex-1 max-w-md">
            <SearchBar variant="nav" placeholder="Search games..." />
          </div>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-6">
            <Link href="/games" className="text-foreground-muted text-sm">
              Games
            </Link>
            <Link href="/lists" className="text-foreground-muted text-sm">
              Lists
            </Link>
            <Link href="/players" className="text-foreground-muted text-sm">
              Players
            </Link>
          </div>

          {/* Right side - Profile & Settings for logged in, Sign in/up for logged out */}
          {user ? (
            <div className="flex items-center gap-3">
              <SettingsMenu />
              {/* Desktop Profile Avatar - links directly to profile */}
              {username && (
                <Link
                  href={`/user/${username}`}
                  className="hidden lg:flex items-center gap-2"
                  title="View Profile"
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-purple/20 flex items-center justify-center ring-2 ring-purple/30">
                    {avatarUrl ? (
                      <Image
                        src={avatarUrl}
                        alt="Profile"
                        width={36}
                        height={36}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <span className="text-purple font-medium text-sm">
                        {username.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                </Link>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild className="hidden sm:inline-flex">
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
