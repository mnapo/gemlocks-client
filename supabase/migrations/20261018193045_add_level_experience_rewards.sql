ALTER TABLE public.app_users
  ADD COLUMN IF NOT EXISTS level integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS experience integer NOT NULL DEFAULT 0;

ALTER TABLE public.app_users
  DROP CONSTRAINT IF EXISTS app_users_level_check,
  ADD CONSTRAINT app_users_level_check CHECK (level >= 1),
  DROP CONSTRAINT IF EXISTS app_users_experience_check,
  ADD CONSTRAINT app_users_experience_check CHECK (experience >= 0 AND experience < 1000);

ALTER TABLE public.game_results
  ADD COLUMN IF NOT EXISTS experience_reward integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level_up boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS level_reward_coins integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level_reward_gems integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS resulting_level integer,
  ADD COLUMN IF NOT EXISTS resulting_experience integer NOT NULL DEFAULT 0;

ALTER TABLE public.game_results
  DROP CONSTRAINT IF EXISTS game_results_experience_reward_check,
  ADD CONSTRAINT game_results_experience_reward_check CHECK (experience_reward >= 0),
  DROP CONSTRAINT IF EXISTS game_results_level_reward_coins_check,
  ADD CONSTRAINT game_results_level_reward_coins_check CHECK (level_reward_coins >= 0),
  DROP CONSTRAINT IF EXISTS game_results_level_reward_gems_check,
  ADD CONSTRAINT game_results_level_reward_gems_check CHECK (level_reward_gems >= 0),
  DROP CONSTRAINT IF EXISTS game_results_resulting_experience_check,
  ADD CONSTRAINT game_results_resulting_experience_check CHECK (resulting_experience >= 0 AND resulting_experience < 1000);

