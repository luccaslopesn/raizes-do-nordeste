import type { Campanha, Cliente, ItemCarrinho, Recompensa } from '../dominio/tipos';
import { campanhas as todasCampanhas, PONTOS_POR_REAL } from '../mocks/dados';
import { arredondar } from '../util/formatacao';

export interface EntradaPrecificacao {
  itens: ItemCarrinho[];
  unidadeId: string;
  cliente?: Cliente | null;
  recompensa?: Recompensa | null;
  agora?: Date;
  campanhas?: Campanha[];
}

export interface ResultadoPrecificacao {
  subtotal: number;
  descontoCampanha: number;
  descontoRecompensa: number;
  total: number;
  campanhaAplicada?: Campanha;
  pontosEmDobro: boolean;
  pontosGerados: number;
}

/** Campanhas que o cliente pode ver: segmentadas só com consentimento de marketing */
export function campanhasVisiveis(unidadeId: string, cliente?: Cliente | null, agora = new Date(), lista = todasCampanhas): Campanha[] {
  const hoje = agora.toISOString().slice(0, 10);
  return lista.filter((c) => {
    if (c.validaAte < hoje) return false;
    if (c.unidadesIds?.length && !c.unidadesIds.includes(unidadeId)) return false;
    if (c.segmentada && !cliente?.consentimentos.marketingSegmentado) return false;
    return true;
  });
}

function campanhaElegivel(c: Campanha, subtotal: number, cliente: Cliente | null | undefined, agora: Date): boolean {
  if (c.id === 'camp-aniversario') {
    if (!cliente?.dataNascimento) return false;
    return Number(cliente.dataNascimento.slice(5, 7)) === agora.getMonth() + 1;
  }
  if (c.id === 'camp-paulista') return subtotal >= 30;
  if (c.id === 'camp-cafe') return agora.getHours() < 9;
  return true;
}

function valorDesconto(c: Campanha, subtotal: number): number {
  if (c.tipo === 'percentual') return arredondar((subtotal * c.valor) / 100);
  if (c.tipo === 'valor-fixo') return Math.min(c.valor, subtotal);
  return 0;
}

/**
 * Regra única de preço usada por todos os canais. Aplica a melhor campanha
 * de desconto elegível (não acumulam entre si), depois a recompensa de
 * fidelidade. Pontos só são gerados para quem aderiu ao programa.
 */
export function precificar({ itens, unidadeId, cliente, recompensa, agora = new Date(), campanhas }: EntradaPrecificacao): ResultadoPrecificacao {
  const subtotal = arredondar(itens.reduce((s, i) => s + i.precoUnitario * i.quantidade, 0));
  const elegiveis = campanhasVisiveis(unidadeId, cliente, agora, campanhas).filter((c) => campanhaElegivel(c, subtotal, cliente, agora));

  const melhorDesconto = elegiveis
    .filter((c) => c.tipo !== 'pontos-em-dobro')
    .map((c) => ({ c, valor: valorDesconto(c, subtotal) }))
    .sort((a, b) => b.valor - a.valor)[0];

  const descontoCampanha = melhorDesconto?.valor ?? 0;
  const aposCampanha = subtotal - descontoCampanha;
  const descontoRecompensa = recompensa ? Math.min(recompensa.descontoEmReais, aposCampanha) : 0;
  const total = arredondar(Math.max(0, aposCampanha - descontoRecompensa));

  const participa = !!cliente?.consentimentos.programaFidelidade;
  const pontosEmDobro = participa && elegiveis.some((c) => c.tipo === 'pontos-em-dobro');
  const pontosGerados = participa ? Math.floor(total * PONTOS_POR_REAL) * (pontosEmDobro ? 2 : 1) : 0;

  return {
    subtotal,
    descontoCampanha,
    descontoRecompensa: arredondar(descontoRecompensa),
    total,
    campanhaAplicada: melhorDesconto && melhorDesconto.valor > 0 ? melhorDesconto.c : undefined,
    pontosEmDobro,
    pontosGerados,
  };
}
