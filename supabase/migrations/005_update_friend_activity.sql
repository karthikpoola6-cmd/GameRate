-- Update get_friend_activity to order by rated_at and include rated_at in response
-- Only returns games that have been rated (rated_at IS NOT NULL)

CREATE OR REPLACE FUNCTION get_friend_activity(follower_user_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  game_id integer,
  game_slug text,
  game_name text,
  game_cover_id text,
  status text,
  rating numeric,
  review text,
  favorite boolean,
  updated_at timestamptz,
  rated_at timestamptz,
  username text,
  display_name text,
  avatar_url text
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (gl.user_id)
    gl.id,
    gl.user_id,
    gl.game_id,
    gl.game_slug,
    gl.game_name,
    gl.game_cover_id,
    gl.status::text,
    gl.rating,
    gl.review,
    gl.favorite,
    gl.updated_at,
    gl.rated_at,
    p.username,
    p.display_name,
    p.avatar_url
  FROM game_logs gl
  JOIN profiles p ON p.id = gl.user_id
  JOIN follows f ON f.following_id = gl.user_id
  WHERE f.follower_id = follower_user_id
    AND gl.rated_at IS NOT NULL  -- Only games with ratings
  ORDER BY gl.user_id, gl.rated_at DESC;
END;
$$ LANGUAGE plpgsql;
