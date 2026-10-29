-- Public landing: news and authenticated contact submissions.
create table if not exists public.game_news (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 160),
  body text not null check (char_length(body) between 1 and 4000),
  published boolean not null default false,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table public.game_news enable row level security;

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.app_users(id) on delete cascade,
  kind text not null check (kind in ('reporte', 'sugerencia', 'asistencia', 'solicitud')),
  message text not null check (char_length(message) between 5 and 2000),
  local_date date not null,
  created_at timestamptz not null default now(),
  constraint contact_messages_one_per_user_day unique (user_id, local_date)
);
alter table public.contact_messages enable row level security;
