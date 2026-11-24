import { create, type StateCreator } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ItemCarrinho } from '../dominio/tipos';
import { armazenamentoSeguro } from './armazenamentoSeguro';

export interface EstadoCarrinho {
  unidadeId?: string;
  itens: ItemCarrinho[];
  recompensaId?: string;
  selecionarUnidade: (unidadeId: string) => void;
  adicionar: (item: Omit<ItemCarrinho, 'quantidade'>, quantidade?: number) => void;
  alterarQuantidade: (produtoId: string, quantidade: number) => void;
  remover: (produtoId: string) => void;
  aplicarRecompensa: (recompensaId?: string) => void;
  limpar: () => void;
}

const logicaCarrinho: StateCreator<EstadoCarrinho> = (set, get) => ({
  itens: [],
  selecionarUnidade: (unidadeId) => {
    // Trocar de unidade invalida o carrinho: preço e disponibilidade mudam
    if (get().unidadeId !== unidadeId) set({ unidadeId, itens: [], recompensaId: undefined });
  },
  adicionar: (item, quantidade = 1) =>
    set((s) => {
      const existente = s.itens.find((i) => i.produtoId === item.produtoId);
      if (existente) {
        return {
          itens: s.itens.map((i) =>
            i.produtoId === item.produtoId ? { ...i, quantidade: Math.min(20, i.quantidade + quantidade), observacao: item.observacao ?? i.observacao } : i,
          ),
        };
      }
      return { itens: [...s.itens, { ...item, quantidade }] };
    }),
  alterarQuantidade: (produtoId, quantidade) =>
    set((s) => ({
      itens:
        quantidade <= 0
          ? s.itens.filter((i) => i.produtoId !== produtoId)
          : s.itens.map((i) => (i.produtoId === produtoId ? { ...i, quantidade: Math.min(20, quantidade) } : i)),
    })),
  remover: (produtoId) => set((s) => ({ itens: s.itens.filter((i) => i.produtoId !== produtoId) })),
  aplicarRecompensa: (recompensaId) => set({ recompensaId }),
  limpar: () => set({ itens: [], recompensaId: undefined }),
});

/** Carrinho do app/web: sobrevive a recarregar a página */
export const useCarrinho = create<EstadoCarrinho>()(persist(logicaCarrinho, { name: 'raizes-carrinho', storage: armazenamentoSeguro }));

/** Carrinho do totem e do balcão: só em memória, some ao encerrar o atendimento */
export const useCarrinhoTotem = create<EstadoCarrinho>()(logicaCarrinho);
export const useCarrinhoBalcao = create<EstadoCarrinho>()(logicaCarrinho);

export const contarItens = (itens: ItemCarrinho[]) => itens.reduce((s, i) => s + i.quantidade, 0);
