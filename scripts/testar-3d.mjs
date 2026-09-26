// Testes de interação do visualizador 3D (desktop e celular), falha de carga e
// navegador sem WebGL. Requer o site rodando (npm run preview).
// Uso: node scripts/testar-3d.mjs [urlBase] [pastaSaida]
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
].find((p) => p && existsSync(p));
const argsGpu = ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'];

let falhas = 0;
const ok = (cond, msg) => {
  console.log(`${cond ? '✓' : '✗'} ${msg}`);
  if (!cond) falhas++;
};
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
// "Impressão digital" da câmera: posição projetada de todos os marcadores.
const camera = (p) =>
  p.evaluate(() =>
    [...document.querySelectorAll('.v3d.js[data-estado="ativo"] .v3d__marcadores .v3d__marcador')].map((m) => m.style.transform).join('|'),
  );

// ——— Desktop ———
{
  const nav = await chromium.launch({ executablePath, args: argsGpu });
  const p = await nav.newPage({ viewport: { width: 1440, height: 900 } });
  const erros = [];
  p.on('pageerror', (e) => erros.push(e.message));
  await p.goto(`${base}/projetos/cozinha-em-u`);
  const v = p.locator('#explorar [data-v3d]');
  await v.scrollIntoViewIfNeeded();
  await p.waitForSelector('#explorar [data-v3d][data-estado="ativo"]', { timeout: 60000 });
  ok(true, '[desktop] 3D carrega sozinho ao entrar na tela');
  ok(await v.locator('[data-v3d-dica]').isVisible(), '[desktop] dica de primeiro uso aparece');
  await v.locator('[data-v3d-dica] [data-v3d-acao="ajuda"]').click();
  ok(!(await v.locator('[data-v3d-dica]').isVisible()), '[desktop] dica fecha em "Entendi"');
  await espera(600);
  const visiveis = await v.locator('.v3d__marcadores .v3d__marcador:not(.is-oculto)').count();
  ok(visiveis >= 4, `[desktop] marcadores visíveis na vista inicial: ${visiveis}/5`);
  await p.screenshot({ path: `${saida}/3d-desktop-inicial.png` });

  // Rolagem da página não é capturada pela roda antes de clicar no 3D
  const y0 = await p.evaluate(() => scrollY);
  const caixa = await v.locator('[data-v3d-palco]').boundingBox();
  await p.mouse.move(caixa.x + caixa.width / 2, caixa.y + caixa.height / 2);
  await p.mouse.wheel(0, 300);
  await espera(400);
  ok((await p.evaluate(() => scrollY)) > y0, '[desktop] roda do mouse rola a página enquanto o 3D não foi clicado');
  await v.scrollIntoViewIfNeeded();
  await espera(300);

  // Arrastar gira
  const antes = await camera(p);
  const c2 = await v.locator('[data-v3d-palco]').boundingBox();
  await p.mouse.move(c2.x + c2.width * 0.5, c2.y + c2.height * 0.6);
  await p.mouse.down();
  await p.mouse.move(c2.x + c2.width * 0.3, c2.y + c2.height * 0.55, { steps: 12 });
  await p.mouse.up();
  await espera(900);
  ok((await camera(p)) !== antes, '[desktop] arrastar gira a câmera');

  // Zoom pelos botões
  await v.locator('[data-v3d-acao="aproximar"]').click();
  await espera(1400);
  await p.screenshot({ path: `${saida}/3d-desktop-zoom.png` });

  // Selecionar ponto pela lista
  await v.locator('.v3d__lista [data-v3d-ponto="HOTSPOT_Peninsula"]').click();
  await espera(1600);
  ok(await v.locator('[data-v3d-detalhe="HOTSPOT_Peninsula"]').isVisible(), '[desktop] lista abre o detalhe da península');
  ok((await v.locator('.v3d__lista [data-v3d-ponto="HOTSPOT_Peninsula"]').getAttribute('aria-expanded')) === 'true', '[desktop] aria-expanded atualizado');
  await p.screenshot({ path: `${saida}/3d-desktop-peninsula.png` });

  // Próximo ponto
  await v.locator('[data-v3d-acao="proximo"]').click();
  await espera(1600);
  ok(await v.locator('[data-v3d-detalhe="HOTSPOT_Cuba"]').isVisible(), '[desktop] "próximo" vai para a cuba');
  await p.screenshot({ path: `${saida}/3d-desktop-cuba.png` });

  // Clique num marcador 3D
  const m1 = v.locator('.v3d__marcadores [data-v3d-ponto="HOTSPOT_Bancada"]');
  if (await m1.evaluate((el) => !el.classList.contains('is-oculto'))) {
    await m1.click();
    await espera(1600);
    ok(await v.locator('[data-v3d-detalhe="HOTSPOT_Bancada"]').isVisible(), '[desktop] marcador 3D abre o detalhe da bancada');
    await p.screenshot({ path: `${saida}/3d-desktop-bancada.png` });
  }

  // Toque no vazio fecha o painel sem mover a câmera
  const antesVazio = await camera(p);
  const c3 = await v.locator('[data-v3d-palco]').boundingBox();
  await p.mouse.click(c3.x + 40, c3.y + 40);
  await espera(500);
  ok(!(await v.locator('[data-v3d-painel-detalhe]').isVisible()), '[desktop] clique no vazio fecha o painel');
  ok((await camera(p)) === antesVazio, '[desktop] fechar o painel não move a câmera');

  // Esc e vista inicial
  await v.locator('[data-v3d-acao="inicio"]').click();
  await espera(1600);
  await p.screenshot({ path: `${saida}/3d-desktop-reset.png` });
  ok(true, '[desktop] vista inicial restaurada (ver captura)');

  // Teclado
  await v.locator('[data-v3d-palco]').focus();
  const antesTecla = await camera(p);
  await p.keyboard.press('ArrowLeft');
  await p.keyboard.press('ArrowLeft');
  await espera(300);
  ok((await camera(p)) !== antesTecla, '[desktop] setas do teclado giram');

  // Tela cheia no desktop
  await v.locator('[data-v3d-acao="tela-cheia"]').click();
  await espera(800);
  ok(await v.evaluate((el) => el.classList.contains('is-imersivo')), '[desktop] tela cheia abre');
  await p.screenshot({ path: `${saida}/3d-desktop-tela-cheia.png` });
  await p.keyboard.press('Escape');
  await espera(400);
  ok(!(await v.evaluate((el) => el.classList.contains('is-imersivo'))), '[desktop] Esc fecha a tela cheia');

  ok(erros.length === 0, `[desktop] sem erros de JS ${erros.join(' | ')}`);
  await nav.close();
}

