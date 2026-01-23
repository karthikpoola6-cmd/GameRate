'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface FollowButtonClientProps {
  profileId: string
  initialFollowing: boolean
}

export function FollowButtonClient({ profileId, initialFollowing }: FollowButtonClientProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleClick() {
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    if (isFollowing) {
      // Unfollow
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', profileId)

      setIsFollowing(false)
    } else {
      // Follow
      await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: profileId,
        })

      setIsFollowing(true)
    }

    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`px-6 py-2 rounded-lg font-medium transition-colors ${
        isFollowing
          ? 'bg-background-card hover:bg-red-500/20 hover:text-red-400 text-foreground border border-purple/20'
          : 'bg-purple hover:bg-purple-dark text-white'
      }`}
    >
      {loading ? '...' : isFollowing ? 'Following' : 'Follow'}
    </button>
  )
}
