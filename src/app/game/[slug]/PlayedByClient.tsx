'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Friend {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  rating: number | null
  review: string | null
}

interface Props {
  friends: Friend[]
  gameName: string
}

export function PlayedByClient({ friends, gameName }: Props) {
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)

  const handleFriendClick = (friend: Friend) => {
    if (friend.review) {
      setSelectedFriend(friend)
    }
  }

  return (
    <>
      <div className="flex gap-3">
        {friends.map((friend) => (
          friend.review ? (
            <button
              key={friend.id}
              onClick={() => handleFriendClick(friend)}
              className="flex flex-col items-center"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-background-secondary overflow-hidden">
                  {friend.avatar_url ? (
                    <Image
                      src={friend.avatar_url}
                      alt={friend.username}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm bg-gradient-to-br from-purple/30 to-purple-dark/30">
                      {friend.username[0].toUpperCase()}
                    </div>
                  )}
                </div>
                {/* Review indicator - 3 lines icon */}
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-background-card rounded-full flex items-center justify-center border border-purple/30">
                  <svg className="w-3 h-3 text-foreground-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </div>
                {friend.rating && (
                  <div className="absolute -bottom-1 -right-1 bg-background-card px-1 rounded text-[10px] text-gold border border-purple/20">
                    {friend.rating}★
                  </div>
                )}
              </div>
            </button>
          ) : (
            <Link key={friend.id} href={`/user/${friend.username}`} className="flex flex-col items-center">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-background-secondary overflow-hidden">
                  {friend.avatar_url ? (
                    <Image
                      src={friend.avatar_url}
                      alt={friend.username}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm bg-gradient-to-br from-purple/30 to-purple-dark/30">
                      {friend.username[0].toUpperCase()}
                    </div>
                  )}
                </div>
                {friend.rating && (
                  <div className="absolute -bottom-1 -right-1 bg-background-card px-1 rounded text-[10px] text-gold border border-purple/20">
                    {friend.rating}★
                  </div>
                )}
              </div>
            </Link>
          )
        ))}
      </div>

      {/* Friend Review Modal */}
      {selectedFriend && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedFriend(null)}
        >
          <div
            className="bg-background-card border border-purple/20 rounded-xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-purple/10">
              <div className="w-12 h-12 rounded-full bg-background-secondary overflow-hidden flex-shrink-0">
                {selectedFriend.avatar_url ? (
                  <Image
                    src={selectedFriend.avatar_url}
                    alt={selectedFriend.username}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg bg-gradient-to-br from-purple/30 to-purple-dark/30">
                    {selectedFriend.username[0].toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold">{selectedFriend.display_name || selectedFriend.username}</h3>
                <p className="text-foreground-muted text-sm">Review of {gameName}</p>
              </div>
              {selectedFriend.rating && (
                <span className="text-gold text-sm flex-shrink-0">
                  {'★'.repeat(Math.floor(selectedFriend.rating))}
                  {selectedFriend.rating % 1 >= 0.5 && '½'}
                </span>
              )}
              <button
                onClick={() => setSelectedFriend(null)}
                className="text-foreground-muted p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Review Content */}
            <div className="p-4 overflow-y-auto flex-1">
              <p className="text-foreground-muted whitespace-pre-wrap">{selectedFriend.review}</p>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-purple/10">
              <Link
                href={`/user/${selectedFriend.username}`}
                className="block w-full text-center bg-purple text-white py-2 rounded-lg font-medium"
              >
                View {selectedFriend.display_name || selectedFriend.username}'s Profile
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