// ——— Celular ———
{
  const nav = await chromium.launch({ executablePath, args: argsGpu });
  const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  const erros = [];
  p.on('pageerror', (e) => erros.push(e.message));
  let pedidosModelo = 0;
  p.on('request', (r) => r.url().includes('/modelos/') && pedidosModelo++);
  await p.goto(`${base}/`);
  await espera(1500);
  ok(pedidosModelo === 0, '[celular] a página inicial não baixa o modelo sozinha');
  await p.goto(`${base}/projetos/cozinha-em-u`);
  await espera(1500);
  ok(pedidosModelo === 0, '[celular] a página da cozinha não baixa o modelo sem o toque em "Explorar em 3D"');
  const v = p.locator('[data-v3d]').first();
  await v.scrollIntoViewIfNeeded();
  await v.locator('[data-v3d-acao="iniciar"]').tap();
  await p.waitForSelector('[data-v3d][data-estado="ativo"]', { timeout: 60000 });
  ok(await v.evaluate((el) => el.classList.contains('is-imersivo')), '[celular] "Explorar em 3D" abre em tela cheia');
  ok(await p.evaluate(() => document.documentElement.classList.contains('trava-rolagem')), '[celular] rolagem da página travada na tela cheia');
  await p.screenshot({ path: `${saida}/3d-celular-inicial.png` });
  await v.locator('[data-v3d-dica] [data-v3d-acao="ajuda"]').tap();
  await v.locator('.v3d__lista [data-v3d-ponto="HOTSPOT_Iluminacao"]').tap();
  await espera(1600);
  ok(await v.locator('[data-v3d-detalhe="HOTSPOT_Iluminacao"]').isVisible(), '[celular] ficha abre o painel inferior');
  await p.screenshot({ path: `${saida}/3d-celular-led.png` });
  await v.locator('[data-v3d-acao="fechar-detalhe"]').tap();
  await espera(300);
  await p.screenshot({ path: `${saida}/3d-celular-sem-painel.png` });
  await v.locator('[data-v3d-acao="fechar"]').tap();
  await espera(600);
  ok(!(await v.evaluate((el) => el.classList.contains('is-imersivo'))), '[celular] "Fechar 3D" sai da tela cheia');
  ok(!(await p.evaluate(() => document.documentElement.classList.contains('trava-rolagem'))), '[celular] rolagem da página liberada');
  const y0 = await p.evaluate(() => scrollY);
  await p.evaluate(() => scrollBy(0, 400));
  ok((await p.evaluate(() => scrollY)) > y0, '[celular] página volta a rolar normalmente');
  // Botão voltar do sistema fecha a tela cheia
  await v.scrollIntoViewIfNeeded();
  await v.locator('[data-v3d-acao="iniciar"]').tap();
  await espera(500);
  await p.goBack();
  await espera(500);
  ok(!(await v.evaluate((el) => el.classList.contains('is-imersivo'))) && p.url().endsWith('/cozinha-em-u'), '[celular] "voltar" do sistema fecha a tela cheia sem sair da página');
  ok(erros.length === 0, `[celular] sem erros de JS ${erros.join(' | ')}`);
  await nav.close();
}

