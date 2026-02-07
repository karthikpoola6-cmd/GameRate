import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Navigation } from '@/components/Navigation'
import { ReviewsListClient } from './ReviewsListClient'

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
  const { data: { user: currentUser } } = await supabase.auth.getUser()

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, display_name')
    .ilike('username', username)
    .single()

  if (!profile) {
    notFound()
  }

  const isOwnProfile = currentUser?.id === profile.id

  // Get all reviews
  const { data: reviews } = await supabase
    .from('game_logs')
    .select('id, game_slug, game_name, game_cover_id, rating, review, updated_at')
    .eq('user_id', profile.id)
    .not('review', 'is', null)
    .order('updated_at', { ascending: false })

  const typedReviews = (reviews || []) as Review[]

  return (
    <div className="min-h-screen">
      <Navigation />

      <main className="pt-4 lg:pt-24 pb-16 px-4">
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
              {isOwnProfile ? 'Your Reviews' : `${profile.display_name || profile.username}'s Reviews`}
            </h1>
            <p className="text-foreground-muted text-sm">{typedReviews.length} reviews</p>
          </div>

          {/* Reviews List */}
          {typedReviews.length > 0 ? (
            <ReviewsListClient reviews={typedReviews} />
          ) : (
            <div className="text-center py-12">
              <p className="text-foreground-muted mb-4">
                {isOwnProfile ? "You haven't written any reviews yet" : "No reviews yet"}
              </p>
              {isOwnProfile && (
                <Link
                  href="/"
                  className="text-purple"
                >
                  Find a game to review →
                </Link>
              )}
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
    .ilike('username', username)
    .single()

  if (!profile) {
    return { title: 'User Not Found | GameRate' }
  }

  return {
    title: `${profile.display_name || profile.username}'s Reviews | GameRate`,
  }
}
