'use client'

import { useEffect, useRef, useState } from 'react'

interface WordProps {
  children: string
  delay: number
  isVisible: boolean
  className?: string
}

function Word({ children, delay, isVisible, className = '' }: WordProps) {
  return (
    <span
      style={{
        display: 'inline-block',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.5s cubic-bezier(0.25, 0.1, 0.25, 1), transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)`,
        transitionDelay: `${delay}ms`,
      }}
      className={className}
    >
      {children}
    </span>
  )
}

interface WordRevealProps {
  words: Array<{ text: string; className?: string }>
  className?: string
  baseDelay?: number
  stagger?: number
}

export function WordReveal({ words, className = '', baseDelay = 0, stagger = 60 }: WordRevealProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <span ref={ref} className={className} style={{ display: 'inline' }}>
      {words.map((word, i) => (
        <span key={i}>
          <Word
            delay={baseDelay + i * stagger}
            isVisible={isVisible}
            className={word.className}
          >
            {word.text}
          </Word>
          {i < words.length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </span>
  )
}
