// Motor 3D do visualizador: câmera, controles, limites, marcadores e render sob demanda.
// Este módulo (e o three.js) só é baixado quando o visitante pede o 3D.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { computeBoundsTree, acceleratedRaycast } from 'three-mesh-bvh';
import { configurarRenderer, montarCena, criarPipeline, type Qualidade, type HotspotModelo } from './cena';
import { vistaInicial, posicaoDe, type Orbita } from './camera';
import type { ConfigModelo } from './modelos';

THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

export interface PosicaoMarcador {
  no: string;
  x: number;
  y: number;
  visivel: boolean;
}

export interface OpcoesMotor {
  container: HTMLElement;
  modelo: string;
  config: ConfigModelo;
  qualidade: Qualidade;
  reduzirMovimento: boolean;
  vistas: Record<string, Orbita>;
  aoProgredir(fracao: number): void;
  aoMoverMarcadores(posicoes: PosicaoMarcador[]): void;
  aoToqueVazio(): void;
  aoInteragir(): void;
  aoPerderContexto(): void;
}

export interface Motor {
  hotspots: HotspotModelo[];
  focar(no: string): void;
  vistaInicial(): void;
  aproximar(fator: number): void;
  girar(dAz: number, dPolar: number): void;
  permitirRoda(sim: boolean): void;
  /** Abre a porta/gaveta ligada ao ponto (ou fecha a que estiver aberta, com null). */
  animar(nome: string | null): void;
  /** Área do quadro coberta pela interface (px): a câmera centraliza a cozinha no resto. */
  definirMargens(m: { direita?: number; topo?: number; base?: number }): void;
  pausar(sim: boolean): void;
  dispose(): void;
}

// A câmera é empurrada para fora dos volumes sólidos de cada ambiente (modelos.ts).
const MARGEM = 0.14;

