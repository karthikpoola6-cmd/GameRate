'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
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

      {/* Login Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-background-card rounded-xl p-8 border border-purple/10 shadow-xl">
            <h1 className="text-2xl font-bold text-center mb-2">Welcome back</h1>
            <p className="text-foreground-muted text-center mb-8">
              Sign in to your SavePoint account
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-background-secondary border border-purple/20 rounded-lg py-3 px-4 text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/20 transition-all"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-background-secondary border border-purple/20 rounded-lg py-3 px-4 text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/20 transition-all"
                  placeholder="Your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple hover:bg-purple-dark disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-foreground-muted">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-purple hover:text-purple-light transition-colors">
                Create one
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
