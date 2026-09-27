// Interface do visualizador: lista de pontos, painel de detalhes, tela cheia,
// estados de carregamento/erro. Não importa o three.js — o motor 3D é baixado
// só quando o visitante pede (ou, no desktop, quando o visualizador aparece).
import type { Motor, PosicaoMarcador } from './motor';
import type { Qualidade } from './cena';
import type { Orbita } from './camera';
import type { ConfigModelo } from './modelos';

interface Dados {
  modelo: string;
  config: ConfigModelo;
  pontos: { no: string; numero: number; titulo: string; animacao?: string; vista: Omit<Orbita, 'alvo'> }[];
}

const reduzirMovimento = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const telaPequena = () => matchMedia('(max-width: 899px), (pointer: coarse)').matches;

function detectarQualidade(): Qualidade {
  // ?qualidade=baixa|media|alta força o nível (útil para testar)
  const forcada = new URLSearchParams(location.search).get('qualidade');
  if (forcada === 'baixa' || forcada === 'media' || forcada === 'alta') return forcada;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const memoria = nav.deviceMemory ?? 8;
  const nucleos = nav.hardwareConcurrency ?? 8;
  if (nav.connection?.saveData || memoria <= 3 || nucleos <= 4) return 'baixa';
  if (matchMedia('(pointer: coarse)').matches || memoria <= 4) return 'media';
  return 'alta';
}

function suportaWebGL2(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!c.getContext('webgl2');
  } catch {
    return false;
  }
}

