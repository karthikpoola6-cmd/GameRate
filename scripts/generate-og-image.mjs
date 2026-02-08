import { createCanvas, loadImage, registerFont } from 'canvas'
import { writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Register Orbitron font
registerFont('/tmp/Orbitron.ttf', { family: 'Orbitron', weight: '500' })

const W = 1200
const H = 630

const canvas = createCanvas(W, H)
const ctx = canvas.getContext('2d')

// --- Colors (matching NeonGrid) ---
const PURPLE = [139, 92, 246]
const PURPLE_LIGHT = [167, 139, 250]
const PURPLE_DARK = [124, 58, 237]
const GOLD = [245, 158, 11]
const GOLD_LIGHT = [251, 191, 36]

const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`

// --- Background ---
ctx.fillStyle = '#030108'
ctx.fillRect(0, 0, W, H)

// --- Draw hexagon outline ---
function drawHexagon(x, y, size, rotation, color, opacity) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)

  // Outer glow
  ctx.shadowColor = rgba(color, 0.8)
  ctx.shadowBlur = 20
  ctx.strokeStyle = rgba(color, opacity)
  ctx.lineWidth = 1.5
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 6
    const px = size * Math.cos(a)
    const py = size * Math.sin(a)
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.stroke()

  // Inner glow
  ctx.shadowBlur = 10
  ctx.strokeStyle = rgba(color, opacity * 0.4)
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 6
    const px = size * Math.cos(a)
    const py = size * Math.sin(a)
    if (i === 0) ctx.moveTo(px, py)
    else ctx.lineTo(px, py)
  }
  ctx.closePath()
  ctx.stroke()

  // Vertex dots
  ctx.shadowBlur = 12
  ctx.fillStyle = rgba(color, Math.min(1, opacity * 2))
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 6
    ctx.beginPath()
    ctx.arc(size * Math.cos(a), size * Math.sin(a), 1.5, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

// --- Draw beam ---
function drawBeam(x1, y1, x2, y2, color, opacity, width) {
  ctx.save()
  ctx.shadowColor = rgba(color, 0.6)
  ctx.shadowBlur = 20

  // Glow line
  ctx.strokeStyle = rgba(color, opacity)
  ctx.lineWidth = width
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()

  // Core bright line
  ctx.shadowBlur = 5
  ctx.strokeStyle = rgba(color, Math.min(1, opacity * 1.8))
  ctx.lineWidth = width * 0.3
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()

  ctx.restore()
}

// --- Beams (matching NeonGrid crossing pattern) ---
const beams = [
  { x: -0.1, y: 0.35, angle: Math.atan2(0.4, 1.2), color: GOLD, width: 1.8, opacity: 0.12 },
  { x: 1.1, y: 0.25, angle: Math.atan2(0.5, -1.2), color: PURPLE, width: 1.8, opacity: 0.15 },
  { x: 0.15, y: -0.05, angle: Math.atan2(1.1, 0.7), color: PURPLE_LIGHT, width: 1.2, opacity: 0.08 },
  { x: 0.85, y: -0.05, angle: Math.atan2(1.1, -0.6), color: GOLD_LIGHT, width: 1.2, opacity: 0.08 },
  { x: 0.4, y: 1.1, angle: Math.atan2(-1.2, 0.3), color: PURPLE_DARK, width: 1, opacity: 0.06 },
]

const len = Math.hypot(W, H) * 1.5
for (const b of beams) {
  const x1 = b.x * W
  const y1 = b.y * H
  const x2 = x1 + Math.cos(b.angle) * len
  const y2 = y1 + Math.sin(b.angle) * len
  drawBeam(x1, y1, x2, y2, b.color, b.opacity, b.width)
}

// --- Hexagons scattered around (avoid center where crystal goes) ---
const hexagons = [
  { x: 80, y: 90, size: 70, rot: 0.3, color: PURPLE, op: 0.2 },
  { x: 250, y: 480, size: 55, rot: 1.1, color: PURPLE_LIGHT, op: 0.15 },
  { x: 1050, y: 100, size: 85, rot: 0.7, color: GOLD, op: 0.18 },
  { x: 1100, y: 500, size: 50, rot: 2.1, color: PURPLE_DARK, op: 0.2 },
  { x: 150, y: 300, size: 40, rot: 0.5, color: PURPLE, op: 0.12 },
  { x: 950, y: 350, size: 60, rot: 1.8, color: PURPLE_LIGHT, op: 0.14 },
  { x: 400, y: 550, size: 45, rot: 2.5, color: GOLD, op: 0.1 },
  { x: 800, y: 50, size: 65, rot: 0.9, color: PURPLE, op: 0.16 },
  { x: 50, y: 550, size: 35, rot: 1.4, color: PURPLE_DARK, op: 0.13 },
  { x: 1150, y: 300, size: 45, rot: 0.2, color: GOLD, op: 0.11 },
  { x: 350, y: 80, size: 50, rot: 1.7, color: PURPLE_LIGHT, op: 0.14 },
  { x: 850, y: 530, size: 55, rot: 2.8, color: PURPLE, op: 0.15 },
]

for (const h of hexagons) {
  drawHexagon(h.x, h.y, h.size, h.rot, h.color, h.op)
}

// --- Crystal logo ---
const crystalPath = resolve(__dirname, '../public/GameRate.png')
const crystal = await loadImage(crystalPath)
const crystalSize = 200
const crystalX = (W - crystalSize) / 2
const crystalY = 100
ctx.drawImage(crystal, crystalX, crystalY, crystalSize, crystalSize)

// --- "GameRate" text with purple-to-gold gradient ---
ctx.font = '500 52px Orbitron'
ctx.textAlign = 'center'
ctx.textBaseline = 'top'

const textY = crystalY + crystalSize + 30
const textGrad = ctx.createLinearGradient(W / 2 - 150, textY, W / 2 + 150, textY)
textGrad.addColorStop(0, rgba(PURPLE, 1))
textGrad.addColorStop(1, rgba(GOLD, 1))

// Text glow
ctx.shadowColor = rgba(PURPLE, 0.6)
ctx.shadowBlur = 20
ctx.fillStyle = textGrad
ctx.fillText('GameRate', W / 2, textY)

// Second pass for brighter core
ctx.shadowBlur = 5
ctx.fillText('GameRate', W / 2, textY)

// --- Subtitle ---
ctx.font = '400 18px Orbitron'
ctx.shadowColor = rgba(PURPLE, 0.3)
ctx.shadowBlur = 10
ctx.fillStyle = rgba([200, 200, 210], 0.6)
ctx.fillText('Track, Rate & Discover Games', W / 2, textY + 65)

// --- Save ---
const outPath = resolve(__dirname, '../public/og-image.png')
writeFileSync(outPath, canvas.toBuffer('image/png'))
console.log(`OG image saved to ${outPath}`)
