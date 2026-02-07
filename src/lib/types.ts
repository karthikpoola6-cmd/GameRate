// Database types

export interface Profile {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

type GameStatus = 'want_to_play' | 'played'

export interface GameLog {
  id: string
  user_id: string
  game_id: number
  game_slug: string
  game_name: string
  game_cover_id: string | null
  status: GameStatus
  rating: number | null  // 0.5 to 5 in 0.5 increments
  review: string | null
  favorite: boolean
  favorite_position: number | null  // 1-5 for Top 5 ordering
  custom_backdrop_id: string | null
  created_at: string
  updated_at: string
  rated_at: string | null
}

export interface List {
  id: string
  user_id: string
  name: string
  description: string | null
  is_public: boolean
  is_ranked: boolean
  created_at: string
  updated_at: string
}

