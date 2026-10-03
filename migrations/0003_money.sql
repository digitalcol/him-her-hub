create table if not exists expenses (
  id text primary key,
  circle_id text not null references circles (id),
  amount integer not null check (amount > 0),
  note text not null,
  status text not null check (status in ('PENDING', 'APPROVED', 'REJECTED')),
  created_at timestamptz not null default now()
);

create unique index if not exists ledger_one_expense
  on ledger (reference_id)
  where reference_type = 'EXPENSE';

create table if not exists rate_limits (
  key text primary key,
  hits integer not null,
  window_start timestamptz not null
);
