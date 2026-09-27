// ─────────────────────────────────────────────────────────────────────────────
// Conteúdo do closet 3D (Closet Nogueira). Título, descrição curta, posição e
// animação de cada ponto vêm dos nós HOTSPOT_* do GLB; aqui ficam o texto
// complementar e o enquadramento de câmera.
// Conceito autoral de apresentação: medidas aproximadas, não é projeto executivo.
// ─────────────────────────────────────────────────────────────────────────────
import type { PontoCozinha as Ponto } from './cozinha';

export const pontos: Ponto[] = [
  {
    no: 'HOTSPOT_Madeira',
    rotulo: 'Nogueira',
    detalhes: [
      'Nogueira natural com acabamento acetinado nas faces externas, sem brilho que marque o toque.',
      'Os veios seguem contínuos de um módulo para o outro, como uma peça só.',
      'Por dentro, um tom de nogueira mais claro facilita enxergar as roupas.',
    ],
    vista: { az: 0.75, polar: 1.4, dist: 2.6 },
  },
  {
    no: 'HOTSPOT_PortaVidro',
    rotulo: 'Porta de vidro',
    detalhes: [
      'Porta de vidro fumê com perfil de alumínio grafite: protege da poeira e deixa ver o que está guardado.',
      'O puxador metálico acompanha a altura da mão.',
    ],
    vista: { az: 0.35, polar: 1.42, dist: 2.7 },
  },
  {
    no: 'HOTSPOT_GavetaIlha',
    rotulo: 'Gaveta da ilha',
    detalhes: [
      'A ilha central tem uma gaveta rasa com bandeja forrada e divisórias para relógios, óculos e acessórios.',
      'O tampo da ilha serve de apoio para dobrar e separar roupas.',
    ],
    vista: { az: 0.3, polar: 0.95, dist: 2.0 },
  },
  {
    no: 'HOTSPOT_Sapateira',
    rotulo: 'Sapateira',
    detalhes: [
      'Prateleiras abertas para pares de sapatos, na altura em que dá para ver e pegar sem abaixar muito.',
      'O mesmo módulo guarda roupas dobradas e objetos nas prateleiras de cima.',
      'Um espelho de corpo inteiro fecha a lateral.',
    ],
    vista: { az: 1.35, polar: 1.32, dist: 2.3 },
  },
  {
    no: 'HOTSPOT_Iluminacao',
    rotulo: 'Iluminação',
    detalhes: [
      'Perfis de LED de luz quente embutidos nas laterais dos módulos iluminam o interior de cima a baixo.',
      'Luz na própria marcenaria: nada de sombra da pessoa sobre as roupas.',
      'A temperatura final da luz é definida no projeto elétrico.',
    ],
    vista: { az: 0.2, polar: 1.55, dist: 2.4 },
  },
  {
    no: 'HOTSPOT_Cabideiros',
    rotulo: 'Cabideiros',
    detalhes: [
      'Módulos com cabideiros em alturas diferentes: roupas curtas em dois níveis e um vão alto para vestidos e casacos.',
      'A divisão interna nasce do inventário do que você guarda.',
    ],
    vista: { az: 0.1, polar: 1.48, dist: 2.4 },
  },
];

export const materiais = [
  { nome: 'Nogueira natural acetinada', uso: 'Portas, laterais e ilha', cor: '#6b4a32' },
  { nome: 'Nogueira interior', uso: 'Fundos e prateleiras internas', cor: '#8b6647' },
  { nome: 'Vidro fumê', uso: 'Porta do módulo de cabideiros', cor: '#3b3a38' },
  { nome: 'Alumínio grafite', uso: 'Perfis da porta e dos LEDs', cor: '#4a4c4f' },
  { nome: 'Metal champanhe', uso: 'Puxadores e cabideiros', cor: '#b99d74' },
  { nome: 'LED quente 3000 K', uso: 'Iluminação embutida nos módulos', cor: '#f0b36b' },
];
