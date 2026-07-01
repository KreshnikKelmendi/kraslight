-- Kraslight Supabase schema (run in Supabase SQL Editor)

create extension if not exists "pgcrypto";

-- Products
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  legacy_mongo_id text unique,
  title text not null,
  price numeric,
  original_price numeric,
  discount_percentage numeric check (discount_percentage is null or (discount_percentage >= 0 and discount_percentage <= 100)),
  image text,
  images jsonb not null default '[]'::jsonb,
  main_image text,
  description text,
  stock integer check (stock is null or stock >= 0),
  brand text not null,
  brand_logo text,
  sizes text not null default '',
  subcategory text not null default '',
  barcode text not null default '',
  gender text not null default 'Të Gjitha' check (gender in ('Meshkuj', 'Femra', 'Të Gjitha')),
  category text not null default 'Të tjera',
  is_new_arrival boolean not null default false,
  characteristics jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_stock on products (stock);
create index if not exists idx_products_created_at on products (created_at desc);
create index if not exists idx_products_brand_lower on products (lower(brand));
create index if not exists idx_products_category on products (category);
create index if not exists idx_products_gender on products (gender);

-- Collections
create table if not exists collections (
  id uuid primary key default gen_random_uuid(),
  legacy_mongo_id text unique,
  name text not null,
  description text,
  image text not null,
  categories jsonb not null default '[]'::jsonb,
  product_ids jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Orders (items stored as jsonb snapshot, same as Mongo)
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  legacy_mongo_id text unique,
  email text not null,
  first_name text not null,
  last_name text not null,
  phone text not null,
  country text not null,
  address text not null,
  city text,
  postal_code text not null,
  notes text,
  payment_method text not null default 'cash',
  items jsonb not null default '[]'::jsonb,
  total numeric not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_orders_created_at on orders (created_at desc);

-- Sliders
create table if not exists sliders (
  id uuid primary key default gen_random_uuid(),
  legacy_mongo_id text unique,
  slides jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_sliders_one_active on sliders (is_active) where is_active = true;

-- Subscribers
create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  legacy_mongo_id text unique,
  email text not null unique,
  is_active boolean not null default true,
  subscribed_at timestamptz not null default now(),
  last_email_sent timestamptz,
  email_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- updated_at trigger
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists products_updated_at on products;
create trigger products_updated_at before update on products
  for each row execute function set_updated_at();

drop trigger if exists collections_updated_at on collections;
create trigger collections_updated_at before update on collections
  for each row execute function set_updated_at();

drop trigger if exists orders_updated_at on orders;
create trigger orders_updated_at before update on orders
  for each row execute function set_updated_at();

drop trigger if exists sliders_updated_at on sliders;
create trigger sliders_updated_at before update on sliders
  for each row execute function set_updated_at();

drop trigger if exists subscribers_updated_at on subscribers;
create trigger subscribers_updated_at before update on subscribers
  for each row execute function set_updated_at();

-- Deactivate other sliders when one becomes active
create or replace function deactivate_other_sliders()
returns trigger as $$
begin
  if new.is_active then
    update sliders set is_active = false where id <> new.id and is_active = true;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists sliders_single_active on sliders;
create trigger sliders_single_active after insert or update of is_active on sliders
  for each row execute function deactivate_other_sliders();

-- RLS off for server-side API access (enable policies later for client reads)
alter table products disable row level security;
alter table collections disable row level security;
alter table orders disable row level security;
alter table sliders disable row level security;
alter table subscribers disable row level security;

-- See storage-and-policies.sql for Storage bucket + grants
