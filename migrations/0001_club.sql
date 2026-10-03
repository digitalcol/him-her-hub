create table if not exists couples (
  id text primary key,
  name text not null,
  area text not null,
  about text not null default '',
  interests text not null default '',
  referral text,
  status text not null,
  photo_consent boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists people (
  id text primary key,
  couple_id text not null references couples (id),
  first_name text not null,
  last_name text not null,
  profession text,
  instagram text,
  phone text
);

create table if not exists circles (
  id text primary key,
  name text not null,
  city text not null default 'Bangalore',
  status text not null,
  capacity integer not null default 10,
  kitty_amount integer not null,
  whatsapp_url text,
  start_date date
);

create table if not exists circle_memberships (
  circle_id text not null references circles (id),
  couple_id text not null references couples (id),
  primary key (circle_id, couple_id)
);

create table if not exists events (
  id text primary key,
  circle_id text not null references circles (id),
  title text not null,
  place text not null,
  event_date date,
  host_couple_id text
);

create table if not exists availability (
  event_id text not null references events (id),
  couple_id text not null references couples (id),
  available boolean not null,
  primary key (event_id, couple_id)
);

create table if not exists ledger (
  id text primary key,
  circle_id text not null references circles (id),
  kind text not null,
  amount integer not null,
  note text not null,
  created_at timestamptz not null default now()
);
