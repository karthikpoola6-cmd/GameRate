'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SetupUsernamePage() {
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)
  const [available, setAvailable] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [currentUsername, setCurrentUsername] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Load current username on mount
  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single()

      if (profile) {
        setCurrentUsername(profile.username)
        // Pre-fill with current username if it looks auto-generated
        if (profile.username.includes('_')) {
          setUsername('')
        } else {
          setUsername(profile.username)
        }
      }
    }
    loadProfile()
  }, [supabase, router])

  // Check username availability with debounce
  useEffect(() => {
    if (!username || username.length < 3) {
      setAvailable(null)
      return
    }

    const timer = setTimeout(async () => {
      setChecking(true)
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .ilike('username', username)
        .single()

      // Available if no data found OR it's the current user's username (case-insensitive)
      setAvailable(!data || data.username.toLowerCase() === currentUsername?.toLowerCase())
      setChecking(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [username, currentUsername, supabase])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const cleanUsername = username.trim()

    // Validate format
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(cleanUsername)) {
      setError('Username must be 3-20 characters, only letters, numbers, and underscores')
      return
    }

    if (!available) {
      setError('Username is not available')
      return
    }

    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('Not logged in')
      setLoading(false)
      return
    }

    // Use upsert to handle case where profile doesn't exist yet
    const { error: updateError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        username: cleanUsername
      }, {
        onConflict: 'id'
      })

    if (updateError) {
      if (updateError.code === '23505') {
        setError('Username is already taken')
      } else {
        setError(updateError.message)
      }
      setLoading(false)
      return
    }

    // Refresh to clear any cached data, then redirect
    router.refresh()
    // Brief delay to ensure database write propagates
    await new Promise(resolve => setTimeout(resolve, 500))
    router.push(`/user/${cleanUsername}`)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <nav className="bg-background/80 backdrop-blur-md border-b border-purple/10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple to-gold bg-clip-text text-transparent">
              SavePoint
            </span>
          </Link>
        </div>
      </nav>

      {/* Setup Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-background-card rounded-xl p-8 border border-purple/10 shadow-xl">
            <h1 className="text-2xl font-bold text-center mb-2">Choose your username</h1>
            <p className="text-foreground-muted text-center mb-8">
              This is how other users will find you
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-2">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted">@</span>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                    required
                    maxLength={20}
                    className="w-full bg-background-secondary border border-purple/20 rounded-lg py-3 px-4 pl-8 text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/20 transition-all"
                    placeholder="YourUsername"
                  />
                  {username.length >= 3 && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2">
                      {checking ? (
                        <span className="text-foreground-muted">...</span>
                      ) : available ? (
                        <span className="text-green-500">✓</span>
                      ) : (
                        <span className="text-red-500">✗</span>
                      )}
                    </span>
                  )}
                </div>
                <p className="text-xs text-foreground-muted mt-2">
                  3-20 characters. Letters (A-Z), numbers, and underscores.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || !available || username.length < 3}
                className="w-full bg-purple hover:bg-purple-dark disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors"
              >
                {loading ? 'Saving...' : 'Continue'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
