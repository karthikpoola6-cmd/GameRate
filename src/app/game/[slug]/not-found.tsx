import Link from "next/link";
import Image from "next/image";

export default function GameNotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-purple/10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5">
            <Image src="/GameRate.png" alt="GameRate" width={36} height={36} className="w-9 h-9" />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple to-gold bg-clip-text text-transparent">
              GameRate
            </span>
          </Link>
        </div>
      </nav>

      <div className="text-center px-4">
        <div className="text-8xl mb-6">🎮</div>
        <h1 className="text-4xl font-bold mb-4">Game Not Found</h1>
        <p className="text-foreground-muted mb-8 max-w-md mx-auto">
          We couldn&apos;t find the game you&apos;re looking for. It may have been removed or the URL might be incorrect.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="bg-purple hover:bg-purple-dark text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/games"
            className="bg-background-card hover:bg-background-secondary text-foreground px-6 py-3 rounded-lg font-medium transition-colors border border-purple/20"
          >
            Browse Games
          </Link>
        </div>
      </div>
    </div>
  );
}
