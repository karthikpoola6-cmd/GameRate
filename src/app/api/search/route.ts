import { NextRequest, NextResponse } from 'next/server'

const TWITCH_AUTH_URL = 'https://id.twitch.tv/oauth2/token'
const IGDB_API_URL = 'https://api.igdb.com/v4'

let cachedToken: { token: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 300000) {
    return cachedToken.token
  }

  const clientId = process.env.TWITCH_CLIENT_ID
  const clientSecret = process.env.TWITCH_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Missing TWITCH_CLIENT_ID or TWITCH_CLIENT_SECRET')
  }

  const response = await fetch(TWITCH_AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to get Twitch access token: ${response.statusText}`)
  }

  const data = await response.json()
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  }

  return cachedToken.token
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const query = searchParams.get('q')

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ results: [] })
  }

  try {
    const accessToken = await getAccessToken()
    const clientId = process.env.TWITCH_CLIENT_ID!

    const response = await fetch(`${IGDB_API_URL}/games`, {
      method: 'POST',
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'text/plain',
      },
      body: `
        search "${query.trim()}";
        fields name, slug, cover.image_id, first_release_date, rating;
        limit 8;
      `,
    })

    if (!response.ok) {
      throw new Error(`IGDB API error: ${response.statusText}`)
    }

    const results = await response.json()
    return NextResponse.json({ results })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
