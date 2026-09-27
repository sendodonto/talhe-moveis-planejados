// ─────────────────────────────────────────────────────────────────────────────
// Ambientes em 3D do site. Cada item vira uma página em /projetos/<slug>.
// Configuração técnica (câmera, limites, luzes) fica em
// src/scripts/visualizador/modelos.ts; aqui ficam textos, imagens e pontos.
// Para acrescentar um ambiente: otimize o GLB (npm run modelo), configure em
// modelos.ts, gere as imagens (npm run renders) e adicione um item abaixo.
// ─────────────────────────────────────────────────────────────────────────────
import type { ImageMetadata } from 'astro';
import type { PontoCozinha as Ponto } from './cozinha';
import * as cozinha from './cozinha';
import * as closet from './closet';
import * as sala from './sala';

import cozinhaInicial from '../assets/renders/vista-inicial.png';
import cozinhaRetrato from '../assets/renders/vista-inicial-retrato.png';
import cozinhaBancada from '../assets/renders/detalhe-bancada.png';
import cozinhaLed from '../assets/renders/detalhe-led.png';
import cozinhaRipado from '../assets/renders/detalhe-ripado.png';
import closetInicial from '../assets/renders/closet-inicial.png';
import closetRetrato from '../assets/renders/closet-inicial-retrato.png';
import closetIlha from '../assets/renders/closet-ilha.png';
import closetArmarios from '../assets/renders/closet-armarios.png';
import closetSapateira from '../assets/renders/closet-sapateira.png';
import salaInicial from '../assets/renders/sala-inicial.png';
import salaRetrato from '../assets/renders/sala-inicial-retrato.png';
import salaRack from '../assets/renders/sala-rack.png';
import salaHome from '../assets/renders/sala-homeoffice.png';
import salaEstar from '../assets/renders/sala-estar.png';

export interface Material {
  nome: string;
  uso: string;
  cor: string;
}

export interface ModeloSite {
  /** Chave em src/scripts/visualizador/modelos.ts */
  id: 'cozinha' | 'closet' | 'sala';
  slug: string;
  /** Ambiente em src/content/ambientes.ts (liga ao orçamento e à página de ambientes). */
  ambiente: string;
  /** Nome curto do estudo, ex.: "Cozinha em U". */
  nome: string;
  titulo: string;
  lead: string;
  seo: string;
  alt: string;
  tamanho: string;
  /** ids das imagens em src/data/hotspots-projetados.json */
  poster: { paisagem: ImageMetadata; retrato: ImageMetadata; idPaisagem: string; idRetrato: string };
  detalhes: { src: ImageMetadata; legenda: string; alt: string }[];
  pontos: Ponto[];
  materiais: Material[];
  /** Texto do botão de orçamento. */
  cta: string;
  /** Aviso de honestidade sobre a origem do modelo (sem o nome da empresa). */
  aviso: string;
}

const AVISO_CONCEITO = 'Conceito de apresentação com medidas aproximadas. Não é projeto executivo nem uma obra executada';

