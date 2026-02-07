'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface UserListItemProps {
  user: {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
  }
  currentUserId: string | null
  initialFollowing: boolean
}

export function UserListItem({ user, currentUserId, initialFollowing }: UserListItemProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const isOwnProfile = currentUserId === user.id
  const showFollowButton = currentUserId && !isOwnProfile && !isFollowing

  async function handleFollow(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    if (!currentUserId || loading) return

    setLoading(true)

    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: currentUserId,
        following_id: user.id,
      })

    if (!error) {
      setIsFollowing(true)
      toast.success(`Following ${user.display_name || user.username}`)
    }

    setLoading(false)
  }

  return (
    <Link
      href={`/user/${user.username}`}
      className="flex items-center gap-4 p-4 glass border border-purple/10 rounded-lg"
    >
      <div className="w-12 h-12 rounded-full bg-background-secondary overflow-hidden flex-shrink-0">
        {user.avatar_url ? (
          <Image
            src={user.avatar_url}
            alt={user.username}
            width={48}
            height={48}
            className="w-full h-full object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xl bg-gradient-to-br from-purple/30 to-purple-dark/30">
            {user.username[0].toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate">{user.display_name || user.username}</h3>
        <p className="text-sm text-foreground-muted">@{user.username}</p>
      </div>

      {showFollowButton && (
        <button
          onClick={handleFollow}
          disabled={loading}
          className="w-8 h-8 flex items-center justify-center bg-purple text-white rounded-full flex-shrink-0 active:scale-95 disabled:opacity-50"
          aria-label={`Follow ${user.username}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}
    </Link>
  )
}
