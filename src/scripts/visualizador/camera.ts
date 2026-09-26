// Enquadramentos e limites de câmera da cozinha. Valores em metros, no
// sistema de coordenadas do GLB (y para cima; paredes em x≈-1,5 e z≈-1,6;
// lado aberto voltado para +x e +z).
import * as THREE from 'three';

export interface Orbita {
  alvo: [number, number, number];
  /** Ângulo horizontal (rad). 0 = câmera em +z olhando para a parede do fundo. */
  az: number;
  /** Ângulo a partir do eixo vertical (rad). π/2 = horizontal. */
  polar: number;
  dist: number;
}

const INICIAL: Orbita = { alvo: [0, 0.92, -0.1], az: 0.62, polar: 1.2, dist: 5.7 };
const FOV_PAISAGEM = 40;
const FOV_RETRATO = 50;

/** Vista inicial ajustada à proporção da tela: em retrato a câmera recua e abre o campo. */
export function vistaInicial(aspecto: number): Orbita & { fov: number } {
  const fov = aspecto < 1 ? FOV_RETRATO : FOV_PAISAGEM;
  // Largura útil que precisa caber no quadro (m). Em retrato aceitamos cortar
  // um pouco das laterais para a cozinha não ficar minúscula.
  const largura = aspecto < 0.75 ? 1.75 : aspecto < 1 ? 2.2 : 4.0;
  const hfov = 2 * Math.atan(Math.tan(THREE.MathUtils.degToRad(fov / 2)) * aspecto);
  const dist = Math.max(INICIAL.dist, largura / Math.tan(hfov / 2));
  // Em telas bem altas, o alvo desce um pouco para a cozinha ocupar o meio do quadro.
  const alvo: Orbita['alvo'] = aspecto < 0.75 ? [INICIAL.alvo[0], 0.72, INICIAL.alvo[2]] : INICIAL.alvo;
  return { ...INICIAL, alvo, dist: Math.min(dist, 9.5), fov };
}

export const LIMITES = {
  distMin: 0.8,
  distMax: 10,
  polarMin: 0.18,
  polarMax: 1.58,
  azMin: -0.45,
  azMax: 1.95,
  // Caixa onde o ponto de interesse pode andar (pan/zoom).
  alvoMin: new THREE.Vector3(-1.2, 0.35, -1.25),
  alvoMax: new THREE.Vector3(1.55, 2.5, 1.9),
  // A câmera nunca desce abaixo disto (evita ângulos por baixo do piso).
  alturaMin: 0.3,
};

export function posicaoDe(o: Orbita, destino = new THREE.Vector3()): THREE.Vector3 {
  return destino.setFromSphericalCoords(o.dist, o.polar, o.az).add(new THREE.Vector3(...o.alvo));
}
