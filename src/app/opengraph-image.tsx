import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'GameRate - Video Game Tracking App'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  // Fetch the crystal logo and convert to base64
  const logoResponse = await fetch(
    new URL('/GameRate.png', 'https://gamerate.vercel.app')
  )
  const logoBuffer = await logoResponse.arrayBuffer()
  const logoBase64 = `data:image/png;base64,${Buffer.from(logoBuffer).toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0f0a19 0%, #1a1025 50%, #241832 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Logo and Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '30px' }}>
          {/* Crystal Logo */}
          <img
            src={logoBase64}
            width={140}
            height={140}
            style={{ objectFit: 'contain' }}
          />
          <div
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              background: 'linear-gradient(90deg, #8b5cf6, #f59e0b)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            GameRate
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: '32px',
            color: '#a1a1aa',
            marginBottom: '50px',
          }}
        >
          Track, Rate & Discover Games
        </div>

        {/* Features */}
        <div style={{ display: 'flex', gap: '40px' }}>
          {['Rate Games', 'Build Top 5', 'Create Lists', 'Follow Friends'].map((feature) => (
            <div
              key={feature}
              style={{
                padding: '12px 24px',
                background: 'rgba(139, 92, 246, 0.2)',
                borderRadius: '20px',
                color: '#c4b5fd',
                fontSize: '20px',
                border: '1px solid rgba(139, 92, 246, 0.3)',
              }}
            >
              {feature}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  )
}
