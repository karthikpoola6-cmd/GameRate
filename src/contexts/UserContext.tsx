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
}

const UserContext = createContext<UserContextType>({
  user: null,
  profile: { username: null, avatarUrl: null },
  isLoading: true,
})

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile>({ username: null, avatarUrl: null })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

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

        setProfile({
          username: profileData?.username || null,
          avatarUrl: profileData?.avatar_url || null,
        })
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

        setProfile({
          username: profileData?.username || null,
          avatarUrl: profileData?.avatar_url || null,
        })
      } else {
        setProfile({ username: null, avatarUrl: null })
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  return (
    <UserContext.Provider value={{ user, profile, isLoading }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}
