'use client'

import { useEffect, useRef, ReactNode } from 'react'

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  delay?: number
  distance?: number
}

export function ScrollReveal({ children, className = '', delay = 0, distance = 40 }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.style.opacity = '1'
          element.style.transform = 'translateY(0)'
        } else {
          element.style.opacity = '0'
          element.style.transform = `translateY(${distance}px)`
        }
      },
      { threshold: 0.15 }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [distance])

  return (
    <div
      ref={ref}
      style={{
        opacity: 0,
        transform: `translateY(${distance}px)`,
        transition: `opacity 0.7s cubic-bezier(0.25, 0.1, 0.25, 1) ${delay}ms, transform 0.7s cubic-bezier(0.25, 0.1, 0.25, 1) ${delay}ms`,
      }}
      className={className}
    >
      {children}
    </div>
  )
}
