# Old Brother Frontend API V1

Primeira versão do front-end conectada ao backend Node/Express + Supabase.

## O que já conecta na API

- Login real via `/api/auth/login`
- Token JWT salvo no navegador
- Produtos carregados de `/api/products`
- Mesas carregadas de `/api/tables`
- Estoque carregado de `/api/stock` quando houver token

## Ainda em modo local nesta versão

- Pedidos
- Caixa
- Faturamento
- Sessão de mesa

Esses módulos serão migrados para o backend na próxima etapa.

## Como rodar

```powershell
cd "C:\Users\SPXBR29048\Downloads\old-brother-frontend-api-v1"
npm.cmd install --no-audit --no-fund
npm.cmd run dev
```

Antes, deixe o backend rodando em outra janela:

```powershell
cd "C:\Users\SPXBR29048\Downloads\old-brother-backend-v1"
npm.cmd run dev
```

## Login

- E-mail: `admin@oldbrother.local`
- PIN: `1234`

## Variáveis

Crie um `.env` com base no `.env.example` se precisar mudar a URL da API.


## V11 — Impressão de Pedidos

Esta versão adiciona impressão pelo navegador para comandas de cozinha e fechamento de conta. Funciona com impressora comum, térmica 58mm/80mm ou impressão em PDF, desde que a impressora esteja instalada no dispositivo.

Pontos com impressão:
- Central de Pedidos: botão Imprimir em cada pedido.
- Cozinha/KDS: botão Imprimir em cada comanda.
- Mesa: botão Imprimir nos pedidos da sessão.
- Caixa: impressão da conta da mesa e pedidos externos.

Observação: a impressão automática sem janela do navegador depende de uma integração local futura com impressora térmica.
