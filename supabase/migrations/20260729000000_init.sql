-- vaijá schema
create extension if not exists "pgcrypto";

create type user_role as enum ('cliente', 'motorista', 'admin');
create type ride_status as enum (
  'solicitada', 'aceita', 'a_caminho', 'em_andamento', 'concluida', 'cancelada'
);
create type vehicle_category as enum ('economico', 'comfort', 'suv', 'moto');
create type payment_type as enum ('pix', 'visa', 'mastercard');
create type ticket_status as enum ('aberto', 'em_andamento', 'resolvido');
create type sos_status as enum ('aberto', 'atendido');
create type tx_type as enum ('corrida', 'taxa', 'credito', 'saque');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  phone text default '',
  role user_role not null default 'cliente',
  avatar text,
  blocked boolean not null default false,
  referral_code text,
  rating numeric(3,2) default 5.0,
  created_at timestamptz not null default now()
);

create table public.drivers (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  online boolean not null default false,
  vehicle_model text not null default 'A definir',
  vehicle_color text not null default '-',
  vehicle_plate text not null default '-',
  documents_approved boolean not null default false,
  earnings_today numeric(12,2) not null default 0,
  earnings_week numeric(12,2) not null default 0,
  lat double precision not null default -23.55,
  lng double precision not null default -46.63
);

create table public.places (
  id text primary key,
  label text not null,
  address text not null,
  lat double precision not null,
  lng double precision not null,
  icon text
);

create table public.wallets (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  balance numeric(12,2) not null default 0
);

create table public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type payment_type not null,
  label text not null,
  selected boolean not null default false
);

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text not null default '',
  discount_percent int not null default 10,
  expires_at date not null default '2026-12-31',
  active boolean not null default true
);

create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  place_id text references public.places(id),
  label text not null,
  address text not null,
  lat double precision not null,
  lng double precision not null,
  icon text
);

create table public.rides (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles(id),
  driver_id uuid references public.profiles(id),
  status ride_status not null default 'solicitada',
  origin_label text not null,
  origin_address text not null,
  origin_lat double precision not null,
  origin_lng double precision not null,
  destination_label text not null,
  destination_address text not null,
  destination_lat double precision not null,
  destination_lng double precision not null,
  category vehicle_category not null default 'economico',
  price numeric(12,2) not null,
  service_fee numeric(12,2) not null default 2.5,
  total numeric(12,2) not null,
  payment_method text not null default 'PIX',
  coupon_code text,
  eta_min int not null default 3,
  distance_km numeric(8,2) not null default 4.2,
  rating int,
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  ride_id uuid references public.rides(id),
  user_id uuid not null references public.profiles(id),
  type tx_type not null,
  amount numeric(12,2) not null,
  description text not null,
  created_at timestamptz not null default now()
);

create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  user_name text not null,
  category text not null default 'Geral',
  subject text not null,
  message text not null default '',
  status ticket_status not null default 'aberto',
  created_at timestamptz not null default now()
);

create table public.sos_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  user_name text not null,
  ride_id uuid references public.rides(id),
  status sos_status not null default 'aberto',
  lat double precision not null default -23.55,
  lng double precision not null default -46.63,
  created_at timestamptz not null default now()
);

create index rides_status_idx on public.rides(status);
create index rides_client_idx on public.rides(client_id);
create index rides_driver_idx on public.rides(driver_id);

alter table public.profiles enable row level security;
alter table public.drivers enable row level security;
alter table public.wallets enable row level security;
alter table public.payment_methods enable row level security;
alter table public.favorites enable row level security;
alter table public.rides enable row level security;
alter table public.transactions enable row level security;
alter table public.support_tickets enable row level security;
alter table public.sos_alerts enable row level security;
alter table public.coupons enable row level security;
alter table public.places enable row level security;

-- Service role bypasses RLS; anon/authenticated policies for direct client use
create policy "profiles read own or admin"
  on public.profiles for select
  using (
    auth.uid() = id
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "profiles update own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "coupons public read"
  on public.coupons for select
  using (active = true);

create policy "places public read"
  on public.places for select
  using (true);

create policy "rides participants"
  on public.rides for select
  using (
    auth.uid() = client_id
    or auth.uid() = driver_id
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

insert into public.places (id, label, address, lat, lng, icon) values
  ('p-home', 'Casa', 'Rua das Flores, 120 — Pinheiros', -23.5615, -46.691, 'home'),
  ('p-work', 'Trabalho', 'Av. Paulista, 1000 — Bela Vista', -23.5614, -46.6559, 'work'),
  ('p-airport', 'Aeroporto', 'Aeroporto de Congonhas — SP', -23.6261, -46.6566, 'airport'),
  ('p-morumbi', 'Shopping Morumbi', 'Av. Roque Petroni Júnior, 1089', -23.6226, -46.6986, 'pin'),
  ('p-ibirapuera', 'Parque Ibirapuera', 'Av. Pedro Álvares Cabral — SP', -23.5873, -46.6576, 'pin');

insert into public.coupons (code, description, discount_percent, expires_at, active) values
  ('VAIJA10', '10% OFF na próxima corrida', 10, '2026-12-31', true),
  ('VAIJA20', '20% OFF até R$ 15', 20, '2026-09-30', true);
