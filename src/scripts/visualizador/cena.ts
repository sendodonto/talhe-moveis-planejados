// Montagem da cena 3D: renderizador, iluminação, ambiente de reflexão e carga do GLB.
// Usado pelo visualizador do site e pelo script que gera as imagens estáticas,
// para que as fotos de apresentação e o 3D interativo tenham a mesma luz.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import type { ConfigModelo } from './modelos';

export type Qualidade = 'alta' | 'media' | 'baixa';

/** Fundo e piso do estúdio (lineares ao tom da página depois do tonemapping). */
export const COR_ESTUDIO = 0xf1ece5;
const COR_CHAO = 0xbfbcb8;

export interface HotspotModelo {
  /** Nome do nó no GLB, ex.: HOTSPOT_Bancada */
  no: string;
  titulo: string;
  descricao: string;
  /** Animação do GLB ligada ao ponto (porta, gaveta), se houver. */
  animacao?: string;
  posicao: THREE.Vector3;
}

export interface CenaMontada {
  scene: THREE.Scene;
  modelo: THREE.Object3D;
  hotspots: HotspotModelo[];
  malhas: THREE.Mesh[];
  limites: THREE.Box3;
  animacoes: THREE.AnimationClip[];
  /** Recalcula o mapa de sombras (a cena é estática: só é preciso uma vez). */
  atualizarSombras(): void;
  dispose(): void;
}

export function configurarRenderer(renderer: THREE.WebGLRenderer, qualidade: Qualidade) {
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  // Tonemapping neutro (Khronos PBR Neutral): mantém a cor real do grafite e da madeira.
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  // PCF com raio: sombras de borda suave (o PCFSoftShadowMap foi descontinuado no three.js).
  renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.shadowMap.autoUpdate = false;
  // Fundo transparente: o "papel" da página aparece por trás do modelo.
  renderer.setClearColor(0x000000, 0);
}

