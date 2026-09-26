// Testes do formulário de orçamento: validação, pré-preenchimento e cada canal de envio.
// O serviço de formulário é simulado pelo navegador de teste (nenhum dado sai da máquina).
// Uso: node scripts/testar-formulario.mjs [urlBase]
import { chromium } from 'playwright-core';
import { existsSync } from 'node:fs';

const base = process.argv[2] ?? 'http://127.0.0.1:4321';
const executablePath = [process.env.NAVEGADOR, 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Google/Chrome/Application/chrome.exe', '/usr/bin/google-chrome'].find((p) => p && existsSync(p));
let falhas = 0;
const ok = (c, m) => {
  console.log(`${c ? '✓' : '✗'} ${m}`);
  if (!c) falhas++;
};
const nav = await chromium.launch({ executablePath });
const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

async function preencher(p) {
  await p.getByLabel('Seu nome').fill('Maria Teste');
  await p.getByLabel('WhatsApp ou telefone').fill('(11) 98888-7777');
  await p.getByLabel('Cidade e bairro').fill('São Paulo, Pinheiros');
  await p.locator('input[name="consentimento"]').check();
}

// Pré-preenchimento e validação
{
  const p = await ctx.newPage();
  await p.goto(`${base}/orcamento?ambiente=cozinha&referencia=cozinha-em-u`);
  ok(await p.locator('input[data-id="cozinha"]').isChecked(), 'ambiente vem marcado pela URL');
  ok((await p.getByLabel('O que você precisa?').inputValue()).includes('cozinha em U'), 'referência da cozinha 3D entra na mensagem');
  await p.locator('input[data-id="cozinha"]').uncheck();
  await p.locator('[data-enviar]').click();
  ok(await p.locator('[data-resumo-erros]').isVisible(), 'enviar vazio mostra resumo de erros');
  ok((await p.locator('[aria-invalid="true"]').count()) >= 4, 'campos inválidos marcados com aria-invalid');
  ok(await p.evaluate(() => document.activeElement?.matches('[data-resumo-erros]')), 'foco vai para o resumo de erros');
  await p.getByLabel('WhatsApp ou telefone').fill('123');
  await p.locator('[data-enviar]').click();
  ok((await p.locator('#erro-telefone').textContent()).includes('DDD'), 'telefone curto é recusado com orientação');
  ok(await p.locator('[data-retorno]').isHidden(), 'nenhuma confirmação com dados inválidos');
  await p.close();
}

// Sem canal configurado (estado atual): monta a mensagem, sem "enviado"
{
  const p = await ctx.newPage();
  await p.goto(`${base}/orcamento?ambiente=closet`);
  await preencher(p);
  await p.locator('[data-enviar]').click();
  const t = await p.locator('[data-retorno]').textContent();
  ok(t.includes('ainda não está ativo') && !/enviado/i.test(t), 'sem canal: explica e não simula envio');
  ok((await p.locator('[data-retorno] pre').textContent()).includes('Closets'), 'mensagem montada com os dados');
  await p.close();
}

const canal = (p, dados) => p.evaluate((x) => Object.assign(document.querySelector('[data-form]').dataset, x), dados);

// Endpoint com sucesso (serviço simulado)
{
  const p = await ctx.newPage();
  let corpo = null;
  await p.route('https://servico.teste/**', async (r) => {
    corpo = JSON.parse(r.request().postData());
    await r.fulfill({ status: 200, contentType: 'application/json', body: '{"success":true}' });
  });
  await p.goto(`${base}/orcamento?ambiente=dormitorio`);
  await canal(p, { canal: 'endpoint', endpoint: 'https://servico.teste/f', extras: '{"access_key":"CHAVE"}' });
  await preencher(p);
  await p.locator('[data-enviar]').click();
  await p.locator('[data-retorno]').waitFor();
  ok((await p.locator('[data-retorno]').textContent()).includes('Pedido enviado'), 'endpoint 2xx: confirma o envio');
  ok(corpo?.access_key === 'CHAVE' && corpo?.ambientes === 'Dormitórios' && corpo?.nome === 'Maria Teste', 'dados e campos extras chegam ao serviço');
  await p.close();
}

// Endpoint com erro: não confirma, mantém os dados
{
  const p = await ctx.newPage();
  await p.route('https://servico.teste/**', (r) => r.fulfill({ status: 500, body: 'erro' }));
  await p.goto(`${base}/orcamento?ambiente=sala`);
  await canal(p, { canal: 'endpoint', endpoint: 'https://servico.teste/f', extras: '{}', whatsapp: '5511900000000' });
  await preencher(p);
  await p.locator('[data-enviar]').click();
  await p.locator('[data-retorno]').waitFor();
  const t = await p.locator('[data-retorno]').textContent();
  ok(t.includes('Não conseguimos enviar') && !t.includes('Pedido enviado'), 'endpoint com erro: não simula sucesso');
  ok((await p.getByLabel('Seu nome').inputValue()) === 'Maria Teste', 'dados preservados após erro');
  ok(await p.locator('[data-retorno] a[href^="https://wa.me/5511900000000"]').isVisible(), 'oferece WhatsApp como alternativa');
  await p.close();
}

// WhatsApp: abre wa.me com a mensagem, sem dizer que foi enviado
{
  const p = await ctx.newPage();
  await p.goto(`${base}/orcamento?ambiente=banheiro`);
  await canal(p, { canal: 'whatsapp', whatsapp: '5511900000000' });
  await p.evaluate(() => {
    window.__aberto = null;
    window.open = (u) => ((window.__aberto = u), {});
  });
  await preencher(p);
  await p.locator('[data-enviar]').click();
  const url = await p.evaluate(() => window.__aberto);
  ok(url?.startsWith('https://wa.me/5511900000000?text=') && decodeURIComponent(url).includes('Banheiros e lavabos'), 'WhatsApp abre com número e mensagem');
  const t = await p.locator('[data-retorno]').textContent();
  ok(t.includes('pronta no WhatsApp') && !/Pedido enviado/.test(t), 'WhatsApp: não afirma envio');
  await p.close();
}

await nav.close();
console.log(falhas ? `\n${falhas} falha(s).` : '\nTodos os testes do formulário passaram.');
process.exitCode = falhas ? 1 : 0;
