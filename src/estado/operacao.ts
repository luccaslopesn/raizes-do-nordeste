import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PerfilOperacao } from '../dominio/tipos';
import { armazenamentoSeguro } from './armazenamentoSeguro';

export type PerfilEquipe = Exclude<PerfilOperacao, 'sistema'>;

/** PIN de demonstração. No sistema real: login individual com auditoria por pessoa. */
export const PIN_DEMONSTRACAO = '1234';

/** Controle de acesso por perfil: cada um vê só o que precisa (minimização) */
export const ACESSO: Record<PerfilEquipe, ('balcao' | 'cozinha' | 'gestao')[]> = {
  atendente: ['balcao'],
  cozinha: ['cozinha'],
  gerente: ['balcao', 'cozinha', 'gestao'],
};

interface EstadoOperacao {
  perfil?: PerfilEquipe;
  unidadeId: string;
  entrar: (perfil: PerfilEquipe, pin: string, unidadeId: string) => boolean;
  sair: () => void;
}

export const useOperacao = create<EstadoOperacao>()(
  persist(
    (set) => ({
      perfil: undefined,
      unidadeId: 'rec-boa-vista',
      entrar: (perfil, pin, unidadeId) => {
        if (pin !== PIN_DEMONSTRACAO) return false;
        set({ perfil, unidadeId });
        return true;
      },
      sair: () => set({ perfil: undefined }),
    }),
    { name: 'raizes-operacao', storage: armazenamentoSeguro },
  ),
);
