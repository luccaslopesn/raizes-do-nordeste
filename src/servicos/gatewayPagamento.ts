import type { FormaPagamento, StatusPagamento } from '../dominio/tipos';
import { esperar } from './latencia';

/**
 * Simula o serviço EXTERNO de pagamento. O sistema da rede não processa
 * pagamento: só solicita, recebe a resposta, registra e atualiza o pedido.
 *
 * O cenário pode ser forçado para demonstrar os fluxos alternativos
 * (útil na correção e no plano de testes):
 *   ?pagamento=recusar | ?pagamento=expirar | ?pagamento=instavel
 */
export type CenarioPagamento = 'aprovar' | 'recusar' | 'expirar' | 'instavel';

export interface SolicitacaoPagamento {
  chaveIdempotencia: string;
  valor: number;
  forma: FormaPagamento;
}

export interface RespostaPagamento {
  status: Exclude<StatusPagamento, 'pendente'>;
  transacaoId?: string;
  motivoRecusa?: string;
}

export const TEMPO_LIMITE_PAGAMENTO_MS = 8000;

/** Respostas já dadas por chave: impede cobrança duplicada em retry ou clique duplo */
const respostasPorChave = new Map<string, Promise<RespostaPagamento>>();
let tentativasInstavel = 0;

export function lerCenarioPagamento(): CenarioPagamento {
  try {
    const valor = new URLSearchParams(window.location.search).get('pagamento');
    if (valor === 'recusar' || valor === 'expirar' || valor === 'instavel') return valor;
  } catch {
    /* fora do navegador */
  }
  return 'aprovar';
}

async function processarNoProvedor(req: SolicitacaoPagamento, cenario: CenarioPagamento): Promise<RespostaPagamento> {
  const tempoResposta = req.forma === 'pix' ? 2500 : 1500;

  if (cenario === 'expirar') {
    await esperar(TEMPO_LIMITE_PAGAMENTO_MS + 500);
    return { status: 'expirado' };
  }
  await esperar(tempoResposta);

  if (cenario === 'recusar') return { status: 'recusado', motivoRecusa: 'Pagamento não autorizado pelo emissor' };
  if (cenario === 'instavel' && tentativasInstavel++ % 2 === 0) throw new Error('Serviço de pagamento indisponível');

  return { status: 'aprovado', transacaoId: `TX-${req.chaveIdempotencia.slice(0, 8).toUpperCase()}` };
}

export function solicitarPagamento(
  req: SolicitacaoPagamento,
  cenario: CenarioPagamento = lerCenarioPagamento(),
): Promise<RespostaPagamento> {
  const existente = respostasPorChave.get(req.chaveIdempotencia);
  if (existente) return existente;

  const comTempoLimite = Promise.race<RespostaPagamento>([
    processarNoProvedor(req, cenario),
    esperar(TEMPO_LIMITE_PAGAMENTO_MS).then(() => ({ status: 'expirado' as const })),
  ]);

  respostasPorChave.set(req.chaveIdempotencia, comTempoLimite);
  // Falha de comunicação não deve "travar" a chave: libera para nova tentativa
  comTempoLimite.catch(() => respostasPorChave.delete(req.chaveIdempotencia));
  return comTempoLimite;
}
