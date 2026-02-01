# SavePoint Architecture

Organized breakdown of all features by layer.

---

## Backend (Supabase)

### Database Tables
| Table | Purpose |
|-------|---------|
| `profiles` | User profiles - username, display_name, avatar_url, bio |
| `game_logs` | User's games - status, rating (numeric 2,1), review, favorite, favorite_position |
| `lists` | User-created lists - name, description, is_public, is_ranked |
| `list_items` | Games in lists - game_id, game_name, game_cover, position |
| `follows` | Follower relationships - follower_id, following_id |

### Database Features
- Row Level Security (RLS) policies on all tables
- Auto-update timestamps trigger
- Auto-create profile on signup trigger
- Username format validation constraint: `^[a-zA-Z0-9_]{3,20}$`
- Cascade delete for user data

### Storage
- **Avatars bucket** - Profile picture storage (public)
  - Policy: Public Read (SELECT)
  - Policy: Auth Upload (INSERT for authenticated)

### Auth
- Supabase Auth handles all authentication
- Email/password authentication
- Email confirmation (optional, currently off)
- Session tokens stored in browser cookies

### Database Migrations
1. `schema.sql` - Initial schema with all tables
2. `002_simplify_game_logs.sql` - Simplified game status enum
3. `003_add_list_ranked.sql` - Added is_ranked to lists

### SQL Functions
```sql
-- Extract username from email (handles special chars)
CREATE OR REPLACE FUNCTION extract_username_from_email(email text)
RETURNS text AS $$
BEGIN
  RETURN REGEXP_REPLACE(SPLIT_PART(email, '@', 1), '[^a-zA-Z0-9_]', '_', 'g');
END;
$$ LANGUAGE plpgsql;
```

---

## API Routes (Next.js)

### Authentication
| Route | Method | Purpose |
|-------|--------|---------|
| `/auth/callback` | GET | Email verification handler |

### Search
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/search` | GET | Search games via IGDB |

### Lists
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/lists` | GET | Get user's lists |
| `/api/lists` | POST | Create new list |
| `/api/lists/[id]` | GET | Get single list |
| `/api/lists/[id]` | PATCH | Update list |
| `/api/lists/[id]` | DELETE | Delete list |
| `/api/lists/[id]/items` | POST | Add game to list |
| `/api/lists/[id]/items` | DELETE | Remove game from list |

