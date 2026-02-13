import { Navigation } from "@/components/Navigation";

export default function GameLoading() {
  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Backdrop skeleton */}
      <div className="relative w-full h-[45vh] min-h-[300px] bg-purple/5 animate-pulse" />

      {/* Content skeleton */}
      <div className="px-4 -mt-20 relative z-10">
        <div className="max-w-4xl lg:max-w-6xl mx-auto">
          <div className="flex gap-4">
            {/* Title area */}
            <div className="flex-1 min-w-0 pt-4 space-y-3">
              <div className="h-7 w-3/4 bg-background-card rounded animate-pulse" />
              <div className="h-4 w-1/3 bg-background-card rounded animate-pulse" />
              <div className="flex gap-1.5 mt-3">
                <div className="h-5 w-16 bg-background-card rounded animate-pulse" />
                <div className="h-5 w-14 bg-background-card rounded animate-pulse" />
              </div>
            </div>

            {/* Poster skeleton */}
            <div className="flex-shrink-0">
              <div className="w-28 sm:w-32 lg:w-44 aspect-[3/4] bg-background-card rounded-lg animate-pulse" />
            </div>
          </div>

          {/* Buttons skeleton */}
          <div className="flex flex-wrap gap-2 mt-6">
            <div className="h-9 w-32 bg-background-card rounded-lg animate-pulse" />
            <div className="h-9 w-24 bg-background-card rounded-lg animate-pulse" />
            <div className="h-9 w-20 bg-background-card rounded-lg animate-pulse" />
          </div>

          {/* Stars skeleton */}
          <div className="flex items-center gap-3 mt-4">
            <div className="h-4 w-20 bg-background-card rounded animate-pulse" />
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-8 w-8 bg-background-card rounded animate-pulse" />
              ))}
            </div>
          </div>

          {/* Summary skeleton */}
          <div className="mt-6 space-y-2">
            <div className="h-4 bg-background-card rounded w-full animate-pulse" />
            <div className="h-4 bg-background-card rounded w-full animate-pulse" />
            <div className="h-4 bg-background-card rounded w-3/4 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
