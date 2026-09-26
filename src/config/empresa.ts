// ─────────────────────────────────────────────────────────────────────────────
// DADOS DA EMPRESA — edite aqui.
// Tudo marcado com PROVISÓRIO é identidade de apresentação e precisa ser
// substituído pelos dados reais antes de publicar.
// Campos vazios ('') são omitidos do site automaticamente.
// ─────────────────────────────────────────────────────────────────────────────

export interface DadosEmpresa {
  nome: string;
  nomeCompleto: string;
  descricao: string;
  url: string;
  cidade: string;
  uf: string;
  regiaoAtendimento: string;
  endereco: string;
  horario: string;
  cnpj: string;
  contato: { whatsapp: string; telefone: string; email: string; instagram: string };
  formulario: { endpoint: string; camposExtras: Record<string, string> };
}

export const empresa: DadosEmpresa = {
  /** PROVISÓRIO — nome curto, usado no logotipo e nos títulos. */
  nome: 'Talhe',
  /** PROVISÓRIO — nome completo (rodapé, dados estruturados). */
  nomeCompleto: 'Talhe Marcenaria Planejada',
  /** Frase curta para buscadores e compartilhamento. */
  descricao:
    'Móveis planejados sob medida: cozinhas, dormitórios, closets e outros ambientes. Medição no local, projeto em 3D, produção e montagem.',

  /** PROVISÓRIO — endereço público do site (sem barra no final). Também em astro.config.mjs. */
  url: 'https://www.talhe.example',

  /** PROVISÓRIO — cidade-base e região atendida. */
  cidade: 'São Paulo',
  uf: 'SP',
  regiaoAtendimento: 'São Paulo e região metropolitana',

  /** Endereço de oficina/showroom. Deixe '' se não houver atendimento no local. */
  endereco: '',
  /** Ex.: 'Segunda a sexta, das 8h às 18h'. */
  horario: '',
  /** CNPJ, se quiser exibir no rodapé. */
  cnpj: '',

  contato: {
    /** Somente números, com DDI e DDD. Ex.: '5511999999999'. Vazio = WhatsApp oculto. */
    whatsapp: '',
    /** Telefone para exibição e link tel:. Ex.: '(11) 3333-4444'. */
    telefone: '',
    email: '',
    /** Usuário sem @. */
    instagram: '',
  },

  /**
   * Envio do formulário de orçamento.
   * O site é estático: o envio precisa de um serviço de formulários.
   * Funciona com Formspree (https://formspree.io), Web3Forms (https://web3forms.com)
   * ou qualquer endpoint que aceite POST em JSON e responda 2xx.
   *
   *  Formspree:  endpoint: 'https://formspree.io/f/SEU_ID', camposExtras: {}
   *  Web3Forms:  endpoint: 'https://api.web3forms.com/submit',
   *              camposExtras: { access_key: 'SUA_CHAVE' }
   *
   * Sem endpoint, o formulário oferece enviar pelo WhatsApp ou e-mail (se
   * configurados). Nunca é exibida confirmação de envio sem resposta real do serviço.
   */
  formulario: {
    endpoint: '',
    camposExtras: {},
  },
};

export const temWhatsapp = empresa.contato.whatsapp.replace(/\D/g, '').length >= 10;

export function linkWhatsapp(mensagem = ''): string {
  const numero = empresa.contato.whatsapp.replace(/\D/g, '');
  return `https://wa.me/${numero}${mensagem ? `?text=${encodeURIComponent(mensagem)}` : ''}`;
}
