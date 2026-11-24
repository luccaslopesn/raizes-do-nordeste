export type Canal = 'app' | 'totem' | 'balcao' | 'web';

export type FormatoUnidade = 'completa' | 'reduzida';

export interface Unidade {
  id: string;
  nome: string;
  cidade: string;
  uf: string;
  regiao: 'nordeste' | 'sudeste' | 'sul' | 'centro-oeste' | 'norte';
  formato: FormatoUnidade;
  horarioAbertura: string; // "06:00"
  horarioFechamento: string; // "22:00"
}

export type CategoriaProduto = 'tapiocas' | 'cuscuz' | 'bolos' | 'bebidas' | 'cafe-da-manha';

export interface Produto {
  id: string;
  nome: string;
  descricao: string;
  categoria: CategoriaProduto;
  precoBase: number;
  /** Só disponível em unidades de cozinha completa */
  exigeCozinhaCompleta: boolean;
  /** Janela sazonal (ex.: período junino), formato MM-DD */
  sazonal?: { inicio: string; fim: string; rotulo: string };
  /** Ajuste de preço ou receita por região */
  variacoesRegionais?: Partial<Record<Unidade['regiao'], { preco?: number; observacao?: string }>>;
}

/** Produto já resolvido para uma unidade específica */
export interface ItemCardapio {
  produto: Produto;
  preco: number;
  disponivel: boolean;
  motivoIndisponivel?: 'esgotado' | 'fora-de-temporada' | 'formato-da-unidade';
  observacaoRegional?: string;
}

export interface ItemCarrinho {
  produtoId: string;
  nome: string;
  precoUnitario: number;
  quantidade: number;
  observacao?: string;
}

export type StatusPedido =
  | 'aguardando-pagamento'
  | 'recebido'
  | 'em-preparo'
  | 'pronto'
  | 'retirado'
  | 'cancelado';

export type StatusPagamento = 'pendente' | 'aprovado' | 'recusado' | 'expirado';

export type FormaPagamento = 'pix' | 'cartao-credito' | 'cartao-debito';

export interface Pedido {
  id: string;
  codigoRetirada: string;
  unidadeId: string;
  canal: Canal;
  clienteId?: string;
  itens: ItemCarrinho[];
  subtotal: number;
  desconto: number;
  total: number;
  pontosGerados: number;
  pontosResgatados: number;
  campanhaAplicadaId?: string;
  recompensaAplicadaId?: string;
  /** Primeiro nome ou apelido, exibido na chamada do balcão */
  nomeChamada?: string;
  status: StatusPedido;
  cancelamento?: { motivo: string; por: PerfilOperacao; em: string };
  pagamento: {
    forma: FormaPagamento;
    status: StatusPagamento;
    chaveIdempotencia: string;
    transacaoId?: string;
    motivoRecusa?: string;
  };
  criadoEm: string;
  historico: { status: StatusPedido; em: string }[];
}

export interface Consentimentos {
  termosEPrivacidade: boolean; // obrigatório para cadastro
  programaFidelidade: boolean; // opcional
  marketingSegmentado: boolean; // opcional
  atualizadoEm: string;
}

export type PerfilOperacao = 'atendente' | 'cozinha' | 'gerente' | 'sistema';

export interface RegistroAuditoria {
  id: string;
  em: string;
  unidadeId: string;
  perfil: PerfilOperacao;
  acao: 'cancelamento' | 'desconto-campanha' | 'resgate-recompensa' | 'status-alterado';
  pedidoId: string;
  detalhe: string;
}

export interface Cliente {
  id: string;
  /** Hash simulado: o protótipo nunca guarda a senha em texto puro */
  senhaHash: string;
  nome: string;
  email: string;
  telefone?: string;
  dataNascimento?: string; // só coletada com consentimento de fidelidade
  pontos: number;
  consentimentos: Consentimentos;
  criadoEm: string;
}

export interface Campanha {
  id: string;
  titulo: string;
  descricao: string;
  tipo: 'percentual' | 'valor-fixo' | 'pontos-em-dobro';
  valor: number;
  /** Campanha segmentada só aparece para quem consentiu marketing */
  segmentada: boolean;
  unidadesIds?: string[]; // vazio = toda a rede
  validaAte: string;
}

export interface Recompensa {
  id: string;
  titulo: string;
  custoPontos: number;
  descontoEmReais: number;
}
