import type { IGDBGame, IGDBSearchResult } from './types'

const TWITCH_AUTH_URL = 'https://id.twitch.tv/oauth2/token'
const IGDB_API_URL = 'https://api.igdb.com/v4'

interface TwitchToken {
  access_token: string
  expires_in: number
  token_type: string
}

let cachedToken: { token: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 5 minute buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 300000) {
    return cachedToken.token
  }

  const clientId = process.env.TWITCH_CLIENT_ID
  const clientSecret = process.env.TWITCH_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Missing TWITCH_CLIENT_ID or TWITCH_CLIENT_SECRET environment variables')
  }

  const response = await fetch(TWITCH_AUTH_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to get Twitch access token: ${response.statusText}`)
  }

  const data: TwitchToken = await response.json()

  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  }

  return cachedToken.token
}

async function igdbFetch<T>(endpoint: string, body: string): Promise<T> {
  const accessToken = await getAccessToken()
  const clientId = process.env.TWITCH_CLIENT_ID!

  const response = await fetch(`${IGDB_API_URL}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Client-ID': clientId,
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'text/plain',
    },
    body,
  })

  if (!response.ok) {
    throw new Error(`IGDB API error: ${response.statusText}`)
  }

  return response.json()
}

export async function searchGames(query: string, limit = 10): Promise<IGDBSearchResult[]> {
  const body = `
    search "${query}";
    fields name, slug, cover.image_id, first_release_date, rating;
    limit ${limit};
  `
  return igdbFetch<IGDBSearchResult[]>('games', body)
}

export async function getGameBySlug(slug: string): Promise<IGDBGame | null> {
  const body = `
    fields name, slug, summary, storyline, rating, rating_count,
           aggregated_rating, aggregated_rating_count, first_release_date,
           cover.image_id, screenshots.image_id,
           genres.name, genres.slug,
           platforms.name, platforms.slug, platforms.abbreviation,
           involved_companies.company.name, involved_companies.developer, involved_companies.publisher,
           similar_games, websites.url, websites.category;
    where slug = "${slug}";
  `
  const results = await igdbFetch<IGDBGame[]>('games', body)
  return results[0] || null
}

export async function getPopularGames(limit = 20): Promise<IGDBGame[]> {
  // Fetch more games than needed to account for duplicates we'll filter out
  const body = `
    fields name, slug, cover.image_id, first_release_date, rating, rating_count,
           aggregated_rating, genres.name;
    where rating_count > 100 & cover != null;
    sort rating desc;
    limit ${limit + 20};
  `
  const games = await igdbFetch<IGDBGame[]>('games', body)

  // Deduplicate by base game name (remove versions like "Game of the Year", "Complete Edition", etc.)
  const seen = new Set<string>()
  const uniqueGames: IGDBGame[] = []

  for (const game of games) {
    // Get base name by removing common suffixes and version info
    const baseName = game.name
      .replace(/:\s*(Game of the Year|GOTY|Complete|Definitive|Ultimate|Enhanced|Special|Remastered|Anniversary|Legendary).*$/i, '')
      .replace(/\s*-\s*(Game of the Year|GOTY|Complete|Definitive|Ultimate|Enhanced|Special|Remastered|Anniversary|Legendary).*$/i, '')
      .replace(/\s+(Edition|Version)$/i, '')
      .trim()
      .toLowerCase()

    if (!seen.has(baseName)) {
      seen.add(baseName)
      uniqueGames.push(game)
      if (uniqueGames.length >= limit) break
    }
  }

  return uniqueGames
}

// In-memory cache for the popular games pool (refreshes every hour)
let cachedPool: { games: IGDBGame[]; expiresAt: number } | null = null

export async function getPopularGamesPool(): Promise<IGDBGame[]> {
  if (cachedPool && Date.now() < cachedPool.expiresAt) {
    return cachedPool.games
  }

  const games = await getPopularGames(100)
  cachedPool = {
    games,
    expiresAt: Date.now() + 3600000, // 1 hour
  }
  return cachedPool.games
}

export async function getRecentGames(limit = 20): Promise<IGDBGame[]> {
  const now = Math.floor(Date.now() / 1000)
  const body = `
    fields name, slug, cover.image_id, first_release_date, rating,
           aggregated_rating, genres.name;
    where first_release_date < ${now} & first_release_date > ${now - 31536000} & cover != null;
    sort first_release_date desc;
    limit ${limit};
  `
  return igdbFetch<IGDBGame[]>('games', body)
}
