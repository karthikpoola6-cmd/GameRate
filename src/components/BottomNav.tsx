'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

interface BottomNavProps {
  username: string | null
  avatarUrl: string | null
}

export function BottomNav({ username, avatarUrl }: BottomNavProps) {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === '/home') return pathname === '/home' || pathname === '/'
    if (path === '/profile') return pathname.startsWith('/user/')
    return pathname.startsWith(path)
  }

  const navItems = [
    {
      href: '/home',
      label: 'Home',
      path: '/home',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      href: '/search',
      label: 'Search',
      path: '/search',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      href: '/players',
      label: 'Players',
      path: '/players',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      href: username ? `/user/${username}` : '/login',
      label: 'Profile',
      path: '/profile',
      icon: avatarUrl ? (
        <Image
          src={avatarUrl}
          alt="Profile"
          width={28}
          height={28}
          className="w-7 h-7 rounded-full object-cover ring-2 ring-transparent"
        />
      ) : (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-purple/20">
      <div className="flex items-center justify-around h-18 px-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.href}
            className={`flex flex-col items-center justify-center py-2 px-4 rounded-xl ${
              isActive(item.path)
                ? 'text-purple'
                : 'text-foreground-muted'
            }`}
          >
            {item.icon}
            <span className="text-[11px] mt-1.5 font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  )
}