### Account
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/account/delete` | DELETE | Delete user account (uses service role key) |

### External APIs
- **IGDB API** (via Twitch credentials)
  - `searchGames()` - Search by query
  - `getGameById()` - Get by IGDB ID
  - `getGameBySlug()` - Get by URL slug
  - `getPopularGames()` - Trending games
  - `getRecentGames()` - Recent releases
  - `getCoverUrl()` - Build cover image URL

---

## Frontend

### Pages (App Router)

#### Public Pages
| Route | File | Purpose |
|-------|------|---------|
| `/` | `page.tsx` | Landing page with popular games, activity feed |
| `/game/[slug]` | `game/[slug]/page.tsx` | Game detail page |
| `/games` | `games/page.tsx` | Browse games (Popular, Recent) |
| `/search` | `search/page.tsx` | Full search results |
| `/lists` | `lists/page.tsx` | Browse public lists |
| `/list/[id]` | `list/[id]/page.tsx` | Single list view |
| `/members` | `members/page.tsx` | Browse all users |

#### Auth Pages
| Route | File | Purpose |
|-------|------|---------|
| `/login` | `login/page.tsx` | Login form |
| `/signup` | `signup/page.tsx` | Signup form |
| `/setup-username` | `setup-username/page.tsx` | Choose username after signup |

#### User Pages
| Route | File | Purpose |
|-------|------|---------|
| `/user/[username]` | `user/[username]/page.tsx` | Public profile |
| `/user/[username]/games` | `user/[username]/games/page.tsx` | All rated games with filter/sort |
| `/user/[username]/lists` | `user/[username]/lists/page.tsx` | User's lists |
| `/user/[username]/want-to-play` | `user/[username]/want-to-play/page.tsx` | Want to play backlog |
| `/user/[username]/followers` | `user/[username]/followers/page.tsx` | Followers list |
| `/user/[username]/following` | `user/[username]/following/page.tsx` | Following list |

#### Settings
| Route | File | Purpose |
|-------|------|---------|
| `/settings/profile` | `settings/profile/page.tsx` | Edit profile, avatar, delete account |

### Components

#### Navigation
| Component | Purpose |
|-----------|---------|
| `Navigation.tsx` | Top nav bar (scrolls on mobile, fixed on desktop) |
| `BottomNav.tsx` | Mobile bottom nav (Home, Search, Lists, Players, Profile) |
| `UserMenu.tsx` | Dropdown menu for logged-in users |
| `SearchBar.tsx` | Search with debounce, dropdown results, keyboard nav |

#### Game Components
| Component | Purpose |
|-----------|---------|
| `GameLogButtons.tsx` | Rating stars, Want to Play, Favorite, Review |
| `AddToListButton.tsx` | Add game to user's lists |

#### Profile Components
| Component | Purpose |
|-----------|---------|
| `FavoriteGames.tsx` | Top 5 favorites with drag-and-drop (owner only) |
| `FollowButton.tsx` | Follow/unfollow users |
| `ActivityFeed.tsx` | Shows followed users' ratings |

#### List Components
| Component | Purpose |
|-----------|---------|
| `ListViewClient.tsx` | List view with arrow reordering, ranked mode |
| `CreateListForm.tsx` | Create new list form |

#### User Games
| Component | Purpose |
|-----------|---------|
| `GamesGridClient.tsx` | Filter/sort for user's rated games |

### UI Features

#### Rating System
- Half-star ratings (0.5 - 5.0 in 0.5 increments)
- Click cycling: full star → half star → clear (deletes game log)
- Stored as `numeric(2,1)` in database

#### Top 5 Favorites
- Gold ring styling
- Position badges (1-5)
- Drag-and-drop reordering (owner only)
- Plus buttons in empty slots
- 5-game limit enforced client-side

#### Lists
- Public/private toggle
- Ranked mode (shows position numbers)
- Arrow buttons for reordering (mobile-friendly)
- Star ratings display

#### Mobile Optimizations
- Fixed 430px viewport width
- Bottom navigation bar
- Top nav scrolls away on mobile
- Arrow buttons instead of drag-and-drop for lists
- Removed hover rating (mobile Safari fix)

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# IGDB (via Twitch)
TWITCH_CLIENT_ID=xxx
TWITCH_CLIENT_SECRET=xxx
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI | React 19 |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Game Data | IGDB API |
| Hosting | Vercel |

---

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── account/delete/route.ts
│   │   ├── lists/[id]/items/route.ts
│   │   ├── lists/[id]/route.ts
│   │   ├── lists/route.ts
│   │   └── search/route.ts
│   ├── auth/callback/route.ts
│   ├── game/[slug]/
│   ├── games/
│   ├── list/[id]/
│   ├── lists/
│   ├── login/
│   ├── members/
│   ├── search/
│   ├── settings/profile/
│   ├── setup-username/
│   ├── signup/
│   ├── user/[username]/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ActivityFeed.tsx
│   ├── AddToListButton.tsx
│   ├── BottomNav.tsx
│   ├── CreateListForm.tsx
│   ├── FavoriteGames.tsx
│   ├── FollowButton.tsx
│   ├── GameLogButtons.tsx
│   ├── GamesGridClient.tsx
│   ├── ListViewClient.tsx
│   ├── Navigation.tsx
│   ├── SearchBar.tsx
│   └── UserMenu.tsx
├── lib/
│   ├── igdb/
│   │   └── client.ts
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── middleware.ts
│   │   └── server.ts
│   └── types.ts
supabase/
├── schema.sql
└── migrations/
    ├── 002_simplify_game_logs.sql
    └── 003_add_list_ranked.sql
```
