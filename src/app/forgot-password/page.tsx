'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="bg-background/80 backdrop-blur-md border-b border-purple/10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-1.5">
            <Image src="/GameRate.png" alt="GameRate" width={36} height={36} className="w-9 h-9" />
            <span className="text-xl font-medium tracking-wider bg-gradient-to-r from-purple to-gold bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-display)' }}>
              GameRate
            </span>
          </Link>
        </div>
      </nav>

      {/* Forgot Password Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="glass rounded-xl p-8 border border-purple/10 shadow-xl">
            <h1 className="text-2xl font-bold text-center mb-2">Reset your password</h1>
            <p className="text-foreground-muted text-center mb-8">
              Enter your email and we&apos;ll send you a reset link
            </p>

            {sent ? (
              <div>
                <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg text-sm mb-6">
                  Check your email for a password reset link. It may take a minute to arrive.
                </div>
                <div className="text-center text-sm text-foreground-muted">
                  <Link href="/login" className="text-purple">
                    Back to sign in
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
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
                    className="w-full bg-background-secondary border border-purple/20 rounded-lg py-3 px-4 text-foreground placeholder:text-foreground-muted/50 focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/20"
                    placeholder="you@example.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-purple disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium"
                >
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
              </form>
            )}

            {!sent && (
              <div className="mt-6 text-center text-sm text-foreground-muted">
                Remember your password?{' '}
                <Link href="/login" className="text-purple">
                  Sign in
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
