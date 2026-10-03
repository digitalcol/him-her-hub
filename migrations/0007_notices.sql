create table if not exists notices (
  id text primary key,
  circle_id text,
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);
