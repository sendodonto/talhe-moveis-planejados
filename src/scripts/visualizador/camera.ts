// Enquadramento inicial e conversão de órbita para posição. Os números de cada
// ambiente ficam em ./modelos.ts.
import * as THREE from 'three';
import type { ConfigModelo, Vec3 } from './modelos';

export interface Orbita {
  alvo: Vec3;
  /** Ângulo horizontal (rad). 0 = câmera em +z olhando para a parede do fundo. */
  az: number;
  /** Ângulo a partir do eixo vertical (rad). π/2 = horizontal. */
  polar: number;
  dist: number;
}

const FOV_PAISAGEM = 40;
const FOV_RETRATO = 50;

/** Vista inicial ajustada à proporção da tela: em retrato a câmera recua e abre o campo. */
export function vistaInicial(aspecto: number, cfg: ConfigModelo): Orbita & { fov: number } {
  const ini = cfg.inicial;
  const fov = aspecto < 1 ? FOV_RETRATO : FOV_PAISAGEM;
  // Largura útil que precisa caber no quadro (m). Em retrato aceitamos cortar
  // um pouco das laterais para o ambiente não ficar minúsculo.
  const largura = aspecto < 0.75 ? ini.largura.estreito : aspecto < 1 ? ini.largura.retrato : ini.largura.paisagem;
  const hfov = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(fov / 2)) * aspecto);
  const dist = Math.max(ini.dist, largura / Math.tan(hfov / 2));
  const alvo: Vec3 = aspecto < 0.75 && ini.alvoRetrato ? ini.alvoRetrato : ini.alvo;
  return { alvo, az: ini.az, polar: ini.polar, dist: Math.min(dist, cfg.limites.distMax - 0.5), fov };
}

export function posicaoDe(o: Orbita, destino = new THREE.Vector3()): THREE.Vector3 {
  return destino.setFromSphericalCoords(o.dist, o.polar, o.az).add(new THREE.Vector3(...o.alvo));
}
