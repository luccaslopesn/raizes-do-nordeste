import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { armazenamentoSeguro } from './armazenamentoSeguro';

/** Preferência de cookies do visitante (antes de qualquer cadastro) */
export interface PreferenciaCookies {
  essenciais: true; // sempre ativos: carrinho e sessão
  analiticos: boolean;
  decididoEm?: string;
}

interface EstadoPrivacidade {
  cookies: PreferenciaCookies;
  definirCookies: (analiticos: boolean) => void;
}

export const usePrivacidade = create<EstadoPrivacidade>()(
  persist(
    (set) => ({
      cookies: { essenciais: true, analiticos: false },
      definirCookies: (analiticos) =>
        set({ cookies: { essenciais: true, analiticos, decididoEm: new Date().toISOString() } }),
    }),
    { name: 'raizes-privacidade', storage: armazenamentoSeguro },
  ),
);
