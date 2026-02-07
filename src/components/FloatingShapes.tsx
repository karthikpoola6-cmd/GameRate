'use client'

import { useEffect, useRef } from 'react'

interface Sprite {
  x: number
  y: number
  speedX: number
  speedY: number
  type: number
  color: string
  glowColor: string
  scale: number
}

// Pixel art sprite patterns (each row is a line, 1 = filled, 0 = empty)
const spritePatterns = [
  // Ghost pet
  [
    [0,0,1,1,1,0,0],
    [0,1,1,1,1,1,0],
    [1,1,0,1,0,1,1],
    [1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1],
    [1,0,1,0,1,0,1],
  ],
  // Robot pet
  [
    [0,1,1,1,1,1,0],
    [1,1,1,1,1,1,1],
    [1,0,1,1,1,0,1],
    [1,1,1,1,1,1,1],
    [0,1,0,0,0,1,0],
    [0,1,1,1,1,1,0],
  ],
  // Alien pet
  [
    [0,0,1,0,1,0,0],
    [0,0,1,1,1,0,0],
    [0,1,1,1,1,1,0],
    [1,0,1,1,1,0,1],
    [1,0,1,0,1,0,1],
    [0,0,1,0,1,0,0],
  ],
  // Blob pet
  [
    [0,0,1,1,1,0,0],
    [0,1,1,1,1,1,0],
    [1,1,0,1,0,1,1],
    [1,1,1,1,1,1,1],
    [0,1,1,1,1,1,0],
    [0,0,1,0,1,0,0],
  ],
  // Crab pet
  [
    [1,0,0,0,0,0,1],
    [0,1,1,1,1,1,0],
    [1,1,0,1,0,1,1],
    [0,1,1,1,1,1,0],
    [0,0,1,0,1,0,0],
    [0,1,0,0,0,1,0],
  ],
]

interface ExclusionZone {
  x: number
  y: number
  radius: number
}

export function FloatingShapes({ exclusionZone }: { exclusionZone?: ExclusionZone }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const spritesRef = useRef<Sprite[]>([])
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect()
      if (rect) {
        canvas.width = rect.width
        canvas.height = rect.height
      }
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Colors from GameRate theme
    const colorPairs = [
      { fill: '#a78bfa', glow: '#8b5cf6' },   // purple
      { fill: '#c4b5fd', glow: '#a78bfa' },   // light purple
      { fill: '#fbbf24', glow: '#f59e0b' },   // gold
      { fill: '#f472b6', glow: '#ec4899' },   // pink
      { fill: '#60a5fa', glow: '#3b82f6' },   // blue
      { fill: '#34d399', glow: '#10b981' },   // green
    ]

    // Initialize sprites
    const numSprites = 12

    spritesRef.current = Array.from({ length: numSprites }, () => {
      const colorPair = colorPairs[Math.floor(Math.random() * colorPairs.length)]
      return {
        x: Math.random() * (canvas.width - 60) + 30,
        y: Math.random() * (canvas.height - 60) + 30,
        speedX: (Math.random() - 0.5) * 0.6 + (Math.random() > 0.5 ? 0.2 : -0.2),
        speedY: (Math.random() - 0.5) * 0.6 + (Math.random() > 0.5 ? 0.2 : -0.2),
        type: Math.floor(Math.random() * spritePatterns.length),
        color: colorPair.fill,
        glowColor: colorPair.glow,
        scale: Math.random() * 1.5 + 2,
      }
    })

    // Draw a pixel sprite
    const drawSprite = (ctx: CanvasRenderingContext2D, sprite: Sprite) => {
      const pattern = spritePatterns[sprite.type]
      const pixelSize = sprite.scale

      ctx.save()
      ctx.shadowColor = sprite.glowColor
      ctx.shadowBlur = 8
      ctx.fillStyle = sprite.color

      pattern.forEach((row, rowIndex) => {
        row.forEach((pixel, colIndex) => {
          if (pixel === 1) {
            const px = sprite.x + (colIndex - 3.5) * pixelSize
            const py = sprite.y + (rowIndex - 3) * pixelSize
            ctx.fillRect(px, py, pixelSize, pixelSize)
          }
        })
      })

      ctx.restore()
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Calculate exclusion zone for avatar (responsive)
      // Avatar is 128px (w-32), inside pt-20 (80px) header padding
      // Center of avatar = pt-20 + half avatar = 80 + 64 = 144px
      const isMobile = canvas.width < 640
      const zone = exclusionZone || {
        x: isMobile ? canvas.width / 2 : (canvas.width - Math.min(canvas.width, 896)) / 2 + 16 + 64,
        y: 144,
        radius: 68, // Matches gold ring border (64px avatar + ring-2 + 2px buffer)
      }

      spritesRef.current.forEach((sprite) => {
        // Update position
        sprite.x += sprite.speedX
        sprite.y += sprite.speedY

        const spriteWidth = 7 * sprite.scale
        const spriteHeight = 6 * sprite.scale

        // Bounce off edges
        if (sprite.x <= spriteWidth / 2 || sprite.x >= canvas.width - spriteWidth / 2) {
          sprite.speedX *= -1
          sprite.x = Math.max(spriteWidth / 2, Math.min(canvas.width - spriteWidth / 2, sprite.x))
        }
        if (sprite.y <= spriteHeight / 2 || sprite.y >= canvas.height - spriteHeight / 2) {
          sprite.speedY *= -1
          sprite.y = Math.max(spriteHeight / 2, Math.min(canvas.height - spriteHeight / 2, sprite.y))
        }

        // Bounce off avatar exclusion zone (circular)
        const dx = sprite.x - zone.x
        const dy = sprite.y - zone.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const minDist = zone.radius + Math.max(spriteWidth, spriteHeight) / 2

        if (distance < minDist) {
          // Push sprite out and reverse velocity
          const angle = Math.atan2(dy, dx)
          sprite.x = zone.x + Math.cos(angle) * minDist
          sprite.y = zone.y + Math.sin(angle) * minDist

          // Reflect velocity off the circle
          const normalX = dx / distance
          const normalY = dy / distance
          const dot = sprite.speedX * normalX + sprite.speedY * normalY
          sprite.speedX = sprite.speedX - 2 * dot * normalX
          sprite.speedY = sprite.speedY - 2 * dot * normalY
        }

        // Draw sprite
        drawSprite(ctx, sprite)
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ opacity: 1 }}
    />
  )
}
