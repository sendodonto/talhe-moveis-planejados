// ─────────────────────────────────────────────────────────────────────────────
// Ambientes atendidos. A ordem aqui é a ordem no site.
//
// IMAGENS: as fotos atuais são REFERÊNCIAS DE ESTILO do Unsplash (licença
// Unsplash: uso comercial permitido, sem obrigação de crédito — mesmo assim
// creditamos). Elas são sempre identificadas no site como referência e NÃO
// representam obras da empresa. Quando houver fotos de obras próprias, troque
// `imagem` e mude `tipoImagem` para 'obra'.
// ─────────────────────────────────────────────────────────────────────────────
import type { ImageMetadata } from 'astro';
import cozinha from '../assets/fotos/cat-cozinha.jpg';
import dormitorio from '../assets/fotos/cat-dormitorio.jpg';
import closet from '../assets/fotos/cat-closet.jpg';
import sala from '../assets/fotos/cat-sala.jpg';
import homeOffice from '../assets/fotos/cat-home-office.jpg';
import banheiro from '../assets/fotos/cat-banheiro.jpg';
import creditos from '../data/creditos-fotos.json';

export type TipoImagem = 'estudo3d' | 'referencia' | 'obra';

export interface Ambiente {
  id: string;
  nome: string;
  /** Nome no singular para frases ("Orçar uma cozinha"). */
  singular: string;
  chamada: string;
  texto: string;
  inclui: string[];
  decidir: string[];
  imagem: ImageMetadata;
  alt: string;
  tipoImagem: TipoImagem;
  /** Chave em src/data/creditos-fotos.json (fotos de referência). */
  credito?: keyof typeof creditos;
  /** Posição do recorte da foto (object-position) no celular. */
  focoCelular?: string;
}

