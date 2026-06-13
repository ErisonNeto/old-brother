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
-- Cardápio oficial Old Brother - atualizado conforme arte enviada.
-- Pode rodar várias vezes no Supabase: atualiza itens existentes pelo nome e cria os que faltarem.

insert into categories (name)
values ('Promoções'), ('Hambúrgueres'), ('Combos'), ('Batatas'), ('Bebidas')
on conflict (name) do nothing;

with catalog (name, category_name, description, price, image_url, prep_time_minutes) as (
  values
    ('Combo Dia dos Namorados', 'Promoções', '1 milkshake de morango, 1 milkshake de Ovomaltine, 1 batata G, 1 refrigerante 600ml e 2 hambúrgueres especiais.', 95.90, '/assets/old-brother-combo-namorados-95.jpeg', 25),
    ('Combo Especial Dia dos Namorados', 'Promoções', '2 hambúrgueres, batata G e 1 refrigerante 600ml para compartilhar.', 65.90, '/assets/old-brother-combo-namorados-65.jpeg', 25),
    ('Costela Old', 'Hambúrgueres', 'Pão australiano, carne 150g, queijo prato, costela desfiada, geleia de pimenta e molho da casa.', 28.00, null, 18),
    ('Duplo Old Bacon', 'Hambúrgueres', 'Pão australiano, 2 carnes 150g, 2 queijos cheddar, bacon, creme de cheddar e molho da casa.', 35.00, null, 20),
    ('Salad Old Burguer', 'Hambúrgueres', 'Pão australiano, carne 150g, queijo prato, salada e molho da casa.', 20.00, null, 15),
    ('Classic Old Burguer', 'Hambúrgueres', 'Pão australiano, carne 150g, queijo cheddar, pickles e molho da casa.', 22.00, null, 15),
    ('Cheddar Old Burguer', 'Hambúrgueres', 'Pão australiano, carne 150g, queijo cheddar, cebola caramelizada e molho da casa.', 22.00, null, 15),
    ('Old Brother Burguer', 'Hambúrgueres', 'Pão australiano, carne 150g, queijo coalho, bacon e molho da casa.', 28.00, null, 18),
    ('Pineapple Old Burguer', 'Hambúrgueres', 'Pão australiano, carne 150g, queijo prato, abacaxi, bacon, geleia de pimenta e molho da casa.', 26.00, null, 18),
    ('Batata M 240g', 'Batatas', 'Porção de batata tamanho M com 240g.', 10.00, null, 12),
    ('Batata G 300g', 'Batatas', 'Porção de batata tamanho G com 300g.', 13.00, null, 12),
    ('Batata com Costela e Sour Cream', 'Batatas', 'Batata com costela desfiada e sour cream.', 22.00, null, 15),
    ('Combo Old Prime', 'Combos', 'Cheddar Old Burguer, batata P e milk-shake.', 42.00, null, 20),
    ('Combo Old', 'Combos', 'Cheddar Old Burguer, batata P e refrigerante lata.', 32.00, null, 20),
    ('Refri Lata', 'Bebidas', 'Refrigerante em lata.', 6.00, null, 3),
    ('Refrigerante 600ml', 'Bebidas', 'Refrigerante 600ml.', 7.00, null, 3),
    ('Refrigerante 1 Litro', 'Bebidas', 'Refrigerante 1 litro.', 10.00, null, 3),
    ('Suco', 'Bebidas', 'Suco da casa.', 7.00, null, 3),
    ('Milk-Shake', 'Bebidas', 'Milk-shake Old Brother.', 15.00, null, 8),
    ('Água', 'Bebidas', 'Água mineral.', 3.00, null, 3)
)
update products p
set
  category_id = c.id,
  description = catalog.description,
  price = catalog.price,
  image_url = catalog.image_url,
  available = true,
  prep_time_minutes = catalog.prep_time_minutes,
  updated_at = now()
from catalog
join categories c on c.name = catalog.category_name
where lower(p.name) = lower(catalog.name);

with catalog (name, category_name, description, price, image_url, prep_time_minutes) as (
  values
    ('Combo Dia dos Namorados', 'Promoções', '1 milkshake de morango, 1 milkshake de Ovomaltine, 1 batata G, 1 refrigerante 600ml e 2 hambúrgueres especiais.', 95.90, '/assets/old-brother-combo-namorados-95.jpeg', 25),
    ('Combo Especial Dia dos Namorados', 'Promoções', '2 hambúrgueres, batata G e 1 refrigerante 600ml para compartilhar.', 65.90, '/assets/old-brother-combo-namorados-65.jpeg', 25),
    ('Costela Old', 'Hambúrgueres', 'Pão australiano, carne 150g, queijo prato, costela desfiada, geleia de pimenta e molho da casa.', 28.00, null, 18),
    ('Duplo Old Bacon', 'Hambúrgueres', 'Pão australiano, 2 carnes 150g, 2 queijos cheddar, bacon, creme de cheddar e molho da casa.', 35.00, null, 20),
    ('Salad Old Burguer', 'Hambúrgueres', 'Pão australiano, carne 150g, queijo prato, salada e molho da casa.', 20.00, null, 15),
    ('Classic Old Burguer', 'Hambúrgueres', 'Pão australiano, carne 150g, queijo cheddar, pickles e molho da casa.', 22.00, null, 15),
    ('Cheddar Old Burguer', 'Hambúrgueres', 'Pão australiano, carne 150g, queijo cheddar, cebola caramelizada e molho da casa.', 22.00, null, 15),
    ('Old Brother Burguer', 'Hambúrgueres', 'Pão australiano, carne 150g, queijo coalho, bacon e molho da casa.', 28.00, null, 18),
    ('Pineapple Old Burguer', 'Hambúrgueres', 'Pão australiano, carne 150g, queijo prato, abacaxi, bacon, geleia de pimenta e molho da casa.', 26.00, null, 18),
    ('Batata M 240g', 'Batatas', 'Porção de batata tamanho M com 240g.', 10.00, null, 12),
    ('Batata G 300g', 'Batatas', 'Porção de batata tamanho G com 300g.', 13.00, null, 12),
    ('Batata com Costela e Sour Cream', 'Batatas', 'Batata com costela desfiada e sour cream.', 22.00, null, 15),
    ('Combo Old Prime', 'Combos', 'Cheddar Old Burguer, batata P e milk-shake.', 42.00, null, 20),
    ('Combo Old', 'Combos', 'Cheddar Old Burguer, batata P e refrigerante lata.', 32.00, null, 20),
    ('Refri Lata', 'Bebidas', 'Refrigerante em lata.', 6.00, null, 3),
    ('Refrigerante 600ml', 'Bebidas', 'Refrigerante 600ml.', 7.00, null, 3),
    ('Refrigerante 1 Litro', 'Bebidas', 'Refrigerante 1 litro.', 10.00, null, 3),
    ('Suco', 'Bebidas', 'Suco da casa.', 7.00, null, 3),
    ('Milk-Shake', 'Bebidas', 'Milk-shake Old Brother.', 15.00, null, 8),
    ('Água', 'Bebidas', 'Água mineral.', 3.00, null, 3)
)
insert into products (category_id, name, description, price, image_url, available, prep_time_minutes)
select c.id, catalog.name, catalog.description, catalog.price, catalog.image_url, true, catalog.prep_time_minutes
from catalog
join categories c on c.name = catalog.category_name
where not exists (
  select 1 from products p where lower(p.name) = lower(catalog.name)
);
