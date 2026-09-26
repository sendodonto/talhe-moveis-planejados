# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Pessoas que estão reformando, construindo ou mobiliando um imóvel e querem móveis planejados sob medida (cozinha, dormitório, closet e outros ambientes). Chegam pelo celular na maioria das vezes, comparam empresas e decidem se vale pedir um orçamento.

## Product Purpose
Site institucional de uma marcenaria de móveis planejados de alto padrão. Apresenta os ambientes, mostra uma cozinha em 3D para o visitante explorar e converte visitas em pedidos de orçamento (formulário e WhatsApp).

## Positioning
Projeto feito a partir das medidas reais do imóvel, apresentado em 3D antes da produção, com a mesma empresa cuidando de medição, projeto, produção e montagem.

## Operating Context
Visitante no celular, com uma mão, entre outras abas de concorrentes. Pedido de orçamento precisa ser curto. O 3D é carregado só sob demanda.

## Capabilities and Constraints
- Site estático em Astro; visualizador 3D em three.js (`public/modelos/cozinha.glb`, hotspots lidos do GLB).
- Formulário sem backend: envia por serviço configurável (Formspree/Web3Forms), WhatsApp ou e-mail. Nunca confirma envio sem resposta real.
- Dados da empresa concentrados em `src/config/empresa.ts`.
- Estrutura de páginas decidida pelo designer (usuário delegou), com menos seções que a versão anterior.

## Brand Commitments
- Nome "Talhe" é PROVISÓRIO, assim como cidade, domínio e contatos.
- Idioma: português do Brasil. O usuário pediu texto de venda muito forte ("copywriting insano"), sem inventar fatos.
- Referências visuais escolhidas pelo usuário: site "MIRA" (herói fotográfico com nome em serifa grande, tons bege e madeira, grade de categorias com imagens, faixa de contato simples) e lojas de móveis com herói amplo e categorias em cards.

## Evidence on Hand
- Modelo 3D de uma cozinha em U (reconstrução aproximada de uma referência do Instagram; medidas estimadas). Renders gerados a partir dele em `src/assets/renders/`.
- Fotos de referência do Unsplash com créditos em `src/data/creditos-fotos.json`. Não são obras da empresa; o usuário aceitou usar foto de referência no herói.
- Não existem: clientes, depoimentos, números de projetos, prazos, garantias, prêmios, anos de experiência. Não fabricar.

## Product Principles
1. Vender com precisão: a força do texto vem de benefícios concretos e verificáveis, não de superlativos inventados.
2. Orçamento a um toque em qualquer tela.
3. Honestidade sobre imagens: referência e estudo 3D sempre identificados.
4. Celular primeiro; o desktop amplia, não inverte.

## Accessibility & Inclusion
WCAG 2.1 AA: contraste, foco visível, alvos de toque ≥ 44 px, `prefers-reduced-motion`, 3D com alternativa textual completa.