export const ambientes: Ambiente[] = [
  {
    id: 'cozinha',
    nome: 'Cozinhas',
    singular: 'cozinha',
    chamada: 'Da torre quente à ilha, tudo na altura das suas mãos.',
    texto:
      'A cozinha é onde o desenho mais depende da obra: pontos de água, gás e tomadas, medidas dos eletrodomésticos e a sequência de trabalho entre geladeira, pia e fogão. Começamos por aí, antes de escolher acabamento.',
    inclui: [
      'Armários inferiores com gavetas e portas',
      'Aéreos até o teto ou com nicho iluminado',
      'Torre para forno e micro-ondas',
      'Península ou ilha com assentos',
      'Paneleiros, despenseiro e lixeira embutida',
    ],
    decidir: [
      'Quais eletrodomésticos entram e com que medidas',
      'Tipo de bancada (granito, quartzo, porcelanato)',
      'Puxador aparente, cava ou abertura por toque',
      'Iluminação sob os aéreos',
    ],
    imagem: cozinha,
    alt: 'Cozinha clara com armários até o teto, torre de fornos e ilha revestida de madeira com banquetas.',
    tipoImagem: 'referencia',
    credito: 'cat-cozinha',
  },
  {
    id: 'dormitorio',
    nome: 'Dormitórios',
    singular: 'dormitório',
    chamada: 'Guarda-roupa de parede a parede, sem um palmo desperdiçado.',
    texto:
      'No quarto, o guarda-roupa ocupa a parede inteira e decide a circulação. Definimos portas de correr ou de abrir pelo espaço livre em frente, e a divisão interna pelo que você realmente guarda.',
    inclui: [
      'Guarda-roupa de piso a teto',
      'Cabeceira e painel com criados integrados',
      'Escrivaninha ou penteadeira',
      'Quartos infantis que acompanham a idade',
    ],
    decidir: [
      'Portas de correr ou de abrir',
      'Proporção entre cabideiro, gavetas e prateleiras',
      'Espelho, iluminação interna e tomadas na cabeceira',
    ],
    imagem: dormitorio,
    alt: 'Quarto com parede inteira de guarda-roupa em tom areia e painel de madeira com penteadeira.',
    tipoImagem: 'referencia',
    credito: 'cat-dormitorio',
  },
  {
    id: 'closet',
    nome: 'Closets',
    singular: 'closet',
    chamada: 'Cada cabide, sapato e gaveta com lugar marcado.',
    texto:
      'Um closet bem resolvido é quase só medida: altura de cabide para peças longas e curtas, profundidade de sapateira, gaveta para acessórios. Fazemos esse inventário com você antes de desenhar.',
    inclui: [
      'Módulos abertos com cabideiros em dois níveis',
      'Sapateiras e gaveteiros com divisórias',
      'Maleiro no alto para itens de uso eventual',
      'Iluminação em LED nas prateleiras',
    ],
    decidir: [
      'Aberto, com portas ou com vidro',
      'Ilha central, se houver espaço',
      'Espelho e bancada de apoio',
    ],
    imagem: closet,
    alt: 'Closet em madeira clara com sapateira aberta, cabideiro e gaveta de vidro para acessórios.',
    tipoImagem: 'referencia',
    credito: 'cat-closet',
  },
  {
    id: 'sala',
    nome: 'Salas',
    singular: 'sala',
    chamada: 'Painel, rack e estante que escondem fios e mostram o que importa.',
    texto:
      'Na sala, a marcenaria organiza fios, equipamentos e objetos. Painel ripado, rack suspenso e estante são desenhados junto com a posição da TV, das tomadas e da iluminação.',
    inclui: [
      'Painel para TV com passagem de fios',
      'Rack suspenso ou apoiado',
      'Estantes e nichos',
      'Bar ou adega',
    ],
    decidir: ['Tamanho e altura da TV', 'Ventilação para equipamentos', 'Ripado, laca ou madeira lisa'],
    imagem: sala,
    alt: 'Estante embutida com nichos iluminados, objetos de cerâmica e livros.',
    tipoImagem: 'referencia',
    credito: 'cat-sala',
  },
  {
    id: 'home-office',
    nome: 'Home office',
    singular: 'home office',
    chamada: 'A bancada na medida do seu monitor e do seu dia inteiro.',
    texto:
      'Para trabalhar em casa, a bancada precisa da profundidade certa para o monitor e de passagem de cabos. Estantes e gaveteiros entram conforme o que fica à vista e o que precisa ser guardado.',
    inclui: ['Bancada com passa-fios', 'Estantes até o teto', 'Gaveteiro com chave', 'Armário para impressora e arquivos'],
    decidir: ['Profundidade e altura da bancada', 'Posição em relação à janela', 'Iluminação de trabalho'],
    imagem: homeOffice,
    alt: 'Home office com bancada embutida, prateleiras e armário alto em tons de areia.',
    tipoImagem: 'referencia',
    credito: 'cat-home-office',
  },
  {
    id: 'banheiro',
    nome: 'Banheiros e lavabos',
    singular: 'banheiro',
    chamada: 'Gabinetes feitos para conviver com água e vapor.',
    texto:
      'No banheiro, a marcenaria convive com umidade. Escolhemos chapas e ferragens adequadas e desenhamos o gabinete em torno da cuba, do sifão e dos pontos de água.',
    inclui: ['Gabinete suspenso sob a cuba', 'Armário com espelho', 'Nichos e prateleiras', 'Painéis para lavabo'],
    decidir: ['Cuba de apoio ou embutida', 'Gavetas ou portas no gabinete', 'Iluminação do espelho'],
    imagem: banheiro,
    alt: 'Banheiro em tons de pedra com gabinete suspenso de madeira clara e armário com espelho.',
    tipoImagem: 'referencia',
    credito: 'cat-banheiro',
  },
];

export const outros = 'Lavanderia, varanda gourmet e áreas comerciais também podem ser orçadas.';

export function creditoDe(chave?: string) {
  if (!chave) return undefined;
  return (creditos as Record<string, { autor: string; pagina: string }>)[chave];
}