export async function montarCena(
  renderer: THREE.WebGLRenderer,
  url: string,
  cfg: ConfigModelo,
  qualidade: Qualidade,
  aoProgredir?: (fracao: number) => void,
): Promise<CenaMontada> {
  const scene = new THREE.Scene();

  // Ambiente de reflexão: estúdio neutro pré-filtrado. É o que dá leitura ao granito
  // polido, ao inox escovado e ao vidro — sem ele os materiais ficam chapados.
  const pmrem = new THREE.PMREMGenerator(renderer);
  const cenaAmbiente = criarAmbienteDeReflexo();
  const ambiente = pmrem.fromScene(cenaAmbiente, 0.02).texture;
  scene.environment = ambiente;
  scene.environmentIntensity = 1;
  pmrem.dispose();
  cenaAmbiente.traverse((o) => (o as THREE.Mesh).geometry?.dispose());

  // Luz principal: vem do lado aberto do ambiente (frente-direita, alta),
  // desenha sombras de contato sob os aéreos e a península.
  const sol = new THREE.DirectionalLight(0xfff4e6, 2.1);
  sol.position.set(3.2, 5.4, 4.2);
  sol.target.position.set(-0.2, 0.6, -0.4);
  sol.castShadow = true;
  // A sombra é calculada uma vez só (cena estática): resolução alta em qualquer aparelho.
  const tamanhoSombra = qualidade === 'baixa' ? 1024 : 2048;
  sol.shadow.mapSize.set(tamanhoSombra, tamanhoSombra);
  const cam = sol.shadow.camera;
  cam.left = -4.2; cam.right = 4.2; cam.top = 4.2; cam.bottom = -4.2; cam.near = 1; cam.far = 16;
  sol.shadow.bias = -0.0004;
  sol.shadow.normalBias = 0.018;
  sol.shadow.radius = qualidade === 'baixa' ? 2 : 4;
  scene.add(sol, sol.target);

  // Preenchimento suave de céu/piso para não afundar os cantos.
  scene.add(new THREE.HemisphereLight(0xf3efe8, 0x6b5a48, 0.55));

  // Fontes de luz que existem no modelo mas não vêm no GLB (a iluminação do
  // Blender não é exportada): fitas de LED, pendentes e a claridade da janela.
  RectAreaLightUniformsLib.init();
  for (const l of cfg.luzes) {
    const luz = new THREE.RectAreaLight(l.cor ?? 0xffb36b, l.intensidade, l.w, l.h);
    luz.position.set(...l.pos);
    if (l.alvo) luz.lookAt(...l.alvo);
    else luz.lookAt(l.pos[0], 0, l.pos[2]);
    scene.add(luz);
  }
  if (cfg.janela) {
    const j = cfg.janela;
    const fora = new THREE.Mesh(
      new THREE.PlaneGeometry(j.largura * 1.2, j.altura * 1.3),
      new THREE.MeshBasicMaterial({ color: 0xf6f3ee, toneMapped: false }),
    );
    const luz = new THREE.RectAreaLight(0xf2f4f6, j.intensidade ?? 2.2, j.largura, j.altura);
    const [x, y, z] = j.centro;
    if (j.eixo === 'x') {
      fora.position.set(x - 0.3, y, z);
      fora.rotation.y = Math.PI / 2;
      luz.position.set(x, y, z);
      luz.lookAt(x + 3, y - 0.2, z);
    } else {
      fora.position.set(x, y, z - 0.3);
      luz.position.set(x, y, z);
      luz.lookAt(x, y - 0.2, z + 3);
    }
    scene.add(fora, luz);
  }

  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync(url, (e) => {
    if (aoProgredir && e.total) aoProgredir(e.loaded / e.total);
  });
  const modelo = gltf.scene;
  scene.add(modelo);

  // Estúdio: chão infinito na cor do fundo, com névoa dissolvendo o horizonte.
  // A maquete assenta num piso de verdade — recebe a sombra da luz principal e
  // a oclusão de ambiente — em vez de flutuar num vazio.
  const caixaModelo = new THREE.Box3().setFromObject(modelo);
  const centro = caixaModelo.getCenter(new THREE.Vector3());
  const corEstudio = new THREE.Color(COR_ESTUDIO);
  scene.background = corEstudio;
  scene.fog = new THREE.Fog(corEstudio, 9, 22);
  const chao = new THREE.Mesh(
    new THREE.CircleGeometry(40, 64),
    new THREE.MeshStandardMaterial({ color: COR_CHAO, roughness: 1, metalness: 0, envMapIntensity: 0.35 }),
  );
  chao.rotation.x = -Math.PI / 2;
  chao.position.set(centro.x, caixaModelo.min.y - 0.001, centro.z);
  chao.receiveShadow = true;
  scene.add(chao);

  const hotspots: HotspotModelo[] = [];
  const malhas: THREE.Mesh[] = [];
  modelo.updateMatrixWorld(true);
  modelo.traverse((obj) => {
    if (obj.name.startsWith('HOTSPOT_')) {
      const extras = obj.userData as { titulo?: string; descricao?: string; animation?: string };
      hotspots.push({
        no: obj.name,
        titulo: extras.titulo ?? obj.name.replace('HOTSPOT_', ''),
        descricao: extras.descricao ?? '',
        animacao: extras.animation,
        posicao: obj.getWorldPosition(new THREE.Vector3()),
      });
    }
    const malha = obj as THREE.Mesh;
    if (!malha.isMesh) return;
    malhas.push(malha);
    malha.castShadow = true;
    malha.receiveShadow = true;
    const materiais = Array.isArray(malha.material) ? malha.material : [malha.material];
    for (const m of materiais as THREE.MeshPhysicalMaterial[]) {
      if (m.map) m.map.anisotropy = renderer.capabilities.getMaxAnisotropy();
      // Anisotropia depende de UV ou tangentes para orientar o escovado. As malhas
      // de inox não têm UV; sem essa orientação o three.js gera reflexo branco.
      const g = malha.geometry;
      if (m.anisotropy > 0 && !g.attributes.uv && !g.attributes.tangent) m.anisotropy = 0;
      // Vidros não projetam sombra dura.
      if (m.transmission > 0) malha.castShadow = false;
      // O vidro fosco da janela, com transmissão em tempo real, "puxa" os objetos à
      // frente dele para o desfoque. Como vidro translúcido o resultado é fiel ao render.
      if (m.name === 'Vidro fosco janela') {
        m.transmission = 0;
        m.transparent = true;
        m.opacity = 0.62;
        m.depthWrite = false;
      }
      // A transmissão renderiza a cena inteira de novo a cada quadro. Nos vidros
      // pequenos deste modelo (forno, potes) a transparência simples basta.
      if (m.transmission > 0) {
        m.transmission = 0;
        m.transparent = true;
        m.opacity = 0.35;
      }
    }
  });

  const limites = new THREE.Box3().setFromObject(modelo);

  return {
    scene,
    modelo,
    hotspots,
    malhas,
    limites,
    animacoes: gltf.animations,
    atualizarSombras() {
      renderer.shadowMap.needsUpdate = true;
    },
    dispose() {
      ambiente.dispose();
      scene.traverse((obj) => {
        const m = obj as THREE.Mesh;
        if (!m.isMesh) return;
        m.geometry.dispose();
        const mats = Array.isArray(m.material) ? m.material : [m.material];
        for (const mat of mats) {
          for (const v of Object.values(mat)) if (v instanceof THREE.Texture) v.dispose();
          mat.dispose();
        }
      });
    },
  };
}

/**
 * Ambiente de reflexão próprio: uma sala neutra e quente, com painéis de luz
 * amplos e suaves. Substitui o RoomEnvironment padrão, cujas lâmpadas muito
 * intensas estouravam o inox escovado para branco.
 */
