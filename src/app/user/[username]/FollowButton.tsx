'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

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
      toast.success('Unfollowed')
    } else {
      // Follow
      await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: profileId,
        })

      setIsFollowing(true)
      toast.success('Following')
    }

    setLoading(false)
    router.refresh()
  }

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      variant={isFollowing ? 'outline' : 'default'}
      size="sm"
    >
      {loading ? '...' : isFollowing ? 'Following' : 'Follow'}
    </Button>
  )
}
