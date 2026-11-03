import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ItemCarrinho } from '../dominio/tipos';
import { armazenamentoSeguro } from './armazenamentoSeguro';

interface EstadoCarrinho {
  unidadeId?: string;
  itens: ItemCarrinho[];
  selecionarUnidade: (unidadeId: string) => void;
  adicionar: (item: Omit<ItemCarrinho, 'quantidade'>, quantidade?: number) => void;
  alterarQuantidade: (produtoId: string, quantidade: number) => void;
  remover: (produtoId: string) => void;
  limpar: () => void;
}

export const useCarrinho = create<EstadoCarrinho>()(
  persist(
    (set, get) => ({
      itens: [],
      selecionarUnidade: (unidadeId) => {
        // Trocar de unidade invalida o carrinho: preço e disponibilidade mudam
        if (get().unidadeId !== unidadeId) set({ unidadeId, itens: [] });
      },
      adicionar: (item, quantidade = 1) =>
        set((s) => {
          const existente = s.itens.find((i) => i.produtoId === item.produtoId);
          if (existente) {
            return { itens: s.itens.map((i) => (i.produtoId === item.produtoId ? { ...i, quantidade: i.quantidade + quantidade } : i)) };
          }
          return { itens: [...s.itens, { ...item, quantidade }] };
        }),
      alterarQuantidade: (produtoId, quantidade) =>
        set((s) => ({
          itens: quantidade <= 0
            ? s.itens.filter((i) => i.produtoId !== produtoId)
            : s.itens.map((i) => (i.produtoId === produtoId ? { ...i, quantidade } : i)),
        })),
      remover: (produtoId) => set((s) => ({ itens: s.itens.filter((i) => i.produtoId !== produtoId) })),
      limpar: () => set({ itens: [] }),
    }),
    { name: 'raizes-carrinho', storage: armazenamentoSeguro },
  ),
);

export const calcularSubtotal = (itens: ItemCarrinho[]) =>
  Math.round(itens.reduce((soma, i) => soma + i.precoUnitario * i.quantidade, 0) * 100) / 100;
