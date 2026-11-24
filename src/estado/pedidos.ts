import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Canal, FormaPagamento, ItemCarrinho, Pedido, PerfilOperacao, RegistroAuditoria, StatusPedido,
} from '../dominio/tipos';
import { produtos, recompensas, unidades } from '../mocks/dados';
import type { RespostaPagamento } from '../servicos/gatewayPagamento';
import type { ResultadoPrecificacao } from '../servicos/precificacao';
import { arredondar, gerarCodigoRetirada, gerarId } from '../util/formatacao';
import { armazenamentoSeguro } from './armazenamentoSeguro';
import { useSessao } from './sessao';

/** Sequência válida de preparo. Cancelar é permitido até "pronto". */
export const FLUXO_STATUS: StatusPedido[] = ['aguardando-pagamento', 'recebido', 'em-preparo', 'pronto', 'retirado'];

export const ROTULO_STATUS: Record<StatusPedido, string> = {
  'aguardando-pagamento': 'Aguardando pagamento',
  recebido: 'Pedido recebido',
  'em-preparo': 'Em preparo',
  pronto: 'Pronto para retirada',
  retirado: 'Retirado',
  cancelado: 'Cancelado',
};

export interface NovoPedido {
  unidadeId: string;
  canal: Canal;
  itens: ItemCarrinho[];
  precificacao: ResultadoPrecificacao;
  forma: FormaPagamento;
  clienteId?: string;
  nomeChamada?: string;
  recompensaId?: string;
}

interface EstadoPedidos {
  pedidos: Pedido[];
  auditoria: RegistroAuditoria[];
  criar: (dados: NovoPedido) => Pedido;
  /** Nova tentativa após recusa ou expiração: nova chave, nova cobrança possível */
  novaTentativa: (pedidoId: string, forma: FormaPagamento) => Pedido | undefined;
  registrarPagamento: (pedidoId: string, resposta: RespostaPagamento) => void;
  avancar: (pedidoId: string, perfil: PerfilOperacao) => void;
  cancelar: (pedidoId: string, motivo: string, perfil: PerfilOperacao) => void;
}

const agoraIso = () => new Date().toISOString();

function registro(pedido: Pedido, perfil: PerfilOperacao, acao: RegistroAuditoria['acao'], detalhe: string): RegistroAuditoria {
  return { id: gerarId('aud'), em: agoraIso(), unidadeId: pedido.unidadeId, perfil, acao, pedidoId: pedido.id, detalhe };
}

export const usePedidos = create<EstadoPedidos>()(
  persist(
    (set, get) => ({
      ...gerarHistorico(),

      criar: (dados) => {
        const agora = agoraIso();
        const recompensa = recompensas.find((r) => r.id === dados.recompensaId);
        const pedido: Pedido = {
          id: gerarId('ped').slice(0, 16),
          codigoRetirada: gerarCodigoRetirada(),
          unidadeId: dados.unidadeId,
          canal: dados.canal,
          clienteId: dados.clienteId,
          nomeChamada: dados.nomeChamada,
          itens: dados.itens,
          subtotal: dados.precificacao.subtotal,
          desconto: arredondar(dados.precificacao.descontoCampanha + dados.precificacao.descontoRecompensa),
          total: dados.precificacao.total,
          pontosGerados: dados.precificacao.pontosGerados,
          pontosResgatados: recompensa?.custoPontos ?? 0,
          campanhaAplicadaId: dados.precificacao.campanhaAplicada?.id,
          recompensaAplicadaId: recompensa?.id,
          status: 'aguardando-pagamento',
          pagamento: { forma: dados.forma, status: 'pendente', chaveIdempotencia: gerarId() },
          criadoEm: agora,
          historico: [{ status: 'aguardando-pagamento', em: agora }],
        };
        set((s) => ({ pedidos: [pedido, ...s.pedidos] }));
        return pedido;
      },

      novaTentativa: (pedidoId, forma) => {
        set((s) => ({
          pedidos: s.pedidos.map((p) =>
            p.id === pedidoId && p.status === 'aguardando-pagamento'
              ? { ...p, pagamento: { forma, status: 'pendente', chaveIdempotencia: gerarId() } }
              : p,
          ),
        }));
        return get().pedidos.find((p) => p.id === pedidoId);
      },

      registrarPagamento: (pedidoId, resposta) => {
        const pedido = get().pedidos.find((p) => p.id === pedidoId);
        // Resposta repetida ou atrasada não altera pedido já resolvido
        if (!pedido || pedido.pagamento.status === 'aprovado' || pedido.status !== 'aguardando-pagamento') return;

        const pagamento = { ...pedido.pagamento, status: resposta.status, transacaoId: resposta.transacaoId, motivoRecusa: resposta.motivoRecusa };
        if (resposta.status !== 'aprovado') {
          set((s) => ({ pedidos: s.pedidos.map((p) => (p.id === pedidoId ? { ...p, pagamento } : p)) }));
          return;
        }

        const em = agoraIso();
        const atualizado: Pedido = { ...pedido, pagamento, status: 'recebido', historico: [...pedido.historico, { status: 'recebido', em }] };
        const novosRegistros: RegistroAuditoria[] = [];
        if (pedido.campanhaAplicadaId) novosRegistros.push(registro(pedido, 'sistema', 'desconto-campanha', `Campanha ${pedido.campanhaAplicadaId} aplicada`));
        if (pedido.recompensaAplicadaId) novosRegistros.push(registro(pedido, 'sistema', 'resgate-recompensa', `Recompensa ${pedido.recompensaAplicadaId} (${pedido.pontosResgatados} pontos)`));

        set((s) => ({
          pedidos: s.pedidos.map((p) => (p.id === pedidoId ? atualizado : p)),
          auditoria: [...novosRegistros, ...s.auditoria],
        }));

        // Pontos só mudam com pagamento aprovado
        if (pedido.clienteId) useSessao.getState().ajustarPontos(pedido.clienteId, pedido.pontosGerados - pedido.pontosResgatados);
      },

      avancar: (pedidoId, perfil) => {
        const pedido = get().pedidos.find((p) => p.id === pedidoId);
        if (!pedido) return;
        const indice = FLUXO_STATUS.indexOf(pedido.status);
        if (indice < 1 || indice >= FLUXO_STATUS.length - 1) return; // não avança sem pagamento nem depois de retirado
        const proximo = FLUXO_STATUS[indice + 1];
        set((s) => ({
          pedidos: s.pedidos.map((p) => (p.id === pedidoId ? { ...p, status: proximo, historico: [...p.historico, { status: proximo, em: agoraIso() }] } : p)),
          auditoria: [registro(pedido, perfil, 'status-alterado', `${ROTULO_STATUS[pedido.status]} → ${ROTULO_STATUS[proximo]}`), ...s.auditoria],
        }));
      },

      cancelar: (pedidoId, motivo, perfil) => {
        const pedido = get().pedidos.find((p) => p.id === pedidoId);
        if (!pedido || ['retirado', 'cancelado'].includes(pedido.status)) return;
        const em = agoraIso();
        set((s) => ({
          pedidos: s.pedidos.map((p) =>
            p.id === pedidoId ? { ...p, status: 'cancelado', cancelamento: { motivo, por: perfil, em }, historico: [...p.historico, { status: 'cancelado', em }] } : p,
          ),
          auditoria: [registro(pedido, perfil, 'cancelamento', motivo), ...s.auditoria],
        }));
        // Estorno de pontos se o pedido já tinha sido pago
        if (pedido.clienteId && pedido.pagamento.status === 'aprovado') {
          useSessao.getState().ajustarPontos(pedido.clienteId, pedido.pontosResgatados - pedido.pontosGerados);
        }
      },
    }),
    { name: 'raizes-pedidos', storage: armazenamentoSeguro, version: 1 },
  ),
);

