# Talhe — site de móveis planejados

Site estático em **Astro** com visualizador 3D em **three.js**. Mobile first, sem backend.

> **Talhe** é uma identidade provisória. Nome, cidade, domínio e contatos estão
> concentrados em `src/config/empresa.ts` e precisam ser trocados antes de publicar.

## Executar

```bash
npm install
npm run dev        # desenvolvimento em http://localhost:4321
npm run build      # gera o site em dist/
npm run preview    # serve dist/ para conferência
```

Node 20+ recomendado. O conteúdo de `dist/` pode ir para qualquer hospedagem estática
(Netlify, Vercel, Cloudflare Pages, servidor próprio).

### GitHub Pages

Cada push em `main` publica o site pelo workflow `.github/workflows/pages.yml`.
O workflow define `SITE_URL` e `BASE_PATH` (o site fica em `/nome-do-repo/`);
todos os links internos passam por `u()` em `src/lib/url.ts` para respeitar esse prefixo.
Com domínio próprio, configure-o em Settings → Pages e o `BASE_PATH` passa a ser `/`.

O modelo original `cozinha_planejada.glb` não vai para o repositório (12 MB);
para regenerar a cópia otimizada, coloque-o na raiz e rode `npm run modelo`.

Ícones: [Phosphor Icons](https://phosphoricons.com) (MIT), peso *light*, em `src/components/Icone.astro`.

## Onde editar

| O quê | Arquivo |
|---|---|
| Nome, cidade, região, WhatsApp, telefone, e-mail, Instagram, envio do formulário | `src/config/empresa.ts` |
| Domínio (SEO, sitemap) | `src/config/empresa.ts` **e** `astro.config.mjs` **e** `public/robots.txt` |
| Ambientes (textos, listas, fotos) | `src/content/ambientes.ts` |
| Etapas do processo e perguntas frequentes | `src/content/processo.ts` |
| Pontos da cozinha 3D (texto complementar e enquadramento de câmera), materiais, medidas | `src/content/cozinha.ts` |
| Texto de privacidade | `src/pages/privacidade.astro` |

Campos vazios (`''`) somem do site sozinhos: sem WhatsApp configurado, não há botão de WhatsApp.

### Formulário de orçamento

O site é estático; o envio precisa de um serviço de formulários. Em `empresa.formulario`:

- **Formspree**: `endpoint: 'https://formspree.io/f/SEU_ID'`
- **Web3Forms**: `endpoint: 'https://api.web3forms.com/submit'`, `camposExtras: { access_key: 'SUA_CHAVE' }`

A confirmação “Pedido enviado” só aparece com resposta 2xx do serviço. Sem endpoint, o
formulário abre o WhatsApp (ou o e-mail) com a mensagem pronta; sem nenhum canal, monta a
mensagem para copiar e avisa que o envio on-line não está ativo. Nunca simula sucesso.

## Cozinha 3D

- Original: `cozinha_planejada.glb` (12 MB, não é publicado).
- Cópia para web: `public/modelos/cozinha.glb` (≈ 2,9 MB) — `npm run modelo`.
  Texturas em WebP, geometria com meshopt, malhas unidas por material (≈ 300 → 22 draw calls).
  Geometria, materiais, proporções e os cinco nós `HOTSPOT_*` (posição e `extras`) são
  preservados; o script confere isso ao final.
- Os **títulos e descrições** dos pontos vêm dos `extras` dos nós no GLB; as **posições** também.
  `src/content/cozinha.ts` só acrescenta texto e o enquadramento de câmera.
- Imagens estáticas (pôster, maquete, detalhes) são renderizadas do próprio GLB, com a mesma
  luz do 3D: `npm run renders` (usa Edge/Chrome instalado; defina `NAVEGADOR` se necessário).
  O script também grava em `src/data/hotspots-projetados.json` onde cada ponto cai em cada
  imagem — é isso que posiciona os números no pôster e na maquete da página inicial.

Decisões de iluminação (o GLB não traz a luz do Blender): ambiente de reflexão próprio
(`cena.ts`), luz direcional com sombra, luzes de área nas fitas de LED e nos pendentes,
oclusão de ambiente (GTAO) nas qualidades alta e média.

Ajustes de material necessários no three.js, documentados no código:
- **Inox**: as malhas não têm UV; sem isso a anisotropia do three.js gera reflexo branco.
  A anisotropia é desligada só nessas malhas.
- **Vidro fosco da janela**: transmissão em tempo real “puxava” objetos à frente para o
  desfoque; é renderizado como translúcido.

Comportamento: carrega sob demanda (no celular, só com “Explorar em 3D”, em tela cheia; no
desktop da página da cozinha, quando o visualizador aparece). Render só quando algo muda,
pausa fora da tela, resolução limitada e reduzida automaticamente em aparelhos lentos,
`prefers-reduced-motion` respeitado, teclado (setas, +/−, 0), falha e ausência de WebGL
com mensagem e alternativa funcional.

## Verificação

Com `npm run preview` rodando:

```bash
npm run verificar          # capturas celular/desktop, rolagem horizontal, alvos de toque
npm run testar:3d          # giro, zoom, pontos, tela cheia, voltar, falha de carga, sem WebGL
npm run testar:formulario  # validação e cada canal de envio (serviço simulado localmente)
npm run check              # tipos
```

## Imagens

- **Cozinha**: renders do modelo 3D, identificados como “Estudo 3D”. O modelo é uma
  reconstrução aproximada de uma referência visual — o site diz isso e não o apresenta como obra.
- **Demais ambientes e processo**: fotos do Unsplash (licença Unsplash, uso comercial
  permitido), marcadas como “Referência” com crédito do autor. Créditos em
  `src/data/creditos-fotos.json`. Troque por fotos de obras próprias quando houver
  (`tipoImagem: 'obra'` em `src/content/ambientes.ts`).
- Texturas do modelo: Poly Haven (CC0), conforme metadados do GLB.