function criarAmbienteDeReflexo(): THREE.Scene {
  const cena = new THREE.Scene();
  const caixa = new THREE.BoxGeometry(1, 1, 1);
  const sala = new THREE.Mesh(
    caixa,
    new THREE.MeshBasicMaterial({ color: new THREE.Color(0x6f6860), side: THREE.BackSide }),
  );
  sala.scale.set(14, 7, 14);
  sala.position.y = 2.5;
  cena.add(sala);

  const piso = new THREE.Mesh(caixa, new THREE.MeshBasicMaterial({ color: new THREE.Color(0x3a2e24) }));
  piso.scale.set(14, 0.1, 14);
  piso.position.y = -0.95;
  cena.add(piso);

  const painel = (cor: number, forca: number, pos: [number, number, number], esc: [number, number, number]) => {
    const m = new THREE.Mesh(caixa, new THREE.MeshBasicMaterial({ color: new THREE.Color(cor).multiplyScalar(forca) }));
    m.position.set(...pos);
    m.scale.set(...esc);
    cena.add(m);
  };
  // Teto claro difuso
  painel(0xfff6ea, 1.6, [0, 5.9, 0], [8, 0.1, 8]);
  // Janela / luz do dia à esquerda do ambiente
  painel(0xeef2f5, 3.2, [-6.8, 2.2, 0], [0.1, 2.6, 5]);
  // Lado aberto (frente e direita): claridade de outros cômodos
  painel(0xf3ece2, 1.3, [0, 2.2, 6.8], [9, 3.2, 0.1]);
  painel(0xf3ece2, 1.0, [6.8, 2.2, -1], [0.1, 3, 7]);
  // Faixa quente (reflexo das fitas de LED no inox e no granito)
  painel(0xffb36b, 2.2, [-1, 3.2, -6.8], [6, 0.25, 0.1]);
  return cena;
}

export interface Pipeline {
  /**
   * completo=true: quadro de repouso — resolução alta e oclusão de ambiente.
   * completo=false: quadro de movimento — resolução menor, render direto.
   */
  render(completo?: boolean): void;
  setSize(largura: number, altura: number): void;
  /** Reduz a resolução usada em movimento (aparelho não acompanhou). */
  reduzirMovimento(): boolean;
  dispose(): void;
}

export interface Resolucao {
  /** Densidade de pixels do quadro parado (nítido). */
  repouso: number;
  /** Densidade de pixels durante o movimento (fluido). */
  movimento: number;
}

/**
 * Renderização progressiva: enquanto a câmera se move, quadros leves em
 * resolução menor; quando para, um único quadro nítido com oclusão de ambiente
 * (GTAO nas qualidades alta e média). Mesma ideia de visualizadores 3D
 * profissionais: fluidez no gesto, qualidade no que fica na tela.
 */
export function criarPipeline(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera,
  qualidade: Qualidade,
  res: Resolucao,
): Pipeline {
  let largura = 1;
  let altura = 1;
  let atual = 0;
  const usar = (dpr: number) => {
    if (dpr === atual) return;
    atual = dpr;
    renderer.setPixelRatio(dpr);
    renderer.setSize(largura, altura, false);
  };
  const reduzirMovimento = () => {
    if (res.movimento <= 0.75) return false;
    res.movimento = Math.max(0.75, res.movimento - 0.25);
    return true;
  };

  if (qualidade === 'baixa') {
    return {
      render: (completo = true) => {
        usar(completo ? res.repouso : res.movimento);
        renderer.render(scene, camera);
      },
      setSize: (w, h) => {
        largura = w;
        altura = h;
        atual = 0;
        usar(res.repouso);
      },
      reduzirMovimento,
      dispose: () => {},
    };
  }

  const alvo = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
  const composer = new EffectComposer(renderer, alvo);
  composer.addPass(new RenderPass(scene, camera, undefined, new THREE.Color(0x000000), 0));
  const ao = new GTAOPass(scene, camera, 1, 1);
  ao.updateGtaoMaterial({ radius: 0.32, distanceExponent: 1.6, thickness: 1.2, scale: 1, samples: qualidade === 'alta' ? 16 : 12 });
  ao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 16 });
  ao.blendIntensity = 0.85;
  composer.addPass(ao);
  composer.addPass(new OutputPass());
  return {
    render: (completo = true) => {
      if (completo) {
        usar(res.repouso);
        composer.render();
      } else {
        // alvos do composer ficam no tamanho de repouso; só o canvas muda
        usar(res.movimento);
        renderer.render(scene, camera);
      }
    },
    setSize: (w, h) => {
      largura = w;
      altura = h;
      atual = 0;
      usar(res.repouso);
      composer.setPixelRatio(res.repouso);
      composer.setSize(w, h);
    },
    reduzirMovimento,
    dispose: () => {
      composer.dispose();
      ao.dispose();
      alvo.dispose();
    },
  };
}
