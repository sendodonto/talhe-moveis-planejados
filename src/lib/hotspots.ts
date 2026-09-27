// Lê, durante o build, os nós HOTSPOT_* do GLB publicado de cada modelo e junta
// com o conteúdo editorial (src/content/<modelo>.ts). Lista de pontos, versão
// sem WebGL e 3D usam a mesma fonte: o próprio modelo.
import { readFileSync } from 'node:fs';
import type { ModeloSite } from '../content/modelos';
import { MODELOS } from '../scripts/visualizador/modelos';
import projecoes from '../data/hotspots-projetados.json';

interface NoGlb {
  name?: string;
  translation?: [number, number, number];
  extras?: { titulo?: string; descricao?: string; animation?: string };
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
  animacao?: string;
  vista: { az: number; polar: number; dist: number };
}

const cache = new Map<string, PontoCompleto[]>();

export function pontosDe(modelo: ModeloSite): PontoCompleto[] {
  const guardado = cache.get(modelo.id);
  if (guardado) return guardado;
  const gltf = lerJsonGlb(`public${MODELOS[modelo.id].arquivo}`);
  const lista = modelo.pontos.map((p, i) => {
    const no = gltf.nodes.find((n) => n.name === p.no);
    if (!no) throw new Error(`Nó ${p.no} não encontrado no GLB de ${modelo.id}`);
    return {
      no: p.no,
      numero: i + 1,
      rotulo: p.rotulo,
      titulo: p.titulo ?? no.extras?.titulo ?? p.rotulo,
      descricao: no.extras?.descricao ?? '',
      detalhes: p.detalhes,
      animacao: no.extras?.animation,
      vista: p.vista,
    };
  });
  cache.set(modelo.id, lista);
  return lista;
}

type Projecao = { largura: number; altura: number; hotspots: { no: string; x: number; y: number; visivel: boolean }[] };

/** Posições dos pontos projetadas numa imagem renderizada (fração 0–1 da largura/altura). */
export function projecaoEm(idImagem: string, modelo: ModeloSite) {
  const p = (projecoes as Record<string, Projecao>)[idImagem];
  if (!p) throw new Error(`Imagem ${idImagem} sem projeção: rode npm run renders`);
  const lista = pontosDe(modelo);
  return p.hotspots
    .filter((h) => h.visivel)
    .map((h) => ({ ...h, ponto: lista.find((l) => l.no === h.no)! }))
    .filter((h) => h.ponto);
}