// ——— Falha ao carregar o modelo ———
{
  const nav = await chromium.launch({ executablePath, args: argsGpu });
  const p = await nav.newPage({ viewport: { width: 1280, height: 800 } });
  await p.route('**/modelos/*.glb', (r) => r.abort());
  await p.goto(`${base}/projetos/cozinha-em-u`);
  await p.locator('#explorar').scrollIntoViewIfNeeded();
  await p.waitForSelector('#explorar [data-v3d][data-estado="erro"]', { timeout: 30000 });
  ok(true, '[falha] modelo indisponível mostra estado de erro');
  ok(await p.locator('#explorar .v3d__poster img').isVisible(), '[falha] imagem continua visível');
  await p.locator('#explorar .v3d__lista [data-v3d-ponto="HOTSPOT_Bancada"]').click();
  ok(await p.locator('#explorar [data-v3d-detalhe="HOTSPOT_Bancada"]').isVisible(), '[falha] pontos continuam funcionando sem o 3D');
  await p.screenshot({ path: `${saida}/3d-falha.png` });
  await p.unroute('**/modelos/*.glb');
  await p.locator('#explorar [data-v3d-acao="tentar"]').click();
  await p.waitForSelector('#explorar [data-v3d][data-estado="ativo"]', { timeout: 60000 });
  ok(true, '[falha] "Tentar de novo" carrega o 3D');
  await nav.close();
}

// ——— Sem WebGL ———
{
  const nav = await chromium.launch({ executablePath, args: ['--disable-3d-apis', '--disable-gpu'] });
  const p = await nav.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await p.goto(`${base}/projetos/cozinha-em-u`);
  await p.locator('#explorar [data-v3d-acao="iniciar"]').tap();
  await p.waitForSelector('#explorar [data-v3d][data-estado="erro"]', { timeout: 20000 });
  ok(true, '[sem WebGL] mensagem clara em vez de tela vazia');
  await p.locator('#explorar [data-v3d-acao="fechar"]').tap().catch(() => {});
  await p.screenshot({ path: `${saida}/3d-sem-webgl.png` });
  await nav.close();
}

console.log(falhas ? `\n${falhas} falha(s).` : '\nTodos os testes do 3D passaram.');
process.exitCode = falhas ? 1 : 0;
