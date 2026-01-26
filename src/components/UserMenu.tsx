'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface UserMenuProps {
  email: string
  username: string | null
  avatarUrl: string | null
}

export function UserMenu({ email, username, avatarUrl }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  // Get initials from email
  const initials = email.slice(0, 2).toUpperCase()

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 bg-purple/20 hover:bg-purple/30 rounded-full flex items-center justify-center text-purple font-medium transition-colors overflow-hidden"
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt="Profile"
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        ) : (
          initials
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-background-card border border-purple/10 rounded-xl shadow-xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-purple/10">
            <p className="text-sm text-foreground-muted">Signed in as</p>
            <p className="text-sm font-medium truncate">{email}</p>
          </div>

          <div className="py-2">
            <Link
              href={username ? `/user/${username}` : '/setup-username'}
              className="block px-4 py-2 text-sm text-foreground-muted hover:text-foreground hover:bg-background-secondary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Your Profile
            </Link>
            <Link
              href={username ? `/user/${username}/want-to-play` : '/setup-username'}
              className="block px-4 py-2 text-sm text-foreground-muted hover:text-foreground hover:bg-background-secondary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Want to Play
            </Link>
            <Link
              href={username ? `/user/${username}/lists` : '/setup-username'}
              className="block px-4 py-2 text-sm text-foreground-muted hover:text-foreground hover:bg-background-secondary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Your Lists
            </Link>
            <Link
              href="/settings/profile"
              className="block px-4 py-2 text-sm text-foreground-muted hover:text-foreground hover:bg-background-secondary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Settings
            </Link>
          </div>

          <div className="border-t border-purple/10 py-2">
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-background-secondary transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
