import { createJSONStorage } from 'zustand/middleware';

/** localStorage pode estar bloqueado (aba anônima, totem em modo quiosque) */
export const armazenamentoSeguro = createJSONStorage(() => ({
  getItem: (chave: string) => {
    try { return localStorage.getItem(chave); } catch { return null; }
  },
  setItem: (chave: string, valor: string) => {
    try { localStorage.setItem(chave, valor); } catch { /* ignora */ }
  },
  removeItem: (chave: string) => {
    try { localStorage.removeItem(chave); } catch { /* ignora */ }
  },
}));
