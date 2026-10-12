create table if not exists couple_logins (
  couple_id text primary key references couples (id),
  username text not null unique,
  password_hash text not null,
  password_sealed text not null
);
