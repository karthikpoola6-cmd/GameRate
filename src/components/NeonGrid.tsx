'use client'

import { useEffect, useRef } from 'react'

interface Hexagon {
  x: number
  y: number
  size: number
  rotation: number
  rotationSpeed: number
  baseOpacity: number
  color: [number, number, number]
  driftX: number
  driftY: number
  phaseOffset: number
}

interface Beam {
  x: number
  y: number
  angle: number
  color: [number, number, number]
  width: number
  phaseOffset: number
  baseOpacity: number
}

export function NeonGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0, h = 0

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w
      canvas.height = h
    }
    resize()
    window.addEventListener('resize', resize)

    // Colors (GameRate palette)
    const PURPLE: [number, number, number] = [139, 92, 246]
    const PURPLE_LIGHT: [number, number, number] = [167, 139, 250]
    const PURPLE_DARK: [number, number, number] = [124, 58, 237]
    const GOLD: [number, number, number] = [245, 158, 11]
    const GOLD_LIGHT: [number, number, number] = [251, 191, 36]

    // Create hexagons
    const mobile = w < 640
    const hexCount = mobile ? 10 : 18
    const hexColors = [PURPLE, PURPLE, PURPLE_LIGHT, PURPLE_DARK, GOLD]

    const hexagons: Hexagon[] = Array.from({ length: hexCount }, () => {
      const color = hexColors[Math.floor(Math.random() * hexColors.length)]
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 100 + (mobile ? 20 : 30),
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.001,
        baseOpacity: Math.random() * 0.25 + 0.05,
        color,
        driftX: (Math.random() - 0.5) * 0.12,
        driftY: (Math.random() - 0.5) * 0.12,
        phaseOffset: Math.random() * Math.PI * 2,
      }
    })

    // Create crossing beams
    const beams: Beam[] = [
      { x: -0.1, y: 0.35, angle: Math.atan2(0.4, 1.2), color: GOLD, width: 1.5, phaseOffset: 0, baseOpacity: 0.12 },
      { x: 1.1, y: 0.25, angle: Math.atan2(0.5, -1.2), color: PURPLE, width: 1.5, phaseOffset: 1.5, baseOpacity: 0.15 },
      { x: 0.15, y: -0.05, angle: Math.atan2(1.1, 0.7), color: PURPLE_LIGHT, width: 1, phaseOffset: 3, baseOpacity: 0.08 },
      { x: 0.85, y: -0.05, angle: Math.atan2(1.1, -0.6), color: GOLD_LIGHT, width: 1, phaseOffset: 4.5, baseOpacity: 0.08 },
      { x: 0.4, y: 1.1, angle: Math.atan2(-1.2, 0.3), color: PURPLE_DARK, width: 0.8, phaseOffset: 2, baseOpacity: 0.06 },
    ]

    const rgba = (c: [number, number, number], a: number) =>
      `rgba(${c[0]},${c[1]},${c[2]},${Math.max(0, Math.min(1, a))})`
    const rgb = (c: [number, number, number]) =>
      `rgb(${c[0]},${c[1]},${c[2]})`

    // Flat-top hexagon path
    const hexPath = (size: number) => {
      ctx.beginPath()
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6
        const px = size * Math.cos(a)
        const py = size * Math.sin(a)
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.closePath()
    }

    const drawHex = (hex: Hexagon, t: number) => {
      const pulse = Math.sin(t * 0.0008 + hex.phaseOffset) * 0.5 + 0.5
      const op = hex.baseOpacity + pulse * 0.12

      ctx.save()
      ctx.translate(hex.x, hex.y)
      ctx.rotate(hex.rotation)
      ctx.globalCompositeOperation = 'lighter'

      // Outer glow stroke
      ctx.shadowColor = rgb(hex.color)
      ctx.shadowBlur = 25
      ctx.strokeStyle = rgba(hex.color, op)
      ctx.lineWidth = 1.5
      hexPath(hex.size)
      ctx.stroke()

      // Inner glow pass (additive)
      ctx.shadowBlur = 12
      ctx.strokeStyle = rgba(hex.color, op * 0.5)
      ctx.lineWidth = 1
      hexPath(hex.size)
      ctx.stroke()

      // Bright vertex dots
      ctx.shadowBlur = 15
      ctx.fillStyle = rgba(hex.color, Math.min(1, op * 2))
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6
        ctx.beginPath()
        ctx.arc(hex.size * Math.cos(a), hex.size * Math.sin(a), 1.5, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.restore()
    }

    const drawBeam = (beam: Beam, t: number) => {
      const pulse = Math.sin(t * 0.0005 + beam.phaseOffset) * 0.5 + 0.5
      const op = beam.baseOpacity * (0.4 + pulse * 0.6)
      const len = Math.hypot(w, h) * 1.5

      const x1 = beam.x * w
      const y1 = beam.y * h
      const x2 = x1 + Math.cos(beam.angle) * len
      const y2 = y1 + Math.sin(beam.angle) * len

      ctx.save()
      ctx.globalCompositeOperation = 'lighter'

      // Glow
      ctx.shadowColor = rgb(beam.color)
      ctx.shadowBlur = 25 * pulse
      ctx.strokeStyle = rgba(beam.color, op)
      ctx.lineWidth = beam.width
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()

      // Core bright line
      ctx.shadowBlur = 5
      ctx.strokeStyle = rgba(beam.color, Math.min(1, op * 1.8))
      ctx.lineWidth = beam.width * 0.3
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()

      ctx.restore()
    }

    let t = 0
    const animate = () => {
      t += 16
      ctx.clearRect(0, 0, w, h)

      // Beams behind hexagons
      beams.forEach(b => drawBeam(b, t))

      // Hexagons with drift
      hexagons.forEach(hex => {
        hex.x += hex.driftX
        hex.y += hex.driftY
        hex.rotation += hex.rotationSpeed

        // Wrap around viewport edges
        if (hex.x < -hex.size * 2) hex.x = w + hex.size
        if (hex.x > w + hex.size * 2) hex.x = -hex.size
        if (hex.y < -hex.size * 2) hex.y = h + hex.size
        if (hex.y > h + hex.size * 2) hex.y = -hex.size

        drawHex(hex, t)
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resize)
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
