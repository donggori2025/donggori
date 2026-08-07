-- 결제·작업지시서 워크플로우 (크몽형)
-- Supabase SQL Editor에서 실행

create table if not exists work_orders (
  id uuid primary key default gen_random_uuid(),
  match_request_id uuid references match_requests(id) on delete set null,
  user_id text,
  user_email text not null,
  user_name text not null,
  factory_id text not null,
  factory_name text not null,
  title text not null default '작업지시서',
  description text default '',
  work_order_json jsonb not null default '{}'::jsonb,
  amount integer not null default 0,
  status text not null default 'work_order_sent',
  production_type text check (production_type in ('sample', 'production')),
  delivery_method text check (delivery_method in ('pickup', 'quick')),
  quick_delivery_fee integer not null default 15000,
  factory_read_at timestamptz,
  factory_notified_at timestamptz,
  completed_at timestamptz,
  purchase_confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_work_orders_user_email on work_orders(user_email);
create index if not exists idx_work_orders_factory_id on work_orders(factory_id);
create index if not exists idx_work_orders_status on work_orders(status);
create index if not exists idx_work_orders_match_request_id on work_orders(match_request_id);

create table if not exists work_order_messages (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references work_orders(id) on delete cascade,
  sender_role text not null check (sender_role in ('user', 'factory', 'system', 'admin')),
  sender_id text,
  sender_name text,
  message text not null default '',
  attachments jsonb not null default '[]'::jsonb,
  include_work_order boolean not null default false,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists idx_work_order_messages_order on work_order_messages(work_order_id, created_at);

create table if not exists work_order_payments (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references work_orders(id) on delete cascade,
  payment_type text not null check (payment_type in ('order', 'quick_delivery')),
  amount integer not null,
  status text not null default 'pending' check (status in ('pending', 'submitted', 'confirmed', 'rejected')),
  bank_name text,
  account_number text,
  account_holder text,
  depositor_name text,
  submitted_at timestamptz,
  confirmed_at timestamptz,
  confirmed_by text,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_work_order_payments_order on work_order_payments(work_order_id);

create table if not exists factory_notifications (
  id uuid primary key default gen_random_uuid(),
  factory_id text not null,
  work_order_id uuid references work_orders(id) on delete cascade,
  notification_type text not null default 'work_order_arrived',
  title text not null,
  body text not null default '',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_factory_notifications_factory on factory_notifications(factory_id, created_at desc);
create index if not exists idx_factory_notifications_unread on factory_notifications(factory_id) where read_at is null;
