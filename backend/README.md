# Old Brother Backend V1

Backend inicial do sistema **Old Brother**, preparado para substituir o `localStorage` do protótipo React por API + banco PostgreSQL/Supabase.

## O que esta V1 cobre

- Login por PIN com JWT
- Perfis de acesso: admin, gerente, garçom, cozinha, caixa, delivery e estoque
- Usuários: criar, editar e desativar
- Produtos: criar, editar, excluir e listar
- Categorias
- Mesas
- Sessão de mesa via QR Code
- Pedidos de mesa, delivery, retirada, balcão e WhatsApp
- Status de pedido para cozinha/caixa
- Pagamento de mesa e pedidos externos
- Faturamento diário
- Estoque com entrada, saída, perda, ajuste e produção
- Relatório de dashboard
- Exportação de faturamento em Excel `.xlsx`

## Requisitos

- Node.js 18+
- PostgreSQL ou Supabase

## Como rodar

```powershell
cd old-brother-backend-v1
npm.cmd install
copy .env.example .env
npm.cmd run dev
```

No `.env`, configure a variável:

```env
DATABASE_URL=sua_connection_string_do_supabase_ou_postgres
JWT_SECRET=uma_chave_forte
FRONTEND_URL=http://localhost:5173
```

## Banco de dados

Execute o arquivo abaixo no SQL Editor do Supabase ou no seu PostgreSQL:

```txt
database/schema.sql
```

Ele cria as tabelas principais e um usuário admin inicial.

## Login inicial

```txt
Email: admin@oldbrother.local
PIN: 1234
```

Endpoint:

```http
POST /api/auth/login
```

Body:

```json
{
  "email": "admin@oldbrother.local",
  "pin": "1234"
}
```

## Fluxo correto de faturamento

Regra sênior aplicada nesta V1:

```txt
Mesa -> Caixa -> Faturamento
Delivery -> Caixa -> Faturamento
Retirada -> Caixa -> Faturamento
Balcão -> Caixa -> Faturamento
WhatsApp -> Caixa -> Faturamento
```

Nenhum pedido externo deve ir direto para faturamento sem passar pelo caixa.

## Exportar Excel

```http
GET /api/reports/sales/export.xlsx?from=2026-05-01&to=2026-05-31
Authorization: Bearer TOKEN
```

## Próximos passos

1. Conectar o frontend V5/V6 nesta API
2. Criar upload real de imagens no Supabase Storage
3. Adicionar fechamento de caixa completo
4. Adicionar ficha técnica e baixa automática de estoque
5. Adicionar Realtime para cozinha/caixa
6. Preparar webhook WhatsApp Business
