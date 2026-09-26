// Página usada apenas por scripts/gerar-renders.mjs (não faz parte do site).
import * as THREE from 'three';
import { vistaInicial, posicaoDe } from '../../src/scripts/visualizador/camera';
import { configurarRenderer, montarCena, criarPipeline, type Pipeline } from '../../src/scripts/visualizador/cena';

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, premultipliedAlpha: false, preserveDrawingBuffer: true });
configurarRenderer(renderer, 'alta');
document.body.appendChild(renderer.domElement);
const camera = new THREE.PerspectiveCamera(40, 1, 0.05, 50);

const pronto = montarCena(renderer, '/public/modelos/cozinha.glb', 'alta');

let pipeline: Pipeline | undefined;
interface Vista { w: number; h: number; escala?: number; desloc?: number; preset?: string; pos?: number[]; alvo: number[]; fov: number; az?: number; polar?: number; dist?: number }

(window as any).renderizar = async (v: Vista) => {
  const cena = await pronto;
  const d = Math.round((v.desloc ?? 0) * v.w);
  if (v.preset === 'inicial') {
    const o = vistaInicial((v.w - d) / v.h);
    v = { ...v, fov: o.fov, alvo: o.alvo, pos: posicaoDe(o).toArray() };
  }
  const escala = v.escala ?? 2;
  renderer.setPixelRatio(escala);
  pipeline ??= criarPipeline(renderer, cena.scene, camera, 'alta', { repouso: escala, movimento: escala });
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
(window as any).estudioPronto = pronto.then(() => true);