export async function criarMotor(o: OpcoesMotor): Promise<Motor> {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  // Parado: até 2× (nítido também em telas de celular). Em movimento: menos pixels.
  const tela = window.devicePixelRatio || 1;
  const resolucao = {
    repouso: Math.min(tela, 2),
    movimento: Math.min(tela, { alta: 1.5, media: 1.25, baixa: 1 }[o.qualidade]),
  };
  renderer.setPixelRatio(resolucao.repouso);
  configurarRenderer(renderer, o.qualidade);
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  o.container.appendChild(canvas);

  const LIMITES = o.config.limites;
  const SOLIDOS = o.config.solidos;
  const cena = await montarCena(renderer, o.modelo, o.config, o.qualidade, o.aoProgredir).catch((e) => {
    renderer.dispose();
    canvas.remove();
    throw e;
  });

  const camera = new THREE.PerspectiveCamera(40, 1, 0.05, 60);
  const pipeline = criarPipeline(renderer, cena.scene, camera, o.qualidade, resolucao);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = !o.reduzirMovimento;
  controls.dampingFactor = 0.09;
  controls.rotateSpeed = 0.65;
  controls.zoomSpeed = 0.8;
  controls.panSpeed = 0.7;
  controls.screenSpacePanning = true;
  controls.minDistance = LIMITES.distMin;
  controls.maxDistance = LIMITES.distMax;
  controls.minPolarAngle = LIMITES.polarMin;
  controls.maxPolarAngle = LIMITES.polarMax;
  controls.minAzimuthAngle = LIMITES.azMin;
  controls.maxAzimuthAngle = LIMITES.azMax;
  controls.touches = { ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN };
  controls.enableZoom = false; // a roda só vale depois de o visitante clicar no 3D

  // ——— Render sob demanda ———
  let largura = 1;
  let altura = 1;
  const margens = { direita: 0, topo: 0, base: 0 };
  let pausado = false;
  let quadroPedido = false;
  let naVistaInicial = true;
  let transicao: null | { t0: number; dur: number; de: Orbita; para: Orbita } = null;

  // ——— Animações do GLB (portas, gavetas): tocam uma vez, param no último
  // quadro e voltam tocando ao contrário. Nunca duas instâncias da mesma. ———
  const mixer = new THREE.AnimationMixer(cena.modelo);
  const acoes = new Map<string, THREE.AnimationAction>();
  for (const clip of cena.animacoes) {
    const acao = mixer.clipAction(clip);
    acao.setLoop(THREE.LoopOnce, 1);
    acao.clampWhenFinished = true;
    acoes.set(clip.name, acao);
  }
  let aberta: string | null = null;
  let relogio = 0;
  const animando = () => [...acoes.values()].some((a) => a.isRunning());
  function tocar(nome: string, abrir: boolean) {
    const acao = acoes.get(nome);
    if (!acao) return;
    const vel = o.reduzirMovimento ? 4 : 1;
    // Primeira vez: agenda a ação. Depois, a mesma ação só inverte o sentido;
    // ao chegar no fim (ou no começo) ela para no quadro e aguarda.
    if (!acao.isScheduled()) {
      if (!abrir) return;
      acao.reset();
      acao.play();
    }
    acao.paused = false;
    acao.timeScale = abrir ? vel : -vel;
  }


  const pedirQuadro = () => {
    if (pausado || quadroPedido) return;
    quadroPedido = true;
    requestAnimationFrame(quadro);
  };

  // Mede o tempo entre quadros durante interação contínua e reduz a
  // resolução se o aparelho não acompanhar.
  let amostras: number[] = [];
  let ultimo = 0;
  const medir = (agora: number) => {
    if (ultimo && agora - ultimo < 200) amostras.push(agora - ultimo);
    ultimo = agora;
    if (amostras.length < 40) return;
    const media = amostras.reduce((a, b) => a + b, 0) / amostras.length;
    amostras = [];
    if (media > 30) pipeline.reduzirMovimento();
  };

  function quadro(agora: number) {
    quadroPedido = false;
    if (pausado) return;
    let continuar = false;
    if (transicao) {
      const k = Math.min(1, (agora - transicao.t0) / transicao.dur);
      aplicarOrbita(interpolar(transicao.de, transicao.para, suavizar(k)));
      if (k >= 1) transicao = null;
      else continuar = true;
    }
    if (controls.update()) continuar = true;
    if (acoes.size) {
      const dt = relogio ? Math.min(0.05, (agora - relogio) / 1000) : 0;
      relogio = agora;
      if (animando()) {
        mixer.update(dt);
        cena.atualizarSombras();
        continuar = true;
      } else relogio = 0;
    }
    // Em movimento: quadro rápido. Parado: quadro completo, com oclusão de ambiente.
    pipeline.render(!continuar);
    atualizarMarcadores(agora, continuar);
    if (continuar) {
      medir(agora);
      pedirQuadro();
    } else ultimo = 0;
  }

  controls.addEventListener('change', () => {
    limitarCamera();
    pedirQuadro();
  });
  controls.addEventListener('start', () => {
    transicao = null;
    naVistaInicial = false;
    o.aoInteragir();
  });

  // ——— Limites: alvo dentro da cozinha, câmera fora dos móveis e acima do piso ———
  const tmp = new THREE.Vector3();
  function limitarCamera() {
    const alvo = controls.target;
    // Se o alvo sair da caixa, alvo e câmera recuam juntos (sem salto de ângulo).
    const antes = tmp.copy(alvo);
    alvo.clamp(new THREE.Vector3(...LIMITES.alvoMin), new THREE.Vector3(...LIMITES.alvoMax));
    camera.position.sub(antes.sub(alvo));
    const p = camera.position;
    for (const [x0, y0, z0, x1, y1, z1] of SOLIDOS) {
      const dentro = p.x > x0 - MARGEM && p.x < x1 + MARGEM && p.y > y0 - MARGEM && p.y < y1 + MARGEM && p.z > z0 - MARGEM && p.z < z1 + MARGEM;
      if (!dentro) continue;
      // Empurra pela face mais próxima que não seja a de baixo (nunca para dentro do piso).
      const saidas: Array<[number, 'x' | 'y' | 'z', number]> = [
        [p.x - (x0 - MARGEM), 'x', x0 - MARGEM],
        [x1 + MARGEM - p.x, 'x', x1 + MARGEM],
        [y1 + MARGEM - p.y, 'y', y1 + MARGEM],
        [p.z - (z0 - MARGEM), 'z', z0 - MARGEM],
        [z1 + MARGEM - p.z, 'z', z1 + MARGEM],
      ];
      saidas.sort((a, b) => a[0] - b[0]);
      const [, eixo, valor] = saidas[0];
      p[eixo] = valor;
    }
    if (p.y < LIMITES.alturaMin) p.y = LIMITES.alturaMin;
  }

  // ——— Transições de câmera (em coordenadas esféricas, contornando o ambiente) ———
  const orbitaAtual = (): Orbita => {
    const off = tmp.copy(camera.position).sub(controls.target);
    const s = new THREE.Spherical().setFromVector3(off);
    return { alvo: controls.target.toArray() as Orbita['alvo'], az: s.theta, polar: s.phi, dist: s.radius };
  };
  function aplicarOrbita(orb: Orbita) {
    controls.target.set(...orb.alvo);
    posicaoDe(orb, camera.position);
    camera.lookAt(controls.target);
  }
  const suavizar = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
  function interpolar(a: Orbita, b: Orbita, k: number): Orbita {
    let dAz = b.az - a.az;
    if (dAz > Math.PI) dAz -= 2 * Math.PI;
    if (dAz < -Math.PI) dAz += 2 * Math.PI;
    // Afasta um pouco no meio do caminho: a câmera "respira" em vez de cortar o ambiente.
    const arco = Math.sin(k * Math.PI) * Math.min(1.2, Math.abs(b.dist - a.dist) * 0.3 + Math.abs(dAz) * 0.6);
    return {
      alvo: a.alvo.map((v, i) => v + (b.alvo[i] - v) * k) as Orbita['alvo'],
      az: a.az + dAz * k,
      polar: a.polar + (b.polar - a.polar) * k,
      dist: a.dist + (b.dist - a.dist) * k + arco,
    };
  }
  function irPara(destino: Orbita) {
    if (o.reduzirMovimento) {
      transicao = null;
      aplicarOrbita(destino);
      controls.update();
    } else {
      transicao = { t0: performance.now(), dur: 1100, de: orbitaAtual(), para: destino };
    }
    pedirQuadro();
  }

  // ——— Marcadores: projeção dos nós HOTSPOT_* e teste de oclusão ———
  const raio = new THREE.Raycaster();
  raio.firstHitOnly = true;
  const solidos = cena.malhas.filter((m) => {
    const mat = m.material as THREE.MeshPhysicalMaterial;
    return !mat.transparent && !(mat.transmission > 0);
  });
  let bvhPronta = false;
  const visivel = new Map<string, boolean>(cena.hotspots.map((h) => [h.no, true]));
  let ultimaOclusao = 0;

  function testarOclusao() {
    for (const h of cena.hotspots) {
      const dir = tmp.copy(h.posicao).sub(camera.position);
      const dist = dir.length();
      raio.set(camera.position, dir.normalize());
      raio.far = dist;
      const hit = raio.intersectObjects(solidos, false)[0];
      visivel.set(h.no, !hit || hit.distance > dist - 0.09);
    }
  }

  function atualizarMarcadores(agora: number, emMovimento: boolean) {
    // Oclusão é mais cara: a cada ~120 ms em movimento e sempre ao parar.
    if (bvhPronta && (!emMovimento || agora - ultimaOclusao > 120)) {
      testarOclusao();
      ultimaOclusao = agora;
    }
    const v = new THREE.Vector3();
    o.aoMoverMarcadores(
      cena.hotspots.map((h) => {
        v.copy(h.posicao).project(camera);
        const x = ((v.x + 1) / 2) * largura;
        const y = ((1 - v.y) / 2) * altura;
        // Fora da área livre (sob painel ou botões) conta como fora da tela.
        const naTela =
          v.z < 1 && x > 18 && x < largura - margens.direita - 18 && y > margens.topo + 18 && y < altura - margens.base - 18;
        return { no: h.no, x, y, visivel: naTela && (visivel.get(h.no) ?? true) };
      }),
    );
  }

  const agendarOcioso = (fn: () => void) =>
    'requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 1500 }) : setTimeout(fn, 300);
  agendarOcioso(() => {
    for (const m of solidos) m.geometry.computeBoundsTree();
    bvhPronta = true;
    pedirQuadro();
  });

  // ——— Toque/clique no vazio fecha o painel (sem mover a câmera) ———
  let inicioToque: { x: number; y: number; t: number } | null = null;
  canvas.addEventListener('pointerdown', (e) => {
    inicioToque = { x: e.clientX, y: e.clientY, t: performance.now() };
  });
  canvas.addEventListener('pointerup', (e) => {
    if (!inicioToque) return;
    const d = Math.hypot(e.clientX - inicioToque.x, e.clientY - inicioToque.y);
    if (d < 6 && performance.now() - inicioToque.t < 350) o.aoToqueVazio();
    inicioToque = null;
  });

  // ——— Tamanho ———
  const ajustar = () => {
    const r = o.container.getBoundingClientRect();
    largura = Math.max(1, Math.round(r.width));
    altura = Math.max(1, Math.round(r.height));
    // Com painel sobreposto à direita, a projeção é deslocada: o centro óptico
    // fica no meio da área livre, não no meio do quadro inteiro.
    const d = Math.round(Math.min(margens.direita, largura * 0.45));
    if (d > 0) {
      camera.aspect = (largura + d) / altura;
      camera.setViewOffset(largura + d, altura, d, 0, largura, altura);
    } else {
      camera.aspect = largura / altura;
      camera.clearViewOffset();
    }
    if (naVistaInicial && !transicao) {
      const vi = vistaInicial((largura - d) / altura, o.config);
      camera.fov = vi.fov;
      aplicarOrbita(vi);
    }
    camera.updateProjectionMatrix();
    pipeline.setSize(largura, altura);
    pedirQuadro();
  };
  const ro = new ResizeObserver(ajustar);
  function aspectoLivre() {
    return (largura - Math.min(margens.direita, largura * 0.45)) / altura;
  }
  ro.observe(o.container);

  // Contexto perdido (GPU reiniciada, aba em segundo plano no celular)
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    o.aoPerderContexto();
  });

  const inicial = vistaInicial(1.6, o.config);
  camera.fov = inicial.fov;
  aplicarOrbita(inicial);
  ajustar();
  cena.atualizarSombras();
  pipeline.render();

  return {
    hotspots: cena.hotspots,
    focar(no) {
      const vista = o.vistas[no];
      const h = cena.hotspots.find((x) => x.no === no);
      if (!vista || !h) return;
      naVistaInicial = false;
      // O ponto de interesse é a posição real do nó no GLB. Em telas estreitas
      // (retrato) a câmera recua para manter o contexto em volta do ponto.
      const a = aspectoLivre();
      // Retrato: recua para manter contexto; paisagem: um pouco de ar em volta do ponto.
      const recuo = a < 1 ? Math.min(1.75, 1 / Math.sqrt(a)) : 1.25;
      const dist = Math.min(LIMITES.distMax, vista.dist * recuo);
      irPara({ ...vista, dist, alvo: h.posicao.toArray() as Orbita['alvo'] });
    },
    vistaInicial() {
      naVistaInicial = true;
      const vi = vistaInicial(aspectoLivre(), o.config);
      if (camera.fov !== vi.fov) {
        camera.fov = vi.fov;
        camera.updateProjectionMatrix();
      }
      irPara(vi);
    },
    aproximar(fator) {
      transicao = null;
      naVistaInicial = false;
      const atual = orbitaAtual();
      const dist = THREE.MathUtils.clamp(atual.dist * fator, LIMITES.distMin, LIMITES.distMax);
      irPara({ ...atual, dist });
    },
    girar(dAz, dPolar) {
      transicao = null;
      naVistaInicial = false;
      const a = orbitaAtual();
      aplicarOrbita({
        ...a,
        az: THREE.MathUtils.clamp(a.az + dAz, LIMITES.azMin, LIMITES.azMax),
        polar: THREE.MathUtils.clamp(a.polar + dPolar, LIMITES.polarMin, LIMITES.polarMax),
      });
      limitarCamera();
      controls.update();
      pedirQuadro();
    },
    permitirRoda(sim) {
      controls.enableZoom = sim;
    },
    animar(nome) {
      if (aberta && aberta !== nome) tocar(aberta, false);
      if (nome && acoes.has(nome)) tocar(nome, true);
      aberta = nome && acoes.has(nome) ? nome : null;
      relogio = 0;
      pedirQuadro();
    },
    definirMargens(m) {
      const antes = margens.direita;
      Object.assign(margens, m);
      if (margens.direita !== antes) ajustar();
      else pedirQuadro();
    },
    pausar(sim) {
      pausado = sim;
      if (!sim) pedirQuadro();
    },
    dispose() {
      pausado = true;
      mixer.stopAllAction();
      ro.disconnect();
      controls.dispose();
      pipeline.dispose();
      cena.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
