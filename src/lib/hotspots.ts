// Lê, durante o build, os nós HOTSPOT_* do GLB publicado e junta com o conteúdo
// editorial de src/content/cozinha.ts. Assim a lista de pontos, a versão sem
// WebGL e o 3D usam a mesma fonte: o próprio modelo.
import { readFileSync } from 'node:fs';
import { pontos } from '../content/cozinha';
import projecoes from '../data/hotspots-projetados.json';

export const URL_MODELO = '/modelos/cozinha.glb';

interface NoGlb {
  name?: string;
  translation?: [number, number, number];
  extras?: { titulo?: string; descricao?: string };
}

function lerJsonGlb(caminho: string) {
  const buf = readFileSync(caminho);
  if (buf.toString('ascii', 0, 4) !== 'glTF') throw new Error(`${caminho} não é um GLB`);
  const tamanho = buf.readUInt32LE(12);
  return JSON.parse(buf.toString('utf8', 20, 20 + tamanho)) as { nodes: NoGlb[] };
}

export interface PontoCompleto {
  no: string;
  numero: number;
  rotulo: string;
  titulo: string;
  descricao: string;
  detalhes: string[];
  posicao: [number, number, number];
  vista: { az: number; polar: number; dist: number };
}

let cache: PontoCompleto[] | undefined;

export function pontosDaCozinha(): PontoCompleto[] {
  if (cache) return cache;
  const gltf = lerJsonGlb(`public${URL_MODELO}`);
  cache = pontos.map((p, i) => {
    const no = gltf.nodes.find((n) => n.name === p.no);
    if (!no) throw new Error(`Nó ${p.no} não encontrado no GLB`);
    return {
      no: p.no,
      numero: i + 1,
      rotulo: p.rotulo,
      titulo: p.titulo ?? no.extras?.titulo ?? p.rotulo,
      descricao: no.extras?.descricao ?? '',
      detalhes: p.detalhes,
      posicao: no.translation ?? [0, 0, 0],
      vista: p.vista,
    };
  });
  return cache;
}

type Projecao = { largura: number; altura: number; hotspots: { no: string; x: number; y: number; visivel: boolean }[] };

/** Posições dos pontos projetadas numa imagem renderizada (fração 0–1 da largura/altura). */
export function projecaoEm(idImagem: keyof typeof projecoes) {
  const p = (projecoes as Record<string, Projecao>)[idImagem];
  const lista = pontosDaCozinha();
  return p.hotspots
    .filter((h) => h.visivel)
    .map((h) => ({ ...h, ponto: lista.find((l) => l.no === h.no)! }))
    .filter((h) => h.ponto);
}
