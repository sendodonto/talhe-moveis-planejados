// Caminhos internos com o prefixo de publicação (ex.: GitHub Pages em /nome-do-repo).
// O prefixo vem de BASE_PATH no build (astro.config.mjs); localmente é a raiz.
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Prefixa um caminho interno ("/orcamento") com a base de publicação. */
export const u = (caminho: string) => (caminho.startsWith('/') ? base + caminho : caminho);

/** Remove a base de um pathname, para comparar com rotas ("/projetos"). */
export const semBase = (pathname: string) => (base && pathname.startsWith(base) ? pathname.slice(base.length) || '/' : pathname);
