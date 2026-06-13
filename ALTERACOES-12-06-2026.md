# Alterações aplicadas — Old Brother

## Dashboard
- Faturamento agora aparece em quatro visões: diário, semanal, mensal e total.
- A análise por origem e forma de pagamento muda conforme o período selecionado.
- Mantidos os indicadores operacionais: pedidos em aberto, mesas ocupadas, estoque baixo e ticket médio.

## Caixa
- Os 10% do garçom ficaram desativados por padrão.
- O caixa/admin/gerente pode ativar a opção “Adicionar 10% do garçom” antes de imprimir ou fechar a mesa.
- Se a opção estiver desligada, o backend recebe taxa de serviço 0%.

## Cardápio / Delivery WhatsApp
- WhatsApp oficial configurado: `5591982358630`.
- A aba Cardápio possui carrinho para delivery.
- O cliente seleciona produtos, quantidade, endereço, taxa de entrega e observação.
- Ao finalizar, o sistema abre o WhatsApp da loja com todos os itens, subtotal, taxa de entrega e total.
- Foi criada a rota pública: `/#/cardapio/delivery`.
- O catálogo agora tem visual de delivery com banners do cardápio enviado e combos promocionais.

## Cardápio oficial cadastrado no projeto
Foram adicionados os itens do cardápio enviado:

- Costela Old — R$ 28,00
- Duplo Old Bacon — R$ 35,00
- Salad Old Burguer — R$ 20,00
- Classic Old Burguer — R$ 22,00
- Cheddar Old Burguer — R$ 22,00
- Old Brother Burguer — R$ 28,00
- Pineapple Old Burguer — R$ 26,00
- Batata M 240g — R$ 10,00
- Batata G 300g — R$ 13,00
- Batata com Costela e Sour Cream — R$ 22,00
- Combo Old Prime — R$ 42,00
- Combo Old — R$ 32,00
- Refri Lata — R$ 6,00
- Refrigerante 600ml — R$ 7,00
- Refrigerante 1 Litro — R$ 10,00
- Suco — R$ 7,00
- Milk-Shake — R$ 15,00
- Água — R$ 3,00
- Combo Especial Dia dos Namorados — R$ 65,90
- Combo Dia dos Namorados — R$ 95,90

## Banco de dados / Supabase
- O arquivo `backend/database/schema.sql` já recebeu o seed do cardápio.
- Também foi criado o arquivo separado `backend/database/seed-cardapio-old-brother.sql` para rodar somente o cardápio no Supabase se o banco já estiver criado.

## Configuração do frontend
```env
VITE_STORE_WHATSAPP=5591982358630
VITE_DEFAULT_DELIVERY_FEE=0
```

A taxa de entrega continua editável no pedido porque pode variar por bairro.