export function iniciarVisualizador(raiz: HTMLElement) {
  const dados: Dados = JSON.parse(raiz.querySelector<HTMLScriptElement>('[data-v3d-dados]')!.textContent!);
  const $ = <T extends Element = HTMLElement>(s: string) => raiz.querySelector<T>(s)!;
  const $$ = <T extends Element = HTMLElement>(s: string) => [...raiz.querySelectorAll<T>(s)];

  const palco = $('[data-v3d-palco]');
  const alvoCanvas = $('[data-v3d-canvas]');
  const camadaMarcadores = $('[data-v3d-marcadores]');
  const status = $('[data-v3d-status]');
  const progresso = $('[data-v3d-progresso]');
  const dica = $('[data-v3d-dica]');
  const painelDetalhe = $('[data-v3d-painel-detalhe]');
  const desktop = matchMedia('(min-width: 1024px)');

  // Diz ao motor que parte do quadro a interface cobre, para a câmera centralizar
  // a cozinha na área livre e esconder marcadores que cairiam sob painel ou botões.
  function atualizarMargens() {
    if (!motor) return;
    if (desktop.matches && !imersivo) motor.definirMargens({ direita: 0, topo: 72, base: 84 });
    else if (desktop.matches) motor.definirMargens({ direita: 0, topo: 0, base: 76 });
    else motor.definirMargens({ direita: 0, topo: imersivo ? 76 : 0, base: imersivo ? 28 : 0 });
  }
  addEventListener('resize', () => requestAnimationFrame(atualizarMargens));

  let motor: Motor | null = null;
  let carregando: Promise<void> | null = null;
  let ativo: string | null = null;
  let imersivo = false;
  let estadoHistorico = false;

  const setEstado = (e: 'ocioso' | 'carregando' | 'ativo' | 'erro') => {
    raiz.dataset.estado = e;
  };
  const anunciar = (t: string) => {
    status.textContent = t;
  };

  // ——— Marcadores vivos (um botão por ponto, posicionado pelo motor) ———
  const marcadores = new Map<string, HTMLButtonElement>();
  for (const p of dados.pontos) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'v3d__marcador';
    b.dataset.v3dPonto = p.no;
    b.setAttribute('aria-label', `${p.numero}. ${p.titulo}`);
    b.innerHTML = `<span aria-hidden="true">${p.numero}</span>`;
    b.tabIndex = -1; // a lista acessível é o caminho de teclado; o marcador é o atalho visual
    camadaMarcadores.appendChild(b);
    marcadores.set(p.no, b);
  }
  const moverMarcadores = (lista: PosicaoMarcador[]) => {
    for (const m of lista) {
      const el = marcadores.get(m.no);
      if (!el) continue;
      el.style.transform = `translate3d(${m.x.toFixed(1)}px, ${m.y.toFixed(1)}px, 0)`;
      el.classList.toggle('is-oculto', !m.visivel);
    }
  };

  // ——— Seleção de pontos (funciona com ou sem 3D) ———
  function selecionar(no: string | null, { mover = true } = {}) {
    ativo = no;
    raiz.classList.toggle('tem-selecao', !!no);
    for (const el of $$('[data-v3d-detalhe]')) el.hidden = el.dataset.v3dDetalhe !== no;
    for (const el of $$<HTMLElement>('[data-v3d-ponto]')) {
      const sel = el.dataset.v3dPonto === no;
      el.classList.toggle('is-ativo', sel);
      if (el.hasAttribute('aria-expanded')) el.setAttribute('aria-expanded', String(sel));
    }
    painelDetalhe.hidden = !no;
    if (no && mover && motor) motor.focar(no);
    // Porta ou gaveta ligada ao ponto abre; ao sair do ponto, fecha.
    motor?.animar(dados.pontos.find((p) => p.no === no)?.animacao ?? null);
  }
  const indiceAtivo = () => dados.pontos.findIndex((p) => p.no === ativo);
  const passo = (d: number) => {
    const i = indiceAtivo();
    const n = dados.pontos.length;
    selecionar(dados.pontos[((i < 0 ? 0 : i + d) + n) % n].no);
  };

  raiz.addEventListener('click', (e) => {
    const alvo = e.target as HTMLElement;
    const ponto = alvo.closest<HTMLElement>('[data-v3d-ponto]');
    if (ponto) {
      const no = ponto.dataset.v3dPonto!;
      selecionar(ativo === no && !ponto.classList.contains('v3d__marcador') ? null : no);
      return;
    }
    const acao = alvo.closest<HTMLElement>('[data-v3d-acao]')?.dataset.v3dAcao;
    if (!acao) return;
    switch (acao) {
      case 'iniciar':
        abrir();
        break;
      case 'tentar':
        carregando = null;
        abrir();
        break;
      case 'fechar-detalhe':
        selecionar(null);
        break;
      case 'anterior':
        passo(-1);
        break;
      case 'proximo':
        passo(1);
        break;
      case 'inicio':
        selecionar(null);
        motor?.vistaInicial();
        break;
      case 'aproximar':
        motor?.aproximar(0.75);
        break;
      case 'afastar':
        motor?.aproximar(1.33);
        break;
      case 'ajuda':
        mostrarDica(dica.hidden === true);
        break;
      case 'tela-cheia':
        imersivo ? sairImersivo() : entrarImersivo();
        break;
      case 'fechar':
        sairImersivo();
        break;
    }
  });

  // ——— Dica de uso ———
  const CHAVE_DICA = 'talhe:dica3d';
  function mostrarDica(sim: boolean) {
    dica.hidden = !sim;
    if (!sim) {
      try {
        localStorage.setItem(CHAVE_DICA, '1');
      } catch {}
    }
  }
  const dicaJaVista = () => {
    try {
      return localStorage.getItem(CHAVE_DICA) === '1';
    } catch {
      return false;
    }
  };

  // ——— Tela cheia (padrão no celular: sem disputa de gestos com a rolagem) ———
  function entrarImersivo() {
    if (imersivo) return;
    imersivo = true;
    raiz.classList.add('is-imersivo');
    document.documentElement.classList.add('trava-rolagem');
    history.pushState({ v3d: true }, '');
    estadoHistorico = true;
    motor?.permitirRoda(true);
    motor?.pausar(false);
    requestAnimationFrame(() => {
      atualizarMargens();
      $('[data-v3d-acao="fechar"]').focus();
    });
  }
  function sairImersivo({ doHistorico = false } = {}) {
    if (!imersivo) return;
    imersivo = false;
    raiz.classList.remove('is-imersivo');
    document.documentElement.classList.remove('trava-rolagem');
    motor?.permitirRoda(false);
    requestAnimationFrame(atualizarMargens);
    if (estadoHistorico && !doHistorico) history.back();
    estadoHistorico = false;
    // No celular o 3D fica em pausa fora da tela cheia; o pôster volta a aparecer.
    if (telaPequena()) {
      raiz.dataset.pausado = '';
      motor?.pausar(true);
    }
    $('[data-v3d-acao="iniciar"]')?.focus({ preventScroll: true });
  }
  addEventListener('popstate', () => {
    if (imersivo) {
      estadoHistorico = false;
      sairImersivo({ doHistorico: true });
    }
  });

  // ——— Carregar o motor ———
  function abrir() {
    delete raiz.dataset.pausado;
    if (telaPequena()) entrarImersivo();
    if (motor) {
      motor.pausar(false);
      return;
    }
    carregando ??= carregar();
  }

  async function carregar() {
    if (!suportaWebGL2()) {
      falhar('Este navegador não exibe 3D. As imagens e a lista de pontos mostram os mesmos detalhes.');
      return;
    }
    setEstado('carregando');
    anunciar('Carregando o modelo 3D…');
    let ultimoAnuncio = 0;
    try {
      const { criarMotor } = await import('./motor');
      motor = await criarMotor({
        container: alvoCanvas,
        modelo: dados.modelo,
        config: dados.config,
        qualidade: detectarQualidade(),
        reduzirMovimento: reduzirMovimento(),
        vistas: Object.fromEntries(dados.pontos.map((p) => [p.no, { ...p.vista, alvo: [0, 0, 0] }])),
        aoProgredir(f) {
          progresso.style.setProperty('--p', String(f));
          const pct = Math.floor(f * 4) * 25;
          if (pct > ultimoAnuncio && pct < 100) {
            ultimoAnuncio = pct;
            anunciar(`Carregando o modelo 3D: ${pct}%`);
          }
        },
        aoMoverMarcadores: moverMarcadores,
        aoToqueVazio: () => ativo && selecionar(null),
        aoInteragir: () => !dica.hidden && mostrarDica(false),
        aoPerderContexto: () => {
          motor?.dispose();
          motor = null;
          carregando = null;
          falhar('O 3D foi interrompido pelo navegador.');
        },
      });
      atualizarMargens();
      setEstado('ativo');
      anunciar('Modelo 3D pronto. Arraste para girar; use a lista de pontos para ver os detalhes.');
      motor.permitirRoda(imersivo);
      if (ativo) selecionar(ativo);
      if (!dicaJaVista()) mostrarDica(true);
      observarVisibilidade();
    } catch (e) {
      console.error(e);
      falhar('Não foi possível abrir o 3D agora.');
    }
  }

  function falhar(msg: string) {
    setEstado('erro');
    $('[data-v3d-erro-texto]').textContent = msg;
    anunciar(msg);
  }

  // ——— Pausa quando fora da tela ou aba oculta ———
  function observarVisibilidade() {
    let naTela = true;
    const atualizar = () => motor?.pausar(!naTela || document.hidden || (telaPequena() && !imersivo));
    new IntersectionObserver(([e]) => {
      naTela = e.isIntersecting;
      atualizar();
    }).observe(palco);
    document.addEventListener('visibilitychange', atualizar);
  }

  // ——— Roda do mouse: só depois de clicar no 3D, para não sequestrar a rolagem ———
  alvoCanvas.addEventListener('pointerdown', () => motor?.permitirRoda(true));
  palco.addEventListener('pointerleave', () => !imersivo && motor?.permitirRoda(false));

  // ——— Teclado ———
  palco.addEventListener('keydown', (e) => {
    if (!motor || e.target !== palco) return;
    const k = e.key;
    const acoes: Record<string, () => void> = {
      ArrowLeft: () => motor!.girar(-0.12, 0),
      ArrowRight: () => motor!.girar(0.12, 0),
      ArrowUp: () => motor!.girar(0, -0.08),
      ArrowDown: () => motor!.girar(0, 0.08),
      '+': () => motor!.aproximar(0.8),
      '=': () => motor!.aproximar(0.8),
      '-': () => motor!.aproximar(1.25),
      '0': () => motor!.vistaInicial(),
      Home: () => motor!.vistaInicial(),
    };
    if (acoes[k]) {
      e.preventDefault();
      acoes[k]();
      if (!dica.hidden) mostrarDica(false);
    }
  });
  raiz.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!dica.hidden) mostrarDica(false);
    else if (ativo) selecionar(null);
    else if (imersivo) sairImersivo();
    else return;
    e.stopPropagation();
  });

  // Foco preso na tela cheia
  raiz.addEventListener('keydown', (e) => {
    if (!imersivo || e.key !== 'Tab') return;
    const focaveis = $$<HTMLElement>('button:not([hidden]):not([tabindex="-1"]), a[href], [tabindex="0"]').filter(
      (el) => el.offsetParent !== null,
    );
    if (!focaveis.length) return;
    const primeiro = focaveis[0];
    const ultimo = focaveis[focaveis.length - 1];
    if (e.shiftKey && document.activeElement === primeiro) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault();
      primeiro.focus();
    }
  });

  // ——— Carga automática no desktop, quando o visualizador aparece ———
  const auto = raiz.dataset.auto === 'desktop';
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  if (auto && !telaPequena() && !nav.connection?.saveData) {
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          io.disconnect();
          abrir();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(palco);
  }

  raiz.classList.add('js');
  const pedido = new URLSearchParams(location.search).get('ponto');
  selecionar(dados.pontos.some((p) => p.no === pedido) ? pedido : null, { mover: false });
}

for (const el of document.querySelectorAll<HTMLElement>('[data-v3d]')) iniciarVisualizador(el);
