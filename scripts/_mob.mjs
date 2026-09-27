import { chromium } from 'playwright-core';
const S = process.argv[2]; const esp = (ms) => new Promise((r) => setTimeout(r, ms));
const nav = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] });
for (const s of ['cozinha-em-u', 'closet-nogueira', 'sala-carvalho']) {
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  await p.goto(`http://127.0.0.1:4321/projetos/${s}`);
  await p.locator('#explorar [data-v3d-acao="iniciar"]').tap();
  await p.waitForSelector('#explorar [data-estado="ativo"]', { timeout: 60000 }); await esp(1500);
  const d = p.locator('[data-v3d-dica] [data-v3d-acao="ajuda"]'); if (await d.isVisible()) await d.tap();
  await esp(600);
  const info = await p.evaluate(() => { const c = document.querySelector('#explorar canvas'); return `${c.width}x${c.height}`; });
  await p.screenshot({ path: `${S}/${s}.png` });
  console.log(s, info);
  await ctx.close();
}
await nav.close();
