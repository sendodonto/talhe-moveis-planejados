// Página usada apenas por scripts/gerar-renders.mjs (não faz parte do site).
// Renderiza qualquer modelo de src/scripts/visualizador/modelos.ts com a mesma
// luz do visualizador, opcionalmente com portas/gavetas na posição aberta.
import * as THREE from 'three';
import { vistaInicial, posicaoDe } from '../../src/scripts/visualizador/camera';
import { configurarRenderer, montarCena, criarPipeline, type CenaMontada, type Pipeline } from '../../src/scripts/visualizador/cena';
import { MODELOS } from '../../src/scripts/visualizador/modelos';

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, premultipliedAlpha: false, preserveDrawingBuffer: true });
configurarRenderer(renderer, 'alta');
document.body.appendChild(renderer.domElement);
const camera = new THREE.PerspectiveCamera(40, 1, 0.05, 60);

const cenas = new Map<string, Promise<{ cena: CenaMontada; pipeline?: Pipeline; mixer: THREE.AnimationMixer }>>();
function carregar(id: string) {
  if (!cenas.has(id)) {
    const cfg = MODELOS[id];
    cenas.set(
      id,
      montarCena(renderer, '/public' + cfg.arquivo, cfg, 'alta').then((cena) => ({ cena, mixer: new THREE.AnimationMixer(cena.modelo) })),
    );
  }
  return cenas.get(id)!;
}

interface Vista {
  w: number;
  h: number;
  modelo?: string;
  /** Animações a mostrar no último quadro (porta aberta, gaveta aberta). */
  abertas?: string[];
  escala?: number;
  desloc?: number;
  preset?: string;
  pos?: number[];
  alvo: number[];
  fov: number;
  az?: number;
  polar?: number;
  dist?: number;
}

(window as any).renderizar = async (v: Vista) => {
  const id = v.modelo ?? 'cozinha';
  const item = await carregar(id);
  const { cena, mixer } = item;
  const cfg = MODELOS[id];

  // Pose das animações: tudo fechado, depois abre as pedidas no último quadro.
  mixer.stopAllAction();
  mixer.update(0);
  for (const nome of v.abertas ?? []) {
    const clip = cena.animacoes.find((c) => c.name === nome);
    if (!clip) throw new Error(`Animação não encontrada: ${nome}`);
    const a = mixer.clipAction(clip);
    a.setLoop(THREE.LoopOnce, 1);
    a.clampWhenFinished = true;
    a.reset().play();
  }
  mixer.update(10);
  cena.modelo.updateMatrixWorld(true);

  const d = Math.round((v.desloc ?? 0) * v.w);
  if (v.preset === 'inicial') {
    const o = vistaInicial((v.w - d) / v.h, cfg);
    v = { ...v, fov: o.fov, alvo: o.alvo, pos: posicaoDe(o).toArray() };
  }
  const escala = v.escala ?? 2;
  renderer.setPixelRatio(escala);
  item.pipeline ??= criarPipeline(renderer, cena.scene, camera, 'alta', { repouso: escala, movimento: escala });
  const pipeline = item.pipeline;
  pipeline.setSize(v.w, v.h);
  renderer.domElement.style.width = v.w + 'px';
  renderer.domElement.style.height = v.h + 'px';
  if (d > 0) {
    camera.aspect = (v.w + d) / v.h;
    camera.setViewOffset(v.w + d, v.h, d, 0, v.w, v.h);
  } else {
    camera.aspect = v.w / v.h;
    camera.clearViewOffset();
  }
  camera.fov = v.fov;
  if (v.pos) camera.position.fromArray(v.pos);
  else camera.position.setFromSphericalCoords(v.dist!, v.polar!, v.az!).add(new THREE.Vector3().fromArray(v.alvo));
  camera.lookAt(new THREE.Vector3().fromArray(v.alvo));
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
  cena.atualizarSombras();
  pipeline.render();
  // Projeção real dos nós HOTSPOT_* nesta vista, com teste de oclusão.
  const ray = new THREE.Raycaster();
  const hotspots = cena.hotspots.map((h) => {
    const p = h.posicao.clone().project(camera);
    const dir = h.posicao.clone().sub(camera.position);
    const dist = dir.length();
    ray.set(camera.position, dir.normalize());
    ray.far = dist;
    const hit = ray.intersectObjects(cena.malhas, false)[0];
    const visivel = Math.abs(p.x) < 1 && Math.abs(p.y) < 1 && p.z < 1 && (!hit || hit.distance > dist - 0.06);
    return { no: h.no, titulo: h.titulo, descricao: h.descricao, x: (p.x + 1) / 2, y: (1 - p.y) / 2, visivel };
  });
  return { hotspots };
};
(window as any).estudioPronto = carregar('cozinha').then(() => true);
