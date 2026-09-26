// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Endereço público e prefixo de caminho.
// Localmente: raiz. No GitHub Pages o workflow define SITE_URL e BASE_PATH
// (ex.: https://usuario.github.io + /nome-do-repo). Com domínio próprio, use BASE_PATH=/.
const SITE = process.env.SITE_URL ?? 'https://www.talhe.example';
const BASE = process.env.BASE_PATH ?? '/';

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'never',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  integrations: [sitemap({ filter: (p) => !p.includes('/404') })],
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  vite: {
    build: { chunkSizeWarningLimit: 900 },
  },
});
