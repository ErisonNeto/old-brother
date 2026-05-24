# Old Brother Fullstack V10 — Token Fix

Correção focada no erro "Token inválido ou expirado" no dashboard.

## Ajustes
- Front limpa token antigo automaticamente ao receber 401.
- Dashboard não fica preso exibindo erro de token expirado.
- Requisições públicas de mesas/produtos continuam sem autenticação.
- Requisições protegidas redirecionam para novo login quando o token expira.
- Build do frontend testado com sucesso.

## Rodar backend
```powershell
cd "C:\Users\SPXBR29048\Downloads\old-brother-fullstack-v10-token-fix\backend"
npm.cmd install --no-audit --no-fund
npm.cmd run dev
```

## Rodar frontend
```powershell
cd "C:\Users\SPXBR29048\Downloads\old-brother-fullstack-v10-token-fix\frontend"
npm.cmd install --no-audit --no-fund
npm.cmd run dev
```

## Importante
Configure `backend/.env` com a DATABASE_URL real do Supabase Pooler antes de rodar.


## V11 — Impressão de Pedidos

Esta versão adiciona impressão pelo navegador para comandas de cozinha e fechamento de conta. Funciona com impressora comum, térmica 58mm/80mm ou impressão em PDF, desde que a impressora esteja instalada no dispositivo.

Pontos com impressão:
- Central de Pedidos: botão Imprimir em cada pedido.
- Cozinha/KDS: botão Imprimir em cada comanda.
- Mesa: botão Imprimir nos pedidos da sessão.
- Caixa: impressão da conta da mesa e pedidos externos.

Observação: a impressão automática sem janela do navegador depende de uma integração local futura com impressora térmica.


## V12 — CSS Refactor

- CSS reorganizado por seções.
- Navbar desktop/mobile revisada.
- Responsividade para tablet e mobile ajustada sem alterar a base desktop.
- Redução de regras duplicadas e conflitos de `.btn.ghost`/logout.
- Build do frontend testado com sucesso.

## V13 — Correção QR Code Vercel e layout de mesas

- Adicionado `frontend/vercel.json` com rewrite SPA para corrigir rotas públicas como `/cardapio/mesa/:id` na Vercel.
- Ajustado alinhamento de status/pills nos cards de mesa.
- Ajustado resumo da mesa para evitar texto colado.
- Melhorado espaçamento da área de detalhe da mesa e lista de produtos.
