'use client'

import { useRouter } from 'next/navigation'

export function BackButton() {
  const router = useRouter()

  function handleBack() {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/home')
    }
  }

  return (
    <button
      onClick={handleBack}
      className="absolute top-3 left-3 z-10 w-10 h-10 flex items-center justify-center bg-black/40 rounded-full"
    >
      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  )
}
