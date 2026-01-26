import Link from 'next/link'

export default function UserNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-purple/10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple to-gold bg-clip-text text-transparent">
              GameRate
            </span>
          </Link>
        </div>
      </nav>

      <div className="text-center px-4">
        <div className="text-8xl mb-6">👤</div>
        <h1 className="text-4xl font-bold mb-4">User Not Found</h1>
        <p className="text-foreground-muted mb-8 max-w-md mx-auto">
          We couldn&apos;t find this user. They may have changed their username or deleted their account.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="bg-purple hover:bg-purple-dark text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/members"
            className="bg-background-card hover:bg-background-secondary text-foreground px-6 py-3 rounded-lg font-medium transition-colors border border-purple/20"
          >
            Browse Members
          </Link>
        </div>
      </div>
    </div>
  )
}
