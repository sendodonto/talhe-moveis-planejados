// Formulário de orçamento.
// Canais (definidos em src/config/empresa.ts):
//  • endpoint → POST JSON; confirmação SÓ com resposta 2xx do serviço;
//  • whatsapp → abre o WhatsApp com a mensagem pronta (o envio é do visitante);
//  • email    → abre o aplicativo de e-mail com a mensagem pronta;
//  • nenhum   → monta a mensagem para copiar. Nunca simula envio.

const REFERENCIAS: Record<string, string> = {
  'cozinha-em-u': 'Vi a cozinha em U (grafite, madeira e granito) em 3D no site e quero algo parecido.',
};

export function iniciarFormulario(form: HTMLFormElement) {
  const d = form.dataset;
  const retorno = form.querySelector<HTMLElement>('[data-retorno]')!;
  const resumo = form.querySelector<HTMLElement>('[data-resumo-erros]')!;
  const botao = form.querySelector<HTMLButtonElement>('[data-enviar]')!;
  const rotulo = botao.querySelector<HTMLElement>('[data-rotulo]')!;
  const rotuloOriginal = rotulo.textContent!;

  // ——— Pré-preenchimento pela URL (?ambiente=cozinha&referencia=cozinha-em-u) ———
  const params = new URLSearchParams(location.search);
  const ambiente = params.get('ambiente');
  if (ambiente) {
    const cb = form.querySelector<HTMLInputElement>(`input[name="ambientes"][data-id="${CSS.escape(ambiente)}"]`);
    if (cb) cb.checked = true;
  }
  const ref = params.get('referencia');
  if (ref && REFERENCIAS[ref]) {
    (form.elements.namedItem('referencia') as HTMLInputElement).value = ref;
    const msg = form.elements.namedItem('mensagem') as HTMLTextAreaElement;
    if (!msg.value) msg.value = REFERENCIAS[ref] + '\n\n';
  }

  // ——— Validação ———
  type Erro = { campo: HTMLElement; foco: HTMLElement; texto: string };
  const el = <T extends Element>(n: string) => form.elements.namedItem(n) as unknown as T;

  function validar(): Erro[] {
    const erros: Erro[] = [];
    const ambientes = [...form.querySelectorAll<HTMLInputElement>('input[name="ambientes"]')];
    if (!ambientes.some((c) => c.checked))
      erros.push({ campo: form.querySelector('[data-campo="ambientes"]')!, foco: ambientes[0], texto: 'Marque pelo menos um ambiente.' });
    const nome = el<HTMLInputElement>('nome');
    if (nome.value.trim().length < 2) erros.push({ campo: nome, foco: nome, texto: 'Informe seu nome.' });
    const tel = el<HTMLInputElement>('telefone');
    const digitos = tel.value.replace(/\D/g, '');
    if (digitos.length < 10 || digitos.length > 13)
      erros.push({ campo: tel, foco: tel, texto: 'Informe um telefone com DDD, por exemplo (11) 90000-0000.' });
    const email = el<HTMLInputElement>('email');
    if (email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim()))
      erros.push({ campo: email, foco: email, texto: 'Confira o e-mail, ou deixe em branco.' });
    const cidade = el<HTMLInputElement>('cidade');
    if (cidade.value.trim().length < 2) erros.push({ campo: cidade, foco: cidade, texto: 'Informe a cidade.' });
    const ok = el<HTMLInputElement>('consentimento');
    if (!ok.checked) erros.push({ campo: form.querySelector('[data-campo="consentimento"]')!, foco: ok, texto: 'É preciso autorizar o uso dos dados para responder.' });
    return erros;
  }

  function limparErros() {
    form.querySelectorAll('[aria-invalid]').forEach((x) => x.removeAttribute('aria-invalid'));
    form.querySelectorAll<HTMLElement>('[data-erro]').forEach((x) => (x.textContent = ''));
    resumo.hidden = true;
    resumo.innerHTML = '';
  }

  function mostrarErros(erros: Erro[]) {
    for (const e of erros) {
      e.campo.setAttribute('aria-invalid', 'true');
      if (e.foco !== e.campo) e.foco.setAttribute('aria-invalid', 'true');
      const alvo = e.campo.closest('.campo')?.querySelector<HTMLElement>('[data-erro]') ?? e.campo.querySelector<HTMLElement>('[data-erro]');
      if (alvo) alvo.textContent = e.texto;
    }
    if (erros.length > 1) {
      resumo.hidden = false;
      resumo.innerHTML = `Faltam ${erros.length} informações:<ul>${erros
        .map((e) => `<li><a href="#${e.foco.id || ''}" data-ir="${(e.foco as HTMLInputElement).name}">${e.texto}</a></li>`)
        .join('')}</ul>`;
      resumo.focus();
    } else {
      erros[0].foco.focus();
    }
  }
  resumo.addEventListener('click', (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('[data-ir]');
    if (!a) return;
    e.preventDefault();
    (form.querySelector(`[name="${a.dataset.ir}"]`) as HTMLElement)?.focus();
  });
  // Erro some quando o campo é corrigido
  form.addEventListener('input', (e) => {
    const t = e.target as HTMLElement;
    const campo = t.closest('.campo');
    if (!campo) return;
    campo.querySelectorAll('[aria-invalid]').forEach((x) => x.removeAttribute('aria-invalid'));
    campo.removeAttribute('aria-invalid');
    const erro = campo.querySelector<HTMLElement>('[data-erro]');
    if (erro) erro.textContent = '';
  });

  // ——— Dados e mensagem ———
  function coletar() {
    const f = new FormData(form);
    return {
      ambientes: f.getAll('ambientes').join(', '),
      nome: String(f.get('nome') ?? '').trim(),
      telefone: String(f.get('telefone') ?? '').trim(),
      email: String(f.get('email') ?? '').trim(),
      cidade: String(f.get('cidade') ?? '').trim(),
      fase: String(f.get('fase') ?? ''),
      mensagem: String(f.get('mensagem') ?? '').trim(),
      retorno: String(f.get('retorno') ?? ''),
      referencia: String(f.get('referencia') ?? ''),
    };
  }
  function texto(v: ReturnType<typeof coletar>) {
    return [
      `Olá! Quero um orçamento de móveis planejados.`,
      ``,
      `Ambientes: ${v.ambientes}`,
      `Nome: ${v.nome}`,
      `Telefone: ${v.telefone}`,
      v.email ? `E-mail: ${v.email}` : null,
      `Cidade: ${v.cidade}`,
      v.fase ? `Momento da obra: ${v.fase}` : null,
      `Prefiro retorno por: ${v.retorno}`,
      v.mensagem && `\n${v.mensagem}`,
    ]
      .filter((x) => x !== null)
      .join('\n');
  }

  function mostrarRetorno(html: string) {
    retorno.hidden = false;
    retorno.innerHTML = html;
    retorno.focus();
  }
  const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

  function alternativas() {
    const links: string[] = [];
    if (d.whatsapp) links.push(`<a class="botao botao--whats" href="https://wa.me/${d.whatsapp}?text=${encodeURIComponent(texto(coletar()))}" target="_blank" rel="noopener">Enviar pelo WhatsApp</a>`);
    if (d.email) links.push(`<a class="botao botao--linha" href="mailto:${d.email}?subject=${encodeURIComponent('Pedido de orçamento')}&body=${encodeURIComponent(texto(coletar()))}">Enviar por e-mail</a>`);
    return links.length ? `<div class="acoes">${links.join('')}</div>` : '';
  }

  function blocoCopiar(msg: string, intro: string) {
    mostrarRetorno(
      `<p>${intro}</p><pre data-texto>${esc(msg)}</pre><div class="acoes"><button type="button" class="botao" data-copiar>Copiar mensagem</button></div>`,
    );
    retorno.querySelector('[data-copiar]')!.addEventListener('click', async (e) => {
      const b = e.currentTarget as HTMLButtonElement;
      try {
        await navigator.clipboard.writeText(msg);
        b.textContent = 'Mensagem copiada';
      } catch {
        const sel = getSelection();
        const r = document.createRange();
        r.selectNodeContents(retorno.querySelector('[data-texto]')!);
        sel?.removeAllRanges();
        sel?.addRange(r);
        b.textContent = 'Texto selecionado — copie com Ctrl+C';
      }
    });
  }

  // ——— Envio ———
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    limparErros();
    retorno.hidden = true;
    const erros = validar();
    if (erros.length) {
      mostrarErros(erros);
      return;
    }
    // Armadilha anti-spam preenchida: ignora silenciosamente.
    if ((form.elements.namedItem('site') as HTMLInputElement).value) return;

    const v = coletar();
    const msg = texto(v);
    const canal = d.canal as 'endpoint' | 'whatsapp' | 'email' | 'nenhum';

    if (canal === 'whatsapp') {
      const url = `https://wa.me/${d.whatsapp}?text=${encodeURIComponent(msg)}`;
      const janela = window.open(url, '_blank', 'noopener');
      mostrarRetorno(
        `<p><strong>Sua mensagem está pronta no WhatsApp.</strong> Confira e toque em enviar por lá.</p><p class="t-nota">${
          janela ? 'Se o WhatsApp não abriu, ' : 'O navegador bloqueou a nova janela: '
        }<a href="${url}" target="_blank" rel="noopener">abra por este link</a>.</p>`,
      );
      return;
    }
    if (canal === 'email') {
      location.href = `mailto:${d.email}?subject=${encodeURIComponent(`Pedido de orçamento — ${v.nome}`)}&body=${encodeURIComponent(msg)}`;
      mostrarRetorno(`<p><strong>Abrimos seu aplicativo de e-mail com a mensagem pronta.</strong> O pedido é enviado quando você confirmar por lá.</p>`);
      return;
    }
    if (canal === 'nenhum') {
      blocoCopiar(msg, '<strong>O envio on-line ainda não está ativo.</strong> Sua mensagem está pronta abaixo para copiar e enviar pelo canal que preferir.');
      return;
    }

    // Endpoint configurado: só confirma com resposta de sucesso do serviço.
    botao.setAttribute('aria-busy', 'true');
    rotulo.textContent = 'Enviando…';
    try {
      const extras = JSON.parse(d.extras || '{}');
      const resp = await fetch(d.endpoint!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          ...extras,
          subject: `Pedido de orçamento — ${v.nome} (${v.cidade})`,
          from_name: d.empresa,
          ...v,
          _replyto: v.email || undefined,
          pagina: location.href,
        }),
      });
      let corpo: { success?: boolean } | null = null;
      try {
        corpo = await resp.clone().json();
      } catch {}
      if (!resp.ok || corpo?.success === false) throw new Error(`HTTP ${resp.status}`);
      form.reset();
      form.querySelectorAll('.campo, fieldset, .campo-duplo, [data-aviso-canal], .t-nota, [data-enviar]').forEach((x) => ((x as HTMLElement).hidden = true));
      mostrarRetorno(
        `<p class="t-sub">Pedido enviado.</p><p>Obrigado, ${esc(v.nome.split(' ')[0])}. Vamos responder por ${esc(v.retorno.toLowerCase())} no contato informado.</p>`,
      );
    } catch (err) {
      console.error(err);
      mostrarRetorno(
        `<p><strong>Não conseguimos enviar agora.</strong> Seus dados continuam no formulário: tente de novo em instantes${
          d.whatsapp || d.email ? ' ou use uma das opções abaixo' : ''
        }.</p>${alternativas()}`,
      );
    } finally {
      botao.removeAttribute('aria-busy');
      rotulo.textContent = rotuloOriginal;
    }
  });
}
