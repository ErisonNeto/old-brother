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
