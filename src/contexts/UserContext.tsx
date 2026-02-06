'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface UserProfile {
  username: string | null
  avatarUrl: string | null
}

interface UserContextType {
  user: User | null
  profile: UserProfile
  isLoading: boolean
  hasMounted: boolean
}

const UserContext = createContext<UserContextType>({
  user: null,
  profile: { username: null, avatarUrl: null },
  isLoading: true,
  hasMounted: false,
})

// Cache keys for localStorage
const CACHE_USERNAME = 'gamerate_cached_username'
const CACHE_AVATAR = 'gamerate_cached_avatar'

function setCachedProfile(profile: UserProfile) {
  if (typeof window === 'undefined') return
  if (profile.username) {
    localStorage.setItem(CACHE_USERNAME, profile.username)
  } else {
    localStorage.removeItem(CACHE_USERNAME)
  }
  if (profile.avatarUrl) {
    localStorage.setItem(CACHE_AVATAR, profile.avatarUrl)
  } else {
    localStorage.removeItem(CACHE_AVATAR)
  }
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile>({ username: null, avatarUrl: null })
  const [isLoading, setIsLoading] = useState(true)
  const [hasMounted, setHasMounted] = useState(false)
  const supabase = createClient()

  // Load cached profile on mount (client-side only)
  useEffect(() => {
    const cached = {
      username: localStorage.getItem(CACHE_USERNAME),
      avatarUrl: localStorage.getItem(CACHE_AVATAR),
    }
    if (cached.username || cached.avatarUrl) {
      setProfile(cached)
    }
    setHasMounted(true)
  }, [])

  useEffect(() => {
    // Fetch initial user
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', user.id)
          .single()

        const newProfile = {
          username: profileData?.username || null,
          avatarUrl: profileData?.avatar_url || null,
        }
        setProfile(newProfile)
        setCachedProfile(newProfile)
      }

      setIsLoading(false)
    }

    fetchUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user || null
      setUser(currentUser)

      if (currentUser) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', currentUser.id)
          .single()

        const newProfile = {
          username: profileData?.username || null,
          avatarUrl: profileData?.avatar_url || null,
        }
        setProfile(newProfile)
        setCachedProfile(newProfile)
      } else {
        const emptyProfile = { username: null, avatarUrl: null }
        setProfile(emptyProfile)
        setCachedProfile(emptyProfile)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  return (
    <UserContext.Provider value={{ user, profile, isLoading, hasMounted }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
