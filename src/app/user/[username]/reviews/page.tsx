import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Navigation } from '@/components/Navigation'
import { getCoverUrl } from '@/lib/igdb'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ username: string }>
}

interface Review {
  id: string
  game_slug: string
  game_name: string
  game_cover_id: string | null
  rating: number | null
  review: string
  updated_at: string
}

export default async function UserReviewsPage({ params }: PageProps) {
  const { username } = await params
  const supabase = await createClient()

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, display_name')
    .eq('username', username.toLowerCase())
    .single()

  if (!profile) {
    notFound()
  }

  // Get all reviews
  const { data: reviews } = await supabase
    .from('game_logs')
    .select('id, game_slug, game_name, game_cover_id, rating, review, updated_at')
    .eq('user_id', profile.id)
    .not('review', 'is', null)
    .order('updated_at', { ascending: false })

  const typedReviews = (reviews || []) as Review[]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Link
              href={`/user/${username}`}
              className="text-purple text-sm"
            >
              ← Back to profile
            </Link>
            <h1 className="text-2xl font-bold mt-3">
              {profile.display_name || profile.username}&apos;s Reviews
            </h1>
            <p className="text-foreground-muted text-sm">{typedReviews.length} reviews</p>
          </div>

          {/* Reviews List */}
          {typedReviews.length > 0 ? (
            <div className="space-y-6">
              {typedReviews.map((review) => (
                <Link
                  key={review.id}
                  href={`/game/${review.game_slug}`}
                  className="flex gap-4 group"
                >
                  <div className="w-16 h-20 bg-background-card rounded-lg overflow-hidden flex-shrink-0">
                    {review.game_cover_id ? (
                      <Image
                        src={getCoverUrl(review.game_cover_id, 'cover_small')}
                        alt={review.game_name}
                        width={64}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-purple/20">
                        <span className="text-xl">🎮</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold truncate">{review.game_name}</p>
                      {review.rating && (
                        <span className="text-gold text-sm flex-shrink-0">
                          {'★'.repeat(Math.floor(review.rating))}
                          {review.rating % 1 >= 0.5 && '½'}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground-muted line-clamp-3">{review.review}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-foreground-muted">No reviews yet</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export async function generateMetadata({ params }: PageProps) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, display_name')
    .eq('username', username.toLowerCase())
    .single()

  if (!profile) {
    return { title: 'User Not Found | SavePoint' }
  }

  return {
    title: `${profile.display_name || profile.username}'s Reviews | SavePoint`,
  }
}
