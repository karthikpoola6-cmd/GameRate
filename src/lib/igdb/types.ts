export interface IGDBGame {
  id: number
  name: string
  slug: string
  summary?: string
  storyline?: string
  rating?: number
  rating_count?: number
  aggregated_rating?: number
  aggregated_rating_count?: number
  first_release_date?: number
  cover?: IGDBCover
  screenshots?: IGDBScreenshot[]
  genres?: IGDBGenre[]
  platforms?: IGDBPlatform[]
  involved_companies?: IGDBInvolvedCompany[]
  similar_games?: number[]
  websites?: IGDBWebsite[]
}

export interface IGDBCover {
  id: number
  image_id: string
  url?: string
  width?: number
  height?: number
}

export interface IGDBScreenshot {
  id: number
  image_id: string
  url?: string
  width?: number
  height?: number
}

export interface IGDBGenre {
  id: number
  name: string
  slug: string
}

export interface IGDBPlatform {
  id: number
  name: string
  slug: string
  abbreviation?: string
}

export interface IGDBInvolvedCompany {
  id: number
  company: IGDBCompany
  developer: boolean
  publisher: boolean
}

export interface IGDBCompany {
  id: number
  name: string
  slug: string
}

export interface IGDBWebsite {
  id: number
  url: string
  category: number
}

export interface IGDBSearchResult {
  id: number
  name: string
  slug: string
  cover?: IGDBCover
  first_release_date?: number
  rating?: number
}
