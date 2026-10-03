alter table couples add column if not exists privacy_consent_at timestamptz;
alter table couples add column if not exists privacy_consent_version text;
alter table couples add column if not exists photo_consent_at timestamptz;
alter table couples add column if not exists photo_consent_version text;
alter table couples add column if not exists organise text;
alter table couples add column if not exists reviewed_at timestamptz;
alter table couples add column if not exists updated_at timestamptz not null default now();

alter table circles add column if not exists description text;

alter table circle_memberships add column if not exists id text;
alter table circle_memberships add column if not exists status text not null default 'ACTIVE';
alter table circle_memberships add column if not exists joined_at timestamptz not null default now();
update circle_memberships set id = circle_id || ':' || couple_id where id is null;
alter table circle_memberships drop constraint if exists circle_memberships_pkey;
alter table circle_memberships add primary key (id);
create unique index if not exists one_active_circle_membership
  on circle_memberships (couple_id)
  where status = 'ACTIVE';

create table if not exists contributions (
  id text primary key,
  circle_id text not null references circles (id),
  couple_id text not null references couples (id),
  expected_amount integer not null,
  status text not null,
  paid_at timestamptz,
  recorded_by text
);

create table if not exists admin_notes (
  id text primary key,
  couple_id text not null references couples (id),
  body text not null,
  created_at timestamptz not null default now()
);

alter table ledger add column if not exists reference_type text;
alter table ledger add column if not exists reference_id text;
alter table ledger add column if not exists created_by text;

alter table events add column if not exists description text;
alter table events add column if not exists status text not null default 'CONFIRMED';
alter table events add column if not exists budget integer;

alter table availability add column if not exists choice text;

create table if not exists application_assets (
  id text primary key,
  couple_id text not null references couples (id),
  role text not null,
  mime text not null,
  storage_key text not null
);

create table if not exists instagram_media (
  id text primary key,
  hidden_on_site boolean not null default false,
  featured boolean not null default false,
  sort_override integer
);

alter table couples drop constraint if exists couples_status_check;
alter table couples add constraint couples_status_check
  check (status in ('NEW', 'REVIEWING', 'HOLD', 'APPROVED', 'WAITING_FOR_CIRCLE', 'ASSIGNED', 'DECLINED'));
