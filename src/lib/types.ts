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

export type GameStatus = 'want_to_play' | 'played'

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
  created_at: string
  updated_at: string
}

export interface List {
  id: string
  user_id: string
  name: string
  description: string | null
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface ListItem {
  id: string
  list_id: string
  game_id: number
  game_slug: string
  game_name: string
  game_cover_id: string | null
  position: number
  notes: string | null
  added_at: string
}

export interface Follow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}

// Extended types with relations
export interface ProfileWithStats extends Profile {
  games_count: number
  lists_count: number
  followers_count: number
  following_count: number
}
