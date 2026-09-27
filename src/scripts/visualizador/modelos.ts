// ─────────────────────────────────────────────────────────────────────────────
// Configuração técnica de cada modelo 3D: câmera, limites, volumes que a câmera
// não atravessa e fontes de luz que não vêm no GLB. Valores em metros, no
// sistema do GLB (y para cima). Nos três ambientes as paredes ficam no fundo
// (−z) e à esquerda (−x); o lado aberto é voltado para +x e +z.
//
// Este arquivo não importa imagens nem conteúdo: é usado pelo site e pelo
// gerador de imagens (scripts/gerar-renders.mjs).
// ─────────────────────────────────────────────────────────────────────────────

export type Vec3 = [number, number, number];
/** Caixa [x0, y0, z0, x1, y1, z1]. */
export type Caixa = [number, number, number, number, number, number];

export interface LuzDeArea {
  pos: Vec3;
  /** Largura e altura do retângulo (m). */
  w: number;
  h: number;
  intensidade: number;
  /** Ponto para onde a luz aponta. Padrão: direto para baixo. */
  alvo?: Vec3;
  cor?: number;
}

export interface Janela {
  /** Centro do vão, na face interna da parede. */
  centro: Vec3;
  largura: number;
  altura: number;
  /** Eixo da parede: a luz entra no sentido +x (parede esquerda) ou +z. */
  eixo: 'x' | 'z';
  intensidade?: number;
}

export interface ConfigModelo {
  id: string;
  /** Caminho público do GLB otimizado (sem a base do site). */
  arquivo: string;
  inicial: {
    alvo: Vec3;
    /** Alvo em telas muito altas (retrato estreito). */
    alvoRetrato?: Vec3;
    az: number;
    polar: number;
    dist: number;
    /** Largura (m) que precisa caber no quadro em paisagem, retrato e retrato estreito. */
    largura: { paisagem: number; retrato: number; estreito: number };
  };
  limites: {
    distMin: number;
    distMax: number;
    polarMin: number;
    polarMax: number;
    azMin: number;
    azMax: number;
    alvoMin: Vec3;
    alvoMax: Vec3;
    alturaMin: number;
  };
  solidos: Caixa[];
  luzes: LuzDeArea[];
  janela?: Janela;
}

const LIMITES_PADRAO = { distMin: 0.8, distMax: 10, polarMin: 0.18, polarMax: 1.58, azMin: -0.45, azMax: 1.95, alturaMin: 0.3 };