CREATE OR REPLACE FUNCTION public.apply_experience_reward(p_user_id uuid, p_xp_reward integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  current_level integer;
  current_experience integer;
  next_level integer;
  next_experience integer;
  level_up boolean := false;
  level_coins integer := 0;
  level_gems integer := 0;
BEGIN
  IF p_xp_reward IS NULL OR p_xp_reward < 0 OR p_xp_reward > 1000 THEN
    RAISE EXCEPTION 'Recompensa de experiencia inválida';
  END IF;

  SELECT u.level, u.experience INTO current_level, current_experience
  FROM public.app_users AS u WHERE u.id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Usuario no encontrado'; END IF;

  next_level := current_level;
  next_experience := current_experience + p_xp_reward;
  IF next_experience >= 1000 THEN
    next_level := current_level + 1;
    next_experience := 0;
    level_up := true;
    level_coins := floor(random() * 161)::integer;
    IF random() < 0.01 THEN level_gems := floor(random() * 10)::integer + 1; END IF;
  END IF;

  UPDATE public.app_users AS u
  SET level = next_level, experience = next_experience,
      coins = u.coins + level_coins, gems = u.gems + level_gems
  WHERE u.id = p_user_id;

  RETURN jsonb_build_object(
    'experienceReward', p_xp_reward, 'levelUp', level_up,
    'levelRewardCoins', level_coins, 'levelRewardGems', level_gems,
    'level', next_level, 'experience', next_experience
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.apply_experience_reward(uuid, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_experience_reward(uuid, integer) TO service_role;

CREATE OR REPLACE FUNCTION public.finish_game(p_user_id uuid, p_game_id uuid, p_result text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_session_status text;
  v_game_difficulty integer;
  v_coins_reward integer := 0;
  v_base_coin_reward integer := 0;
  v_min_reward integer := 0;
  v_max_reward integer := 0;
  v_base_xp_reward integer := 0;
  v_xp_reward integer := 0;
  v_level_reward_coins integer := 0;
  v_level_reward_gems integer := 0;
  v_level_up boolean := false;
  v_resulting_level integer;
  v_resulting_experience integer;
  v_xp_data jsonb;
  v_inserted_result boolean := false;
BEGIN
  IF p_result NOT IN ('victory', 'defeat', 'draw') THEN
    RAISE EXCEPTION 'Resultado inválido: %', p_result;
  END IF;

  SELECT gs.difficulty INTO v_game_difficulty
  FROM public.game_sessions AS gs
  WHERE gs.game_id = p_game_id AND gs.user_id = p_user_id AND gs.status = 'active'
  FOR UPDATE;
  IF NOT FOUND THEN RETURN false; END IF;

  v_session_status := CASE WHEN p_result = 'victory' THEN 'won' WHEN p_result = 'defeat' THEN 'lost' ELSE 'draw' END;
  UPDATE public.game_sessions AS gs
  SET status = v_session_status, finished_at = now(), last_seen_at = now()
  WHERE gs.game_id = p_game_id AND gs.user_id = p_user_id AND gs.status = 'active';
  IF NOT FOUND THEN RETURN false; END IF;

  IF p_result = 'victory' THEN
    v_base_coin_reward := CASE v_game_difficulty WHEN 1 THEN 15 WHEN 2 THEN 25 WHEN 3 THEN 40 WHEN 4 THEN 60 WHEN 5 THEN 80 ELSE 0 END;
    IF v_base_coin_reward > 0 THEN
      v_min_reward := ceil(v_base_coin_reward * 0.75)::integer;
      v_max_reward := floor(v_base_coin_reward * 1.25)::integer;
      v_coins_reward := v_min_reward + floor(random() * (v_max_reward - v_min_reward + 1))::integer;
    END IF;
  END IF;

  INSERT INTO public.game_results(game_id, user_id, result, coins_reward)
  VALUES (p_game_id, p_user_id, p_result, v_coins_reward)
  ON CONFLICT (game_id) DO NOTHING;
  v_inserted_result := FOUND;

  IF v_inserted_result THEN
    IF p_result IN ('victory', 'draw') THEN
      v_base_xp_reward := CASE v_game_difficulty WHEN 1 THEN 100 WHEN 2 THEN 230 WHEN 3 THEN 300 WHEN 4 THEN 330 WHEN 5 THEN 400 ELSE 0 END;
      v_xp_reward := greatest(0, v_base_xp_reward + floor(random() * 101)::integer - 50);
      v_xp_data := public.apply_experience_reward(p_user_id, v_xp_reward);
      v_level_reward_coins := (v_xp_data ->> 'levelRewardCoins')::integer;
      v_level_reward_gems := (v_xp_data ->> 'levelRewardGems')::integer;
      v_level_up := (v_xp_data ->> 'levelUp')::boolean;
      v_resulting_level := (v_xp_data ->> 'level')::integer;
      v_resulting_experience := (v_xp_data ->> 'experience')::integer;
    ELSE
      SELECT u.level, u.experience INTO v_resulting_level, v_resulting_experience
      FROM public.app_users AS u WHERE u.id = p_user_id;
    END IF;

    UPDATE public.game_results AS gr
    SET experience_reward = v_xp_reward, level_up = v_level_up,
        level_reward_coins = v_level_reward_coins, level_reward_gems = v_level_reward_gems,
        resulting_level = v_resulting_level, resulting_experience = v_resulting_experience
    WHERE gr.game_id = p_game_id;

    IF p_result = 'victory' THEN
      UPDATE public.app_users AS u SET victories = u.victories + 1, coins = u.coins + v_coins_reward WHERE u.id = p_user_id;
    ELSIF p_result = 'defeat' THEN
      UPDATE public.app_users AS u SET defeats = u.defeats + 1 WHERE u.id = p_user_id;
    ELSE
      UPDATE public.app_users AS u SET draws = u.draws + 1 WHERE u.id = p_user_id;
    END IF;
    IF NOT FOUND THEN RAISE EXCEPTION 'Usuario no encontrado'; END IF;
  END IF;

  RETURN true;
END;
$function$;

REVOKE ALL ON FUNCTION public.finish_game(uuid, uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.finish_game(uuid, uuid, text) TO service_role;
