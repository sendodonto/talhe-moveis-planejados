// Mede fluidez do 3D: arrasta por ~3 s e registra o intervalo entre quadros.
// Uso: node scripts/medir-3d.mjs [urlBase] [largura] [altura]
import { chromium } from 'playwright-core';
import { existsSync } from 'node:fs';
const base = process.argv[2] ?? 'http://127.0.0.1:4321';
const w = +(process.argv[3] ?? 1440), h = +(process.argv[4] ?? 900);
const executablePath = [process.env.NAVEGADOR, 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome'].find((p) => p && existsSync(p));
const nav = await chromium.launch({ executablePath, headless: false, args: process.env.SW ? ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--window-position=-2400,0'] : ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist', '--window-position=-2400,0'] });
const p = await nav.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: +(process.env.DPR ?? 1) });
await p.goto(`${base}/projetos/${process.env.SLUG ?? 'cozinha-em-u'}`);
await p.locator('#explorar').scrollIntoViewIfNeeded();
await p.waitForSelector('#explorar [data-estado="ativo"]', { timeout: 60000 });
await p.waitForTimeout(1500);
const dica = p.locator('[data-v3d-dica] [data-v3d-acao="ajuda"]');
if (await dica.isVisible()) await dica.click();
const c = await p.locator('#explorar [data-v3d-canvas]').boundingBox();
await p.evaluate(() => {
  window.__q = [];
  let t0 = performance.now();
  const f = (t) => { window.__q.push(t - t0); t0 = t; if (window.__q.length < 400) requestAnimationFrame(f); };
  requestAnimationFrame(f);
});
await p.mouse.move(c.x + c.width * 0.3, c.y + c.height * 0.5);
await p.mouse.down();
for (let i = 0; i < 180; i++) await p.mouse.move(c.x + c.width * (0.3 + 0.3 * Math.sin(i / 20)), c.y + c.height * (0.5 + 0.1 * Math.cos(i / 25)));
await p.mouse.up();
const q = await p.evaluate(() => window.__q.slice(5));
q.sort((a, b) => a - b);
const med = q[Math.floor(q.length / 2)], p95 = q[Math.floor(q.length * 0.95)];
const info = await p.evaluate(() => { const c = document.querySelector('#explorar canvas'); return `${c.width}x${c.height}`; });
console.log(`canvas ${info} · quadros ${q.length} · mediana ${med.toFixed(1)} ms · p95 ${p95.toFixed(1)} ms · ~${(1000 / med).toFixed(0)} fps`);
await nav.close();
