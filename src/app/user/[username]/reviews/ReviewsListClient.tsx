'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { getCoverUrl } from '@/lib/igdb'

interface Review {
  id: string
  game_slug: string
  game_name: string
  game_cover_id: string | null
  rating: number | null
  review: string
  updated_at: string
}

export function ReviewsListClient({ reviews }: { reviews: Review[] }) {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)

  return (
    <>
      <div className="space-y-6">
        {reviews.map((review) => (
          <button
            key={review.id}
            onClick={() => setSelectedReview(review)}
            className="flex gap-4 group w-full text-left"
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
              <p className="text-sm text-foreground-muted line-clamp-3 text-left">{review.review}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Review Modal */}
      {selectedReview && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedReview(null)}
        >
          <div
            className="bg-background-card border border-purple/20 rounded-xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start gap-4 p-4 border-b border-purple/10">
              <div className="w-16 h-20 bg-background-card rounded-lg overflow-hidden flex-shrink-0">
                {selectedReview.game_cover_id ? (
                  <Image
                    src={getCoverUrl(selectedReview.game_cover_id, 'cover_small')}
                    alt={selectedReview.game_name}
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
                <h3 className="font-bold text-lg">{selectedReview.game_name}</h3>
                {selectedReview.rating && (
                  <span className="text-gold text-sm">
                    {'★'.repeat(Math.floor(selectedReview.rating))}
                    {selectedReview.rating % 1 >= 0.5 && '½'}
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelectedReview(null)}
                className="text-foreground-muted hover:text-foreground p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Review Content */}
            <div className="p-4 overflow-y-auto flex-1">
              <p className="text-foreground-muted whitespace-pre-wrap">{selectedReview.review}</p>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-purple/10">
              <Link
                href={`/game/${selectedReview.game_slug}`}
                className="block w-full text-center bg-purple hover:bg-purple-dark text-white py-2 rounded-lg font-medium transition-colors"
              >
                View Game
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
