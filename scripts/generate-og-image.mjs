import sharp from 'sharp'
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')

async function generateOGImage() {
  const width = 1200
  const height = 630
  const logoSize = 180

  // Create dark gradient background with all text elements
  const background = Buffer.from(`
    <svg width="${width}" height="${height}">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0f0a19"/>
          <stop offset="50%" style="stop-color:#1a1025"/>
          <stop offset="100%" style="stop-color:#241832"/>
        </linearGradient>
        <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#8b5cf6"/>
          <stop offset="100%" style="stop-color:#f59e0b"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#bg)"/>

      <!-- GameRate text -->
      <text x="700" y="270" font-family="system-ui, -apple-system, sans-serif" font-size="72" font-weight="bold" fill="url(#textGrad)" text-anchor="middle">GameRate</text>

      <!-- Tagline -->
      <text x="${width/2}" y="350" font-family="system-ui, sans-serif" font-size="32" fill="#a1a1aa" text-anchor="middle">Track, Rate &amp; Discover Games</text>

      <!-- Feature pills -->
      <g transform="translate(148, 420)">
        <rect x="0" y="0" width="150" height="48" rx="24" fill="rgba(139, 92, 246, 0.25)" stroke="rgba(139, 92, 246, 0.4)" stroke-width="1"/>
        <text x="75" y="31" font-family="system-ui, sans-serif" font-size="20" fill="#c4b5fd" text-anchor="middle">Rate Games</text>
      </g>
      <g transform="translate(328, 420)">
        <rect x="0" y="0" width="150" height="48" rx="24" fill="rgba(139, 92, 246, 0.25)" stroke="rgba(139, 92, 246, 0.4)" stroke-width="1"/>
        <text x="75" y="31" font-family="system-ui, sans-serif" font-size="20" fill="#c4b5fd" text-anchor="middle">Build Top 5</text>
      </g>
      <g transform="translate(508, 420)">
        <rect x="0" y="0" width="150" height="48" rx="24" fill="rgba(139, 92, 246, 0.25)" stroke="rgba(139, 92, 246, 0.4)" stroke-width="1"/>
        <text x="75" y="31" font-family="system-ui, sans-serif" font-size="20" fill="#c4b5fd" text-anchor="middle">Create Lists</text>
      </g>
      <g transform="translate(688, 420)">
        <rect x="0" y="0" width="175" height="48" rx="24" fill="rgba(139, 92, 246, 0.25)" stroke="rgba(139, 92, 246, 0.4)" stroke-width="1"/>
        <text x="87" y="31" font-family="system-ui, sans-serif" font-size="20" fill="#c4b5fd" text-anchor="middle">Follow Friends</text>
      </g>
    </svg>
  `)

  // Create the background image
  const backgroundImage = await sharp(background).png().toBuffer()

  // Load the crystal logo
  const logoPath = join(publicDir, 'GameRate.png')

  // Load and get raw pixel data to remove black background
  const logoImage = sharp(logoPath)
  const { data, info } = await logoImage
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true })

  // Make near-black pixels transparent (threshold of 20 for each RGB channel)
  const threshold = 25
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    if (r < threshold && g < threshold && b < threshold) {
      data[i + 3] = 0 // Set alpha to 0 (transparent)
    }
  }

  // Create new image from modified data
  const logoWithTransparency = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 }
  })
    .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer()

  const logo = logoWithTransparency

  // Composite the logo onto the background
  // Position logo to the left of "GameRate" text
  const finalImage = await sharp(backgroundImage)
    .composite([
      {
        input: logo,
        left: 310,
        top: 150,
      }
    ])
    .png()
    .toBuffer()

  // Save the final image
  const outputPath = join(publicDir, 'og-image.png')
  writeFileSync(outputPath, finalImage)
  console.log(`OG image generated: ${outputPath}`)
}

generateOGImage().catch(console.error)
