import { useCallback, useRef, useState } from 'react';
import type { FormaPagamento } from '../dominio/tipos';
import { usePedidos } from '../estado/pedidos';
import { solicitarPagamento } from './gatewayPagamento';

export type FasePagamento = 'ocioso' | 'processando' | 'aprovado' | 'recusado' | 'expirado' | 'falha-comunicacao';

/**
 * Orquestra a conversa com o serviço externo, igual em todos os canais:
 * envia a solicitação, espera a resposta, registra no pedido.
 * - Clique duplo: ignorado enquanto processa (e a chave de idempotência protege no provedor).
 * - Falha de comunicação: tenta de novo com a MESMA chave (não gera cobrança dupla).
 * - Recusa ou expiração: nova tentativa com NOVA chave.
 */
export function usePagamento(pedidoId?: string) {
  const [fase, setFase] = useState<FasePagamento>('ocioso');
  const [mensagem, setMensagem] = useState<string>();
  const emAndamento = useRef(false);

  const pagar = useCallback(
    async (forma: FormaPagamento) => {
      if (!pedidoId || emAndamento.current) return;
      emAndamento.current = true;
      setFase('processando');
      setMensagem(undefined);

      const loja = usePedidos.getState();
      let pedido = loja.pedidos.find((p) => p.id === pedidoId);
      if (pedido && (pedido.pagamento.status === 'recusado' || pedido.pagamento.status === 'expirado' || pedido.pagamento.forma !== forma)) {
        pedido = loja.novaTentativa(pedidoId, forma);
      }
      if (!pedido) {
        emAndamento.current = false;
        setFase('falha-comunicacao');
        setMensagem('Pedido não encontrado.');
        return;
      }

      try {
        const resposta = await solicitarPagamento({ chaveIdempotencia: pedido.pagamento.chaveIdempotencia, valor: pedido.total, forma });
        usePedidos.getState().registrarPagamento(pedidoId, resposta);
        setFase(resposta.status);
        if (resposta.status === 'recusado') setMensagem(resposta.motivoRecusa ?? 'Pagamento recusado.');
        if (resposta.status === 'expirado') setMensagem('O serviço de pagamento não respondeu a tempo. Nenhum valor foi cobrado.');
      } catch {
        setFase('falha-comunicacao');
        setMensagem('Não conseguimos falar com o serviço de pagamento. Você pode tentar de novo sem risco de cobrança duplicada.');
      } finally {
        emAndamento.current = false;
      }
    },
    [pedidoId],
  );

  return { fase, mensagem, pagar, processando: fase === 'processando' };
}
