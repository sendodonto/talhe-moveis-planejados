// ─────────────────────────────────────────────────────────────────────────────
// Etapas de atendimento. VALIDAR COM A EMPRESA: o texto descreve um fluxo usual
// de marcenaria sob medida e deve refletir o que a empresa de fato faz.
// Não inclua prazos, garantias ou números que não possam ser cumpridos.
// ─────────────────────────────────────────────────────────────────────────────

export interface Etapa {
  numero: string;
  titulo: string;
  resumo: string;
  texto: string;
  voceRecebe: string[];
  precisamos: string[];
}

export const etapas: Etapa[] = [
  {
    numero: '01',
    titulo: 'Conversa',
    resumo: 'Entendemos o ambiente, o uso e o momento da obra.',
    texto:
      'Pode começar pelo formulário ou pelo WhatsApp. Perguntamos quais ambientes entram, em que fase está a obra e o que não funciona hoje. Com planta e fotos já dá para uma primeira conversa sobre caminhos e materiais.',
    voceRecebe: ['Retorno sobre o que é viável', 'Agendamento da visita técnica'],
    precisamos: ['Planta do imóvel, se houver', 'Fotos atuais do ambiente', 'Lista de eletrodomésticos que vão ficar'],
  },
  {
    numero: '02',
    titulo: 'Medição',
    resumo: 'Levantamento no local, com as medidas reais.',
    texto:
      'Vamos até o imóvel medir paredes, vãos, pé-direito, esquadro e prumo. Também registramos pontos de água, gás, elétrica, janelas e interruptores — é isso que define onde cada módulo pode ficar.',
    voceRecebe: ['Levantamento do ambiente', 'Observações sobre ajustes de obra, se necessários'],
    precisamos: ['Acesso ao imóvel', 'Informação sobre o que ainda vai mudar na obra'],
  },
  {
    numero: '03',
    titulo: 'Projeto',
    resumo: 'Layout, 3D, materiais e orçamento detalhado.',
    texto:
      'Desenhamos a planta e o 3D do ambiente com as medidas levantadas. Você vê a distribuição, as aberturas e os acabamentos antes da produção. Ajustamos o que for preciso e fechamos o orçamento com a lista de materiais e ferragens.',
    voceRecebe: ['Projeto em 3D e planta', 'Amostras de acabamento', 'Orçamento item a item'],
    precisamos: ['Aprovação do layout e dos acabamentos'],
  },
  {
    numero: '04',
    titulo: 'Produção e montagem',
    resumo: 'Conferência final, fabricação e instalação.',
    texto:
      'Antes do corte, as medidas são conferidas de novo com a obra pronta para receber os móveis. Depois da produção, a equipe monta, nivela, regula portas e gavetas e deixa o ambiente limpo, com orientação de uso e cuidados.',
    voceRecebe: ['Montagem e regulagem', 'Orientações de uso e limpeza'],
    precisamos: ['Piso, revestimentos e pontos elétricos concluídos', 'Ambiente livre para a equipe'],
  },
];

export const perguntas = [
  {
    p: 'Preciso ter a planta do imóvel?',
    r: 'Ajuda, mas não é obrigatório. A medição no local é o que vale para o projeto; a planta serve para a primeira conversa.',
  },
  {
    p: 'Quanto tempo leva?',
    r: 'Depende dos ambientes, dos materiais e da fila de produção. O prazo é informado por escrito no orçamento, antes de você fechar.',
  },
  {
    p: 'Posso orçar só um ambiente?',
    r: 'Sim. Muitos projetos começam pela cozinha ou por um guarda-roupa e seguem depois para o resto da casa.',
  },
  {
    p: 'Meus eletrodomésticos já estão comprados. Tudo bem?',
    r: 'Melhor ainda: com modelo e medidas em mãos, os nichos e a torre são desenhados exatamente para eles.',
  },
  {
    p: 'A obra ainda não terminou. Já dá para começar?',
    r: 'Dá para conversar e desenvolver o projeto. A conferência final das medidas é feita com a obra pronta para receber os móveis.',
  },
];
