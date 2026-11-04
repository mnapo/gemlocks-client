-- Repair active games created with a starter/current_player mismatch.
-- This is safe only before either participant has made an attack.
UPDATE public.game_sessions
SET current_player = starter
WHERE status = 'active'
  AND human_guesses = '[]'::jsonb
  AND machine_guesses = '[]'::jsonb
  AND first_winner IS NULL
  AND current_player IS DISTINCT FROM starter;
