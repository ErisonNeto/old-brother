# Alterações front-end — Cardápio e responsividade

## Cardápio/Delivery
- Refeito o layout do cardápio público na paleta oficial da Old Brother.
- Removido o carrinho lateral grande da tela principal.
- Mantido fluxo estilo WhatsMenu: escolher produto, ajustar quantidade/observação, revisar pedido, entrega/retirada, pagamento e envio para WhatsApp.
- Menu reorganizado com busca, categorias laterais no desktop e categorias horizontais no tablet/mobile.
- Produtos sem imagens, usando cards textuais mais limpos, modernos e alinhados.
- WhatsApp oficial mantido: 5591982358630.

## Responsividade
- Ajustes globais para desktop, tablet e celular.
- Correções de overflow, cards estourando, botões fora do lugar e textos cortando.
- Dashboard, cards, filtros, formulários, ações, modais e checkout ajustados para telas menores.
- Bottom bar do pedido reposicionada para não ocupar a tela inteira e funcionar melhor no celular.

## CSS/semântica/debugging
- CSS final organizado em bloco V15 com variáveis da marca e regras de responsividade reforçadas.
- Melhorias de semântica no cardápio: header, section, aside, nav, article, labels acessíveis e botões com type.
- Adicionada classe sr-only para acessibilidade.
- Build testado com sucesso usando npm run build.
