-- Old Brother Backend V1
-- Execute este arquivo no SQL Editor do Supabase ou em um PostgreSQL local.

create extension if not exists "uuid-ossp";

create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text unique,
  pin_hash text not null,
  role text not null check (role in ('admin', 'gerente', 'garcom', 'cozinha', 'caixa', 'delivery', 'estoque')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists dining_tables (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  area text default 'Salão',
  capacity integer default 4,
  status text not null default 'livre' check (status in ('livre','ocupada','preparo','pronto','pagamento','inativa')),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists table_sessions (
  id uuid primary key default uuid_generate_v4(),
  table_id uuid not null references dining_tables(id),
  customer_name text,
  people integer default 1,
  status text not null default 'aberta' check (status in ('aberta','aguardando_pagamento','fechada','cancelada')),
  opened_by uuid references users(id),
  closed_by uuid references users(id),
  opened_at timestamptz not null default now(),
  closed_at timestamptz
);

create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  category_id uuid references categories(id),
  name text not null,
  description text,
  price numeric(12,2) not null default 0,
  image_url text,
  available boolean not null default true,
  prep_time_minutes integer default 15,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  order_number bigserial unique,
  origin text not null check (origin in ('mesa','delivery','retirada','balcao','whatsapp')),
  type text not null default 'mesa' check (type in ('mesa','delivery','retirada','balcao','whatsapp')),
  status text not null default 'novo' check (status in ('novo','preparo','pronto','aguardando_pagamento','saiu_entrega','entregue','finalizado','cancelado')),
  table_session_id uuid references table_sessions(id),
  customer_name text,
  customer_phone text,
  delivery_address text,
  delivery_neighborhood text,
  delivery_reference text,
  delivery_fee numeric(12,2) not null default 0,
  notes text,
  created_by uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  finished_at timestamptz
);

create table if not exists order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id),
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists payments (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references orders(id),
  table_session_id uuid references table_sessions(id),
  method text not null check (method in ('pix','debito','credito','dinheiro','misto')),
  subtotal numeric(12,2) not null default 0,
  service_fee numeric(12,2) not null default 0,
  delivery_fee numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  paid_by uuid references users(id),
  paid_at timestamptz not null default now()
);

create table if not exists sales (
  id uuid primary key default uuid_generate_v4(),
  payment_id uuid not null references payments(id),
  origin text not null check (origin in ('mesa','delivery','retirada','balcao','whatsapp')),
  total numeric(12,2) not null default 0,
  sale_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists stock_items (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text,
  unit text not null default 'unidade',
  quantity numeric(12,3) not null default 0,
  minimum_quantity numeric(12,3) not null default 0,
  unit_cost numeric(12,2) not null default 0,
  supplier text,
  expiration_date date,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists stock_movements (
  id uuid primary key default uuid_generate_v4(),
  stock_item_id uuid not null references stock_items(id),
  type text not null check (type in ('entrada','saida','perda','ajuste','producao')),
  quantity numeric(12,3) not null,
  reason text,
  created_by uuid references users(id),
  created_at timestamptz not null default now()
);

create table if not exists cash_registers (
  id uuid primary key default uuid_generate_v4(),
  opened_by uuid references users(id),
  closed_by uuid references users(id),
  opening_amount numeric(12,2) not null default 0,
  closing_amount numeric(12,2),
  status text not null default 'aberto' check (status in ('aberto','fechado')),
  opened_at timestamptz not null default now(),
  closed_at timestamptz
);

create table if not exists audit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id),
  action text not null,
  entity text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_origin on orders(origin);
create index if not exists idx_sales_date on sales(sale_date);
create index if not exists idx_table_sessions_status on table_sessions(status);

insert into categories (name)
values ('Burgers'), ('Combos'), ('Porções'), ('Bebidas'), ('Adicionais')
on conflict (name) do nothing;

-- Usuário admin inicial: PIN 1234
-- Hash bcrypt para 1234.
insert into users (name, email, pin_hash, role, active)
values ('Admin Old Brother', 'admin@oldbrother.local', '$2a$10$ng/ffgzvNrp5U8PcRmjKGecmfnxMIBfij/JkCg8XnzPC67IL4Cplq', 'admin', true)
on conflict (email) do nothing;
