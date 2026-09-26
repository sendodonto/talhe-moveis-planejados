// ─────────────────────────────────────────────────────────────────────────────
// Conteúdo da cozinha 3D.
// O título e a descrição curta de cada ponto vêm dos próprios nós HOTSPOT_* do
// GLB (propriedades "titulo" e "descricao"); a posição também vem do GLB.
// Aqui ficam apenas o texto complementar e o enquadramento de câmera de cada ponto.
// ─────────────────────────────────────────────────────────────────────────────
import type { Orbita } from '../scripts/visualizador/camera';

export interface PontoCozinha {
  /** Nome do nó no GLB. */
  no: string;
  /** Rótulo curto para listas e chips (celular). */
  rotulo: string;
  /** Substitui o título do GLB, se preenchido. */
  titulo?: string;
  detalhes: string[];
  /** Enquadramento ao selecionar. O alvo é sempre a posição real do nó. */
  vista: Omit<Orbita, 'alvo'>;
}

export const pontos: PontoCozinha[] = [
  {
    no: 'HOTSPOT_Armarios',
    rotulo: 'Armários',
    detalhes: [
      'Aéreos contínuos em L, do alto da faixa de madeira até o teto: não sobra vão para acumular poeira em cima dos armários.',
      'Portas lisas, sem puxador aparente. Nos módulos de baixo, a abertura é por cava na mesma cor.',
      'Acabamento acetinado: reflete menos que o laca brilho e marca menos com o toque.',
    ],
    vista: { az: 0.22, polar: 1.55, dist: 2.7 },
  },
  {
    no: 'HOTSPOT_Iluminacao',
    rotulo: 'Madeira e LED',
    detalhes: [
      'Uma faixa de portas amadeiradas separa os aéreos grafite do revestimento e aquece o conjunto.',
      'Sob a faixa, fita de LED em perfil com difusor ilumina a bancada de trabalho sem sombra da cabeça de quem cozinha.',
      'No modelo, a luz é quente (3000 K). A temperatura final é definida no projeto elétrico.',
      'A mesma faixa forma o nicho do micro-ondas, na altura dos olhos.',
    ],
    vista: { az: 0.3, polar: 1.5, dist: 2.1 },
  },
  {
    no: 'HOTSPOT_Bancada',
    rotulo: 'Granito',
    detalhes: [
      'Tampo de granito preto polido em U: pia, cocção e península no mesmo plano.',
      'Frontão baixo de granito protege a parede na linha da bancada; acima dele, revestimento claro.',
      'Cooktop de embutir e forno sob a bancada, alinhados entre si.',
      'A pedra exata depende de disponibilidade e da aprovação de amostra.',
    ],
    vista: { az: 0.55, polar: 1.05, dist: 2.1 },
  },
  {
    no: 'HOTSPOT_Peninsula',
    rotulo: 'Península',
    detalhes: [
      'Do lado de fora, voltado para a circulação, ripas verticais amadeiradas.',
      'Do lado de dentro, portas e gavetas aproveitam toda a profundidade do móvel.',
      'O granito desce até o piso na cabeceira, em “cascata”, e protege a quina.',
      'Dois pendentes retangulares iluminam a península.',
    ],
    vista: { az: 1.3, polar: 1.3, dist: 2.6 },
  },
  {
    no: 'HOTSPOT_Cuba',
    rotulo: 'Cuba',
    detalhes: [
      'Cuba de inox embutida sob a janela, com luz natural sobre a área de lavagem.',
      'Torneira de arco alto: sobra espaço para encher e lavar panelas grandes.',
      'Escorredor e utensílios ficam na bancada lateral, longe do cooktop.',
    ],
    vista: { az: 1.2, polar: 0.95, dist: 1.9 },
  },
];

/** Medidas aproximadas, lidas da geometria do modelo. Não são projeto executivo. */
export const medidasAproximadas = [
  { item: 'Largura interna entre paredes', valor: '≈ 2,9 m' },
  { item: 'Comprimento da península', valor: '≈ 2,6 m' },
  { item: 'Altura da bancada', valor: '≈ 0,90 m' },
  { item: 'Pé-direito', valor: '≈ 2,75 m' },
];

export const materiais = [
  { nome: 'MDF grafite acetinado', uso: 'Portas, gavetas e aéreos até o teto', cor: '#23292c' },
  { nome: 'Amadeirado', uso: 'Faixa central, nicho do micro-ondas e ripado', cor: '#8a5a2e' },
  { nome: 'Granito preto polido', uso: 'Bancadas, frontão e cascata da península', cor: '#0f0f10' },
  { nome: 'Inox escovado', uso: 'Cuba, eletrodomésticos e perfis de LED', cor: '#8e9296' },
  { nome: 'LED 3000 K', uso: 'Fita sob a faixa amadeirada e pendentes', cor: '#f0b36b' },
  { nome: 'Revestimento branco acetinado', uso: 'Parede entre bancada e faixa', cor: '#dcdad2' },
];
