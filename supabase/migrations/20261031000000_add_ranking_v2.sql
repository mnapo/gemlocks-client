CREATE OR REPLACE FUNCTION public.get_user_ranking_v2(
  p_page integer DEFAULT 1,
  p_page_size integer DEFAULT 10
)
RETURNS TABLE (
  rank_position bigint,
  id uuid,
  name text,
  active_avatar text,
  level integer,
  coins integer,
  victories integer,
  defeats integer,
  draws integer,
  score integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO ''
AS $function$
  WITH ranked_players AS (
    SELECT
      u.id,
      u.name,
      u.active_avatar,
      COALESCE(u.level, 1)::integer AS level,
      COALESCE(u.coins, 0)::integer AS coins,
      COALESCE(u.victories, 0)::integer AS victories,
      COALESCE(u.defeats, 0)::integer AS defeats,
      COALESCE(u.draws, 0)::integer AS draws,
      (COALESCE(u.victories, 0) * 3 + COALESCE(u.draws, 0))::integer AS score
    FROM public.app_users AS u
  ),
  numbered_players AS (
    SELECT
      ROW_NUMBER() OVER (
        ORDER BY score DESC, victories DESC, draws DESC, id ASC
      ) AS rank_position,
      *
    FROM ranked_players
  )
  SELECT
    rank_position, id, name, active_avatar, level, coins,
    victories, defeats, draws, score
  FROM numbered_players
  ORDER BY rank_position
  LIMIT GREATEST(1, LEAST(COALESCE(p_page_size, 10), 100))
  OFFSET (GREATEST(COALESCE(p_page, 1), 1) - 1)
    * GREATEST(1, LEAST(COALESCE(p_page_size, 10), 100));
$function$;

REVOKE ALL ON FUNCTION public.get_user_ranking_v2(integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_ranking_v2(integer, integer) TO service_role;
