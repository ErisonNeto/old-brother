# Arquitetura — Old Brother

## Decisões iniciais

- Banco: PostgreSQL/Supabase
- API: Node.js + Express
- Autenticação: JWT
- Relatórios: ExcelJS para exportação `.xlsx`
- Frontend: React + Vite

## Por que Supabase aguenta?

Para uma hamburgueria, o volume esperado é baixo/moderado: dezenas de usuários, dezenas de pedidos simultâneos e centenas de pedidos por dia. PostgreSQL/Supabase suporta esse cenário com folga quando usamos:

- índices nos campos de status/data/origem
- queries paginadas em histórico
- storage separado para imagens
- backend centralizando regras críticas
- transações para fechamento de caixa/faturamento

## Regras de consistência

1. Mesa só pode ter uma sessão ativa por vez.
2. Pedido só vira faturamento após pagamento confirmado no caixa.
3. Delivery, retirada, balcão e WhatsApp não pulam o caixa.
4. Exclusão de usuário deve preferir desativação para preservar histórico.
5. Estoque deve registrar movimentação, não apenas alterar número.
6. Relatórios devem sair do banco, não do estado local do navegador.

## Limitações da V1

- Ainda não possui upload de imagem no Supabase Storage.
- Ainda não possui Realtime.
- Ainda não possui ficha técnica de produtos.
- Ainda não possui fechamento completo de caixa com sangria/suprimento.
- Ainda não possui webhook WhatsApp.
