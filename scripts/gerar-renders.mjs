// Gera as imagens estáticas da cozinha a partir do GLB otimizado, com a mesma
// iluminação do visualizador 3D. Também grava a projeção real dos hotspots
// em cada vista (usada pela versão sem WebGL).
//
// Uso: npm run renders            → todas as vistas de src/data/vistas-render.json
//      npm run renders -- heroi   → só as vistas cujo id contém "heroi"
import { createServer } from 'vite';
import { chromium } from 'playwright-core';
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';

const filtro = process.argv[2];
const todas = JSON.parse(readFileSync('src/data/vistas-render.json', 'utf8'));
const vistas = todas.filter((v) => !filtro || v.id.includes(filtro));
const destino = 'src/assets/renders';
mkdirSync(destino, { recursive: true });

const navegadores = [
  process.env.NAVEGADOR,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);
const executablePath = navegadores.find((p) => existsSync(p));
if (!executablePath) throw new Error('Defina NAVEGADOR com o caminho de um Chrome/Edge.');

const servidor = await createServer({ root: '.', logLevel: 'error', server: { port: 5179 } });
await servidor.listen();
const navegador = await chromium.launch({
  executablePath,
  args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'],
});
const pagina = await navegador.newPage();
pagina.on('console', (m) => m.type() === 'error' && console.error('[página]', m.text()));
await pagina.goto('http://localhost:5179/scripts/estudio/index.html');
await pagina.waitForFunction(() => window.estudioPronto, null, { timeout: 120000 });
await pagina.evaluate(() => window.estudioPronto);

const projecoesPath = 'src/data/hotspots-projetados.json';
const projecoes = existsSync(projecoesPath) ? JSON.parse(readFileSync(projecoesPath, 'utf8')) : {};

for (const v of vistas) {
  await pagina.setViewportSize({ width: v.w, height: v.h });
  const { hotspots } = await pagina.evaluate((vista) => window.renderizar(vista), v);
  const dataUrl = await pagina.evaluate(() => document.querySelector('canvas').toDataURL('image/png'));
  const png = Buffer.from(dataUrl.split(',')[1], 'base64');
  // O canvas é renderizado em 2x; a redução com lanczos funciona como supersampling.
  let img = sharp(png).resize(v.w, null, { kernel: 'lanczos3' });
  let caixa = { x: 0, y: 0, w: v.w, h: v.h };
  if (v.recortar) {
    // Recorta pela área ocupada pelo modelo (fundo transparente) com margem.
    const reduzida = await img.png().toBuffer();
    const { info } = await sharp(reduzida).trim({ threshold: 1 }).toBuffer({ resolveWithObject: true });
    const m = Math.round(Math.max(info.width, info.height) * v.recortar);
    const x = Math.max(0, -info.trimOffsetLeft - m), y = Math.max(0, -info.trimOffsetTop - m);
    caixa = { x, y, w: Math.min(v.w - x, info.width + 2 * m), h: Math.min(v.h - y, info.height + 2 * m) };
    img = sharp(reduzida).extract({ left: caixa.x, top: caixa.y, width: caixa.w, height: caixa.h });
  }
  await img.png().toFile(`${destino}/${v.id}.png`);
  projecoes[v.id] = {
    largura: caixa.w,
    altura: caixa.h,
    hotspots: hotspots.map(({ no, x, y, visivel }) => ({
      no,
      x: +((x * v.w - caixa.x) / caixa.w).toFixed(4),
      y: +((y * v.h - caixa.y) / caixa.h).toFixed(4),
      visivel,
    })),
  };
  console.log(`✓ ${v.id} (${v.w}×${v.h}) · hotspots visíveis: ${hotspots.filter((h) => h.visivel).map((h) => h.no.replace('HOTSPOT_', '')).join(', ')}`);
}
for (const id of Object.keys(projecoes)) if (!todas.some((v) => v.id === id)) delete projecoes[id];
writeFileSync(projecoesPath, JSON.stringify(projecoes, null, 2));

await navegador.close();
await servidor.close();
