import Link from "next/link";

export default function GameLoading() {
  return (
    <div className="min-h-screen bg-background animate-pulse">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-purple/10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple to-gold bg-clip-text text-transparent">
              SavePoint
            </span>
          </Link>
        </div>
      </nav>

      {/* Hero Section Skeleton */}
      <div className="relative pt-16">
        <div className="absolute inset-0 h-[400px] bg-background-secondary" />

        <div className="relative max-w-6xl mx-auto px-4 pt-12 pb-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Cover Skeleton */}
            <div className="flex-shrink-0">
              <div className="w-64 aspect-[3/4] bg-background-card rounded-lg" />
            </div>

            {/* Details Skeleton */}
            <div className="flex-1 space-y-4">
              <div className="h-12 bg-background-card rounded-lg w-3/4" />
              <div className="flex gap-2">
                <div className="h-8 w-20 bg-background-card rounded-full" />
                <div className="h-8 w-24 bg-background-card rounded-full" />
                <div className="h-8 w-16 bg-background-card rounded-full" />
              </div>
              <div className="h-8 w-48 bg-background-card rounded-lg" />
              <div className="flex gap-3 pt-4">
                <div className="h-12 w-24 bg-background-card rounded-lg" />
                <div className="h-12 w-28 bg-background-card rounded-lg" />
                <div className="h-12 w-32 bg-background-card rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="h-6 w-24 bg-background-card rounded mb-4" />
              <div className="space-y-2">
                <div className="h-4 bg-background-card rounded w-full" />
                <div className="h-4 bg-background-card rounded w-full" />
                <div className="h-4 bg-background-card rounded w-3/4" />
              </div>
            </div>

            <div>
              <div className="h-6 w-32 bg-background-card rounded mb-4" />
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-video bg-background-card rounded-lg" />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="bg-background-card rounded-xl p-6 border border-purple/10">
              <div className="h-6 w-24 bg-background-secondary rounded mb-4" />
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i}>
                    <div className="h-3 w-20 bg-background-secondary rounded mb-2" />
                    <div className="h-5 w-32 bg-background-secondary rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
