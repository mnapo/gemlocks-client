ALTER TABLE public.game_sessions
  ADD COLUMN IF NOT EXISTS glyph_values jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.game_sessions
  DROP CONSTRAINT IF EXISTS game_sessions_glyph_values_array_check,
  ADD CONSTRAINT game_sessions_glyph_values_array_check
  CHECK (jsonb_typeof(glyph_values) = 'array');