export const MODELOS: Record<string, ConfigModelo> = {
  cozinha: {
    id: 'cozinha',
    arquivo: '/modelos/cozinha.glb',
    inicial: {
      alvo: [0, 0.78, -0.1],
      alvoRetrato: [0, 0.72, -0.1],
      az: 0.62,
      polar: 1.2,
      dist: 5.7,
      largura: { paisagem: 4.9, retrato: 2.2, estreito: 1.75 },
    },
    limites: { ...LIMITES_PADRAO, alvoMin: [-1.2, 0.35, -1.25], alvoMax: [1.55, 2.5, 1.9] },
    solidos: [
      [-1.6, 0, -1.6, -0.85, 0.95, 1.0], // bancada da pia
      [-1.6, 0, -1.6, 1.5, 0.95, -0.9], // bancada do fundo
      [0.72, 0, -0.95, 1.5, 0.95, 1.8], // península
      [-1.6, 1.58, -1.6, -1.1, 2.8, 1.12], // aéreos laterais
      [-1.6, 1.58, -1.6, 1.5, 2.8, -1.04], // aéreos do fundo
      [-1.6, 0, 0.95, -0.74, 2.05, 1.75], // geladeira
      [-3, -1, -3, -1.46, 3, 3], // parede da janela
      [-3, -1, -3, 3, 3, -1.5], // parede do fundo
    ],
    luzes: [
      { pos: [-1.235, 1.605, -0.09], w: 0.05, h: 2.36, intensidade: 5.5 },
      { pos: [-0.3, 1.605, -1.255], w: 2.27, h: 0.05, intensidade: 5.5 },
      { pos: [1.07, 1.755, 1.17], w: 0.13, h: 0.13, intensidade: 14 },
      { pos: [1.07, 1.755, -0.22], w: 0.13, h: 0.13, intensidade: 14 },
    ],
    janela: { centro: [-1.43, 1.3, -0.14], largura: 1.6, altura: 0.66, eixo: 'x', intensidade: 2.2 },
  },

  closet: {
    id: 'closet',
    arquivo: '/modelos/closet.glb',
    inicial: {
      alvo: [0, 0.95, 0],
      alvoRetrato: [0, 0.85, 0],
      az: 0.6,
      polar: 1.2,
      dist: 5.7,
      largura: { paisagem: 5.0, retrato: 2.1, estreito: 1.6 },
    },
    limites: { ...LIMITES_PADRAO, alvoMin: [-1.3, 0.35, -1.2], alvoMax: [1.6, 2.4, 2.1] },
    solidos: [
      [-1.8, 0, -1.2, -1.08, 2.66, 1.16], // armário lateral + sapateira
      [-1.1, 0, -1.6, 1.68, 2.66, -0.83], // armários do fundo com a porta de vidro
      [-0.24, 0, 0.27, 0.93, 0.84, 1.47], // ilha (inclui a gaveta aberta)
      [-3, -1, -3, -1.7, 3.2, 3], // parede lateral
      [-3, -1, -3, 3, 3.2, -1.52], // parede do fundo
    ],
    luzes: [
      // Perfis de LED verticais: uma luz larga cobrindo os módulos do fundo
      // (quatro luzes separadas custavam quase o dobro por quadro no celular).
      { pos: [0.28, 1.4, -1.0], w: 2.7, h: 2.4, intensidade: 1.1, alvo: [0.28, 1.4, -2] },
      // LED sob o maleiro da sapateira
      { pos: [-1.125, 2.22, -0.01], w: 0.04, h: 2.2, intensidade: 5 },
    ],
  },

  sala: {
    id: 'sala',
    arquivo: '/modelos/sala.glb',
    inicial: {
      alvo: [0.05, 0.8, 0.1],
      alvoRetrato: [0.05, 0.75, 0.1],
      az: 0.6,
      polar: 1.18,
      dist: 6.2,
      largura: { paisagem: 6.0, retrato: 2.35, estreito: 1.85 },
    },
    limites: { ...LIMITES_PADRAO, distMax: 11, alvoMin: [-1.9, 0.3, -1.2], alvoMax: [2.0, 2.4, 2.2] },
    solidos: [
      [-2.2, 0, -1.6, 0.6, 0.64, -0.9], // rack
      [-2.2, 0, -1.6, -1.26, 2.76, -1.42], // painel de carvalho
      [0.5, 0, -1.6, 1.95, 0.8, -0.45], // bancada (inclui a gaveta aberta)
      [1.88, 0, -1.6, 2.3, 2.78, -1.05], // estante
      [-2.15, 0, 1.0, 0.25, 1.0, 2.0], // sofá
      [-1.25, 0, 0.0, -0.18, 0.4, 0.68], // mesa de centro
      [-3, -1, -3, -2.26, 3.2, 3], // parede da janela
      [-3, -1, -3, 3, 3.2, -1.5], // parede do fundo
    ],
    luzes: [
      { pos: [2.08, 1.6, -1.1], w: 0.28, h: 0.03, intensidade: 5 },
      { pos: [2.08, 2.13, -1.1], w: 0.28, h: 0.03, intensidade: 5 },
      { pos: [1.21, 1.92, -1.185], w: 1.37, h: 0.03, intensidade: 5 },
    ],
    janela: { centro: [-2.28, 1.6, 0.15], largura: 3.4, altura: 1.9, eixo: 'x', intensidade: 2.4 },
  },
};
