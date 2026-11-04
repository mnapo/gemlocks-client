ALTER TABLE public.game_sessions
  ADD COLUMN IF NOT EXISTS turn_version integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_turn_request_id uuid,
  ADD COLUMN IF NOT EXISTS last_turn_response jsonb;

CREATE OR REPLACE FUNCTION public.commit_game_turn(
  p_game_id uuid,
  p_user_id uuid,
  p_actor text,
  p_request_id uuid,
  p_expected_version integer,
  p_human_guesses jsonb,
  p_machine_guesses jsonb,
  p_first_winner text,
  p_final_turn_used boolean,
  p_current_player text,
  p_response jsonb,
  p_terminal_result text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_session public.game_sessions%ROWTYPE;
  v_finished boolean;
BEGIN
  IF p_actor NOT IN ('human', 'machine')
    OR p_current_player NOT IN ('human', 'machine')
    OR p_terminal_result IS NOT NULL AND p_terminal_result NOT IN ('victory', 'defeat', 'draw') THEN
    RAISE EXCEPTION 'Datos de turno inválidos';
  END IF;

  SELECT * INTO v_session
  FROM public.game_sessions
  WHERE game_id = p_game_id AND user_id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('accepted', false, 'reason', 'not_found');
  END IF;

  IF v_session.last_turn_request_id = p_request_id AND v_session.last_turn_response IS NOT NULL THEN
    RETURN v_session.last_turn_response || jsonb_build_object('duplicate', true);
  END IF;

  IF v_session.status <> 'active'
    OR v_session.turn_version <> p_expected_version
    OR v_session.current_player <> p_actor THEN
    RETURN jsonb_build_object('accepted', false, 'reason', 'stale', 'version', v_session.turn_version);
  END IF;

  UPDATE public.game_sessions
  SET human_guesses = p_human_guesses,
      machine_guesses = p_machine_guesses,
      first_winner = p_first_winner,
      final_turn_used = p_final_turn_used,
      current_player = p_current_player,
      turn_version = turn_version + 1,
      last_turn_request_id = p_request_id,
      last_turn_response = p_response || jsonb_build_object('accepted', true, 'duplicate', false, 'version', p_expected_version + 1),
      last_seen_at = now()
  WHERE game_id = p_game_id AND user_id = p_user_id;

  IF p_terminal_result IS NOT NULL THEN
    v_finished := public.finish_game(p_user_id, p_game_id, p_terminal_result);
    IF NOT v_finished THEN
      RAISE EXCEPTION 'No se pudo finalizar la partida';
    END IF;
  END IF;

  RETURN p_response || jsonb_build_object('accepted', true, 'duplicate', false, 'version', p_expected_version + 1);
END;
$function$;

REVOKE ALL ON FUNCTION public.commit_game_turn(uuid, uuid, text, uuid, integer, jsonb, jsonb, text, boolean, text, jsonb, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.commit_game_turn(uuid, uuid, text, uuid, integer, jsonb, jsonb, text, boolean, text, jsonb, text) TO service_role;

CREATE OR REPLACE FUNCTION public.get_game_turn_response(
  p_game_id uuid,
  p_user_id uuid,
  p_request_id uuid
)
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
SET search_path TO ''
AS $function$
  SELECT gs.last_turn_response
  FROM public.game_sessions AS gs
  WHERE gs.game_id = p_game_id
    AND gs.user_id = p_user_id
    AND gs.last_turn_request_id = p_request_id
    AND gs.last_turn_response IS NOT NULL
  LIMIT 1;
$function$;

REVOKE ALL ON FUNCTION public.get_game_turn_response(uuid, uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_game_turn_response(uuid, uuid, uuid) TO service_role;
