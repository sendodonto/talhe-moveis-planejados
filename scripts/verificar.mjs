// Verificação visual e funcional do site em celular e desktop.
// Requer o site rodando (npm run build && npm run preview).
// Uso: node scripts/verificar.mjs [urlBase] [pastaSaida]
import { chromium } from 'playwright-core';
import { existsSync, mkdirSync } from 'node:fs';

const base = process.argv[2] ?? 'http://127.0.0.1:4321';
const saida = process.argv[3] ?? 'verificacao';
mkdirSync(saida, { recursive: true });

const executablePath = [
  process.env.NAVEGADOR,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find((p) => p && existsSync(p));

const paginas = ['/', '/projetos', '/projetos/cozinha-em-u', '/projetos/closet-nogueira', '/projetos/sala-carvalho', '/sobre', '/orcamento', '/privacidade', '/nao-existe'];
const telas = {
  celular: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
};

const navegador = await chromium.launch({ executablePath, args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
let problemas = 0;

for (const [nome, opcoes] of Object.entries(telas)) {
  const ctx = await navegador.newContext({ ...opcoes, locale: 'pt-BR', reducedMotion: 'reduce' });
  const pagina = await ctx.newPage();
  const erros = [];
  pagina.on('pageerror', (e) => erros.push(e.message));
  pagina.on('console', (m) => m.type() === 'error' && !pagina.url().includes('/nao-existe') && erros.push(m.text()));
  for (const caminho of paginas) {
    await pagina.goto(base + caminho, { waitUntil: 'networkidle' });
    const r = await pagina.evaluate(() => {
      const doc = document.documentElement;
      const largura = doc.clientWidth;
      const vazando = [...document.querySelectorAll('body *')]
        .filter((el) => {
          const b = el.getBoundingClientRect();
          if (!b.width || getComputedStyle(el).position === 'fixed') return false;
          let p = el.parentElement;
          while (p && p !== document.body) {
            const o = getComputedStyle(p).overflowX;
            if (o === 'auto' || o === 'scroll' || o === 'hidden' || o === 'clip') return false;
            p = p.parentElement;
          }
          return b.right > largura + 1 || b.left < -1;
        })
        .slice(0, 5)
        .map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].join('.')}`);
      const pequenos = [...document.querySelectorAll('a[href], button, input, select, summary, [tabindex="0"]')]
        .filter((el) => {
          const b = el.getBoundingClientRect();
          const s = getComputedStyle(el);
          if (!b.width || s.visibility === 'hidden' || el.closest('[hidden], .sr, .armadilha, .pular, dialog:not([open])')) return false;
          if (el.matches('input[type=checkbox], input[type=radio]') && el.closest('.ficha, .consentimento')) return false;
          // links dentro de texto corrido são exceção aceita pela WCAG 2.5.8
          if (el.tagName === 'A' && el.closest('p, li') && !el.matches('.botao, .link-seta') && b.height >= 18) return false;
          return b.height < 24 || b.width < 24;
        })
        .slice(0, 5)
        .map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].join('.')}(${Math.round(el.getBoundingClientRect().width)}×${Math.round(el.getBoundingClientRect().height)})`);
      return { rolagemHorizontal: doc.scrollWidth > largura, vazando, pequenos, titulo: document.title };
    });
    // Rola a página para disparar imagens com carregamento preguiçoso.
    await pagina.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += innerHeight * 0.8) {
        scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      scrollTo(0, 0);
      const pendentes = [...document.images].filter((i) => !i.complete && i.offsetParent !== null);
      await Promise.race([
        Promise.all(pendentes.map((i) => new Promise((r) => (i.onload = i.onerror = r)))),
        new Promise((r) => setTimeout(r, 4000)),
      ]);
    });
    const arquivo = `${saida}/${nome}${caminho.replace(/\//g, '_') || '_inicio'}.png`;
    await pagina.screenshot({ path: arquivo, fullPage: true });
    const falhas = [];
    if (r.rolagemHorizontal) falhas.push('ROLAGEM HORIZONTAL');
    if (r.vazando.length) falhas.push(`vazando: ${r.vazando.join(', ')}`);
    if (r.pequenos.length) falhas.push(`alvos pequenos: ${r.pequenos.join(', ')}`);
    problemas += falhas.length;
    console.log(`${falhas.length ? '✗' : '✓'} [${nome}] ${caminho} — ${r.titulo}${falhas.length ? '\n    ' + falhas.join('\n    ') : ''}`);
  }
  if (erros.length) {
    problemas += erros.length;
    console.log(`✗ [${nome}] erros de console:\n    ${[...new Set(erros)].join('\n    ')}`);
  }
  await ctx.close();
}

await navegador.close();
console.log(problemas ? `\n${problemas} problema(s).` : '\nSem problemas.');
process.exitCode = problemas ? 1 : 0;