/** Histórico fictício dos últimos 7 dias para o painel do gerente não começar vazio */
function gerarHistorico(): Pick<EstadoPedidos, 'pedidos' | 'auditoria'> {
  let semente = 42;
  const aleatorio = () => ((semente = (semente * 16807) % 2147483647) / 2147483647);
  const canais: Canal[] = ['app', 'app', 'totem', 'totem', 'balcao', 'web'];
  const pedidos: Pedido[] = [];
  const auditoria: RegistroAuditoria[] = [];
  const agora = Date.now();

  for (let n = 0; n < 60; n++) {
    const unidade = unidades[Math.floor(aleatorio() * unidades.length)];
    const disponiveis = produtos.filter((p) => !p.sazonal && !(p.exigeCozinhaCompleta && unidade.formato === 'reduzida'));
    const itens: ItemCarrinho[] = Array.from({ length: 1 + Math.floor(aleatorio() * 3) }, () => {
      const p = disponiveis[Math.floor(aleatorio() * disponiveis.length)];
      return { produtoId: p.id, nome: p.nome, precoUnitario: p.precoBase, quantidade: 1 + Math.floor(aleatorio() * 2) };
    });
    const subtotal = arredondar(itens.reduce((s, i) => s + i.precoUnitario * i.quantidade, 0));
    const criadoEm = new Date(agora - aleatorio() * 7 * 864e5).toISOString();
    const cancelado = aleatorio() < 0.06;
    const pedido: Pedido = {
      id: `ped-hist-${n}`,
      codigoRetirada: `H${100 + n}`,
      unidadeId: unidade.id,
      canal: canais[Math.floor(aleatorio() * canais.length)],
      itens, subtotal, desconto: 0, total: subtotal,
      pontosGerados: 0, pontosResgatados: 0,
      status: cancelado ? 'cancelado' : 'retirado',
      pagamento: { forma: aleatorio() < 0.5 ? 'pix' : 'cartao-credito', status: 'aprovado', chaveIdempotencia: `hist-${n}` },
      criadoEm,
      historico: [{ status: cancelado ? 'cancelado' : 'retirado', em: criadoEm }],
    };
    if (cancelado) {
      pedido.cancelamento = { motivo: 'Cliente desistiu antes do preparo', por: 'atendente', em: criadoEm };
      auditoria.push({ id: `aud-hist-${n}`, em: criadoEm, unidadeId: unidade.id, perfil: 'atendente', acao: 'cancelamento', pedidoId: pedido.id, detalhe: pedido.cancelamento.motivo });
    }
    pedidos.push(pedido);
  }
  pedidos.sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
  auditoria.sort((a, b) => b.em.localeCompare(a.em));
  return { pedidos, auditoria };
}
