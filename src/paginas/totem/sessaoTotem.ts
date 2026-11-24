import { create } from 'zustand';
import { useCarrinhoTotem } from '../../estado/carrinho';

/** CPF de teste vinculado à conta de demonstração (CPF fictício válido) */
export const CPF_DEMONSTRACAO = '52998224725';

interface SessaoTotem {
  unidadeId: string;
  /** Conta vinculada pelo CPF. O CPF em si não é guardado. */
  clienteId?: string;
  cpfFinal?: string;
  pedidoId?: string;
  definirUnidade: (id: string) => void;
  vincular: (clienteId: string | undefined, cpfFinal: string | undefined) => void;
  definirPedido: (id: string) => void;
  encerrar: () => void;
}

/** Tudo em memória: o totem é compartilhado, nada sobrevive ao fim do atendimento */
export const useSessaoTotem = create<SessaoTotem>()((set) => ({
  unidadeId: 'rec-boa-vista',
  definirUnidade: (unidadeId) => set({ unidadeId }),
  vincular: (clienteId, cpfFinal) => set({ clienteId, cpfFinal }),
  definirPedido: (pedidoId) => set({ pedidoId }),
  encerrar: () => {
    set({ clienteId: undefined, cpfFinal: undefined, pedidoId: undefined });
    useCarrinhoTotem.getState().limpar();
  },
}));
