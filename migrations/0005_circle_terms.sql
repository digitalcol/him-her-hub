alter table circles add column if not exists joining_fee integer not null default 0;
alter table circles add column if not exists renewal_fee integer not null default 0;
alter table circles add column if not exists rules text not null default '';
alter table circle_memberships add column if not exists host_order integer;
