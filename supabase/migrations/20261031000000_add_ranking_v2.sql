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
SET search_path TO ''
AS $function$
  WITH ranked AS (
    SELECT
      ROW_NUMBER() OVER (
        ORDER BY
          (u.victories * 3 + u.draws) DESC,
          u.victories DESC,
          u.draws DESC,
          u.defeats ASC,
          u.name ASC,
          u.id ASC
      ) AS rank_position,
      u.id,
      u.name,
      u.active_avatar,
      u.level,
      u.coins,
      u.victories,
      u.defeats,
      u.draws,
      (u.victories * 3 + u.draws)::integer AS score
    FROM public.app_users AS u
  )
  SELECT
    ranked.rank_position,
    ranked.id,
    ranked.name,
    ranked.active_avatar,
    ranked.level,
    ranked.coins,
    ranked.victories,
    ranked.defeats,
    ranked.draws,
    ranked.score
  FROM ranked
  WHERE ranked.rank_position > (
    (GREATEST(COALESCE(p_page, 1), 1) - 1)
    * LEAST(GREATEST(COALESCE(p_page_size, 10), 1), 100)
  )
  AND ranked.rank_position <= (
    (GREATEST(COALESCE(p_page, 1), 1) - 1)
    * LEAST(GREATEST(COALESCE(p_page_size, 10), 1), 100)
    + LEAST(GREATEST(COALESCE(p_page_size, 10), 1), 100)
  )
  ORDER BY ranked.rank_position;
$function$;

REVOKE ALL ON FUNCTION public.get_user_ranking_v2(integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_ranking_v2(integer, integer) TO service_role;
