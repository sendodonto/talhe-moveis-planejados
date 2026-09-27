// ─────────────────────────────────────────────────────────────────────────────
// Conteúdo da sala 3D (Sala Carvalho). Título, descrição curta, posição e
// animação de cada ponto vêm dos nós HOTSPOT_* do GLB; aqui ficam o texto
// complementar e o enquadramento de câmera.
// Conceito autoral de apresentação: medidas aproximadas, não é projeto executivo.
// ─────────────────────────────────────────────────────────────────────────────
import type { PontoCozinha as Ponto } from './cozinha';

export const pontos: Ponto[] = [
  {
    no: 'HOTSPOT_Painel',
    rotulo: 'Painel',
    detalhes: [
      'Painel de carvalho claro do piso quase ao teto, com veios verticais e juntas discretas.',
      'Ele marca a área da TV e esconde a fiação que desce até o rack.',
    ],
    vista: { az: 0.5, polar: 1.42, dist: 3.0 },
  },
  {
    no: 'HOTSPOT_Rack',
    rotulo: 'Rack',
    detalhes: [
      'Rack suspenso: o piso fica livre para limpar e o ambiente parece maior.',
      'A porta basculante abre para baixo e dá acesso aos equipamentos, com ventilação no fundo.',
    ],
    vista: { az: 0.25, polar: 1.2, dist: 2.3 },
  },
  {
    no: 'HOTSPOT_HomeOffice',
    rotulo: 'Home office',
    detalhes: [
      'Bancada de trabalho integrada à marcenaria da sala, no mesmo carvalho.',
      'Uma gaveta rasa guarda cabos, carregadores e papéis sem ocupar o tampo.',
    ],
    vista: { az: 0.2, polar: 1.0, dist: 2.1 },
  },
  {
    no: 'HOTSPOT_Cabos',
    rotulo: 'Cabos',
    detalhes: [
      'Passagem de cabos sobre e sob a bancada: monitor, notebook e carregadores sem fio aparente.',
      'As tomadas são posicionadas no projeto, junto com a marcenaria.',
    ],
    vista: { az: 0.35, polar: 0.95, dist: 1.9 },
  },
  {
    no: 'HOTSPOT_Nichos',
    rotulo: 'Nichos',
    detalhes: [
      'Estante com prateleiras e LED quente embutido para livros e objetos.',
      'A luz da estante funciona como iluminação de apoio da sala à noite.',
    ],
    vista: { az: -0.15, polar: 1.42, dist: 2.5 },
  },
  {
    no: 'HOTSPOT_Acabamentos',
    rotulo: 'Acabamentos',
    detalhes: [
      'Carvalho claro acetinado combinado com laca areia: madeira onde se toca, cor lisa nas frentes.',
      'A mesma paleta aparece no painel, no rack e na bancada, ligando os dois usos da sala.',
    ],
    vista: { az: 0.3, polar: 1.25, dist: 2.3 },
  },
];

export const materiais = [
  { nome: 'Carvalho claro acetinado', uso: 'Painel, bancada e prateleiras', cor: '#c49a6c' },
  { nome: 'Laca areia acetinada', uso: 'Frentes do rack', cor: '#d8c7ad' },
  { nome: 'Metal grafite', uso: 'Puxadores e detalhes', cor: '#3f4144' },
  { nome: 'LED 3000 K', uso: 'Estante e prateleira da bancada', cor: '#f0b36b' },
  { nome: 'Linho natural', uso: 'Sofá e almofadas', cor: '#cfc2ad' },
  { nome: 'Tapete de trama natural', uso: 'Área de estar', cor: '#b8a584' },
];
