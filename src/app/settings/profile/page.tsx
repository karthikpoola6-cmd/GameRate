'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'

export default function EditProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // Load profile on mount
  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data)
        setUsername(data.username)
        setDisplayName(data.display_name || '')
        setBio(data.bio || '')
      }
    }
    loadProfile()
  }, [supabase, router])

  // Check username availability
  useEffect(() => {
    if (!username || username.length < 3 || username === profile?.username) {
      setUsernameAvailable(username === profile?.username ? true : null)
      return
    }

    const timer = setTimeout(async () => {
      setCheckingUsername(true)
      const { data } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username.toLowerCase())
        .single()

      setUsernameAvailable(!data)
      setCheckingUsername(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [username, profile?.username, supabase])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    const cleanUsername = username.toLowerCase().trim()

    if (!/^[a-z0-9_]{3,20}$/.test(cleanUsername)) {
      setError('Username must be 3-20 characters, only letters, numbers, and underscores')
      return
    }

    if (!usernameAvailable && cleanUsername !== profile?.username) {
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

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        username: cleanUsername,
        display_name: displayName.trim() || null,
        bio: bio.trim() || null,
      })
      .eq('id', user.id)

    if (updateError) {
      if (updateError.code === '23505') {
        setError('Username is already taken')
      } else {
        setError(updateError.message)
      }
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)

    // If username changed, redirect to new profile
    if (cleanUsername !== profile?.username) {
      setTimeout(() => {
        router.push(`/user/${cleanUsername}`)
      }, 1000)
    }
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground-muted">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-background/80 backdrop-blur-md border-b border-purple/10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple to-gold bg-clip-text text-transparent">
              SavePoint
            </span>
          </Link>
          <Link
            href={`/user/${profile.username}`}
            className="text-foreground-muted hover:text-foreground transition-colors"
          >
            Back to profile
          </Link>
        </div>
      </nav>

      {/* Edit Form */}
      <div className="max-w-xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold mb-8">Edit Profile</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg text-sm">
              Profile updated successfully!
            </div>
          )}

          {/* Username */}
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
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                required
                maxLength={20}
                className="w-full bg-background-secondary border border-purple/20 rounded-lg py-3 px-4 pl-8 text-foreground focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/20 transition-all"
              />
              {username.length >= 3 && username !== profile.username && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2">
                  {checkingUsername ? (
                    <span className="text-foreground-muted">...</span>
                  ) : usernameAvailable ? (
                    <span className="text-green-500">✓</span>
                  ) : (
                    <span className="text-red-500">✗</span>
                  )}
                </span>
              )}
            </div>
            <p className="text-xs text-foreground-muted mt-1">
              3-20 characters. Letters, numbers, and underscores only.
            </p>
          </div>

          {/* Display Name */}
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium mb-2">
              Display Name <span className="text-foreground-muted">(optional)</span>
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={50}
              className="w-full bg-background-secondary border border-purple/20 rounded-lg py-3 px-4 text-foreground focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/20 transition-all"
              placeholder="Your display name"
            />
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium mb-2">
              Bio <span className="text-foreground-muted">(optional)</span>
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={300}
              rows={4}
              className="w-full bg-background-secondary border border-purple/20 rounded-lg py-3 px-4 text-foreground focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/20 transition-all resize-none"
              placeholder="Tell us about yourself..."
            />
            <p className="text-xs text-foreground-muted mt-1 text-right">
              {bio.length}/300
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || (username !== profile.username && !usernameAvailable)}
            className="w-full bg-purple hover:bg-purple-dark disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}