export const modelos: ModeloSite[] = [
  {
    id: 'cozinha',
    slug: 'cozinha-em-u',
    ambiente: 'cozinha',
    nome: 'Cozinha em U',
    titulo: 'Cozinha em U: grafite, madeira e granito preto.',
    lead: 'Gire, aproxime e toque nos números para ver cada decisão do projeto.',
    seo: 'Explore em 3D uma cozinha em U com armários grafite até o teto, faixa amadeirada com LED, bancada de granito preto e península ripada.',
    alt: 'Cozinha em U vista da entrada: aéreos grafite até o teto, faixa amadeirada com LED, bancada de granito preto com cuba sob a janela e península com ripado de madeira.',
    tamanho: '3 MB',
    poster: { paisagem: cozinhaInicial, retrato: cozinhaRetrato, idPaisagem: 'vista-inicial', idRetrato: 'vista-inicial-retrato' },
    detalhes: [
      { src: cozinhaBancada, legenda: 'Granito preto, cooktop e forno alinhados', alt: 'Bancada de granito preto polido com cooktop de embutir e forno de inox abaixo.' },
      { src: cozinhaLed, legenda: 'Faixa amadeirada com LED quente', alt: 'Faixa de portas amadeiradas com fita de LED embutida iluminando o revestimento branco.' },
      { src: cozinhaRipado, legenda: 'Ripado vertical na península', alt: 'Ripas verticais de madeira na face externa da península, sob o tampo de granito.' },
    ],
    pontos: cozinha.pontos,
    materiais: cozinha.materiais,
    cta: 'Quero uma cozinha assim',
    aviso: 'Reconstrução a partir de uma referência visual, com medidas aproximadas. Não é uma obra executada',
  },
  {
    id: 'closet',
    slug: 'closet-nogueira',
    ambiente: 'closet',
    nome: 'Closet Nogueira',
    titulo: 'Closet Nogueira: madeira, vidro fumê e luz embutida.',
    lead: 'Gire, aproxime e toque nos números. Nos pontos da porta e da gaveta, veja os dois abrirem.',
    seo: 'Explore em 3D um closet em nogueira com porta de vidro fumê, ilha com gaveta de acessórios, sapateira e iluminação de LED embutida.',
    alt: 'Closet em L de nogueira: sapateira e prateleiras à esquerda, cabideiros e porta de vidro fumê ao fundo, ilha com gavetas no centro.',
    tamanho: '3,6 MB',
    poster: { paisagem: closetInicial, retrato: closetRetrato, idPaisagem: 'closet-inicial', idRetrato: 'closet-inicial-retrato' },
    detalhes: [
      { src: closetIlha, legenda: 'Gaveta da ilha com divisórias', alt: 'Gaveta da ilha aberta com bandeja forrada e divisórias para acessórios.' },
      { src: closetArmarios, legenda: 'Porta de vidro fumê aberta', alt: 'Porta de vidro fumê aberta mostrando cabideiros com camisas e iluminação lateral.' },
      { src: closetSapateira, legenda: 'Sapateira e roupas dobradas', alt: 'Prateleiras de nogueira com sapatos embaixo e roupas dobradas em cima.' },
    ],
    pontos: closet.pontos,
    materiais: closet.materiais,
    cta: 'Quero um closet assim',
    aviso: AVISO_CONCEITO,
  },
  {
    id: 'sala',
    slug: 'sala-carvalho',
    ambiente: 'sala',
    nome: 'Sala Carvalho',
    titulo: 'Sala Carvalho: estar e home office na mesma parede.',
    lead: 'Gire, aproxime e toque nos números. Nos pontos do rack e da bancada, veja a porta e a gaveta abrirem.',
    seo: 'Explore em 3D uma sala com painel de carvalho, rack suspenso, bancada de home office integrada e estante com LED.',
    alt: 'Sala com painel de carvalho e TV, rack suspenso, bancada de home office com estante iluminada, sofá de linho e janela ampla com cortinas.',
    tamanho: '3 MB',
    poster: { paisagem: salaInicial, retrato: salaRetrato, idPaisagem: 'sala-inicial', idRetrato: 'sala-inicial-retrato' },
    detalhes: [
      { src: salaRack, legenda: 'Rack com porta basculante aberta', alt: 'Rack suspenso com a porta basculante aberta mostrando o equipamento interno.' },
      { src: salaHome, legenda: 'Bancada com gaveta aberta', alt: 'Bancada de home office em carvalho com gaveta rasa aberta e notebook sobre o tampo.' },
      { src: salaEstar, legenda: 'Área de estar', alt: 'Sofá de linho, mesa de centro e tapete de trama natural diante da janela.' },
    ],
    pontos: sala.pontos,
    materiais: sala.materiais,
    cta: 'Quero uma sala assim',
    aviso: AVISO_CONCEITO,
  },
];

export const modeloPorAmbiente = (ambiente: string) => modelos.find((m) => m.ambiente === ambiente);
