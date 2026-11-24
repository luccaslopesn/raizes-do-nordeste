import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Cliente, Consentimentos } from '../dominio/tipos';
import { esperar } from '../servicos/latencia';
import { gerarId, hashSimulado } from '../util/formatacao';
import { armazenamentoSeguro } from './armazenamentoSeguro';

export const CONTA_DEMONSTRACAO = { email: 'demo@raizes.com.br', senha: 'raizes123' };

const clienteDemo: Cliente = {
  id: 'cli-demo',
  nome: 'Cliente Demonstração',
  email: CONTA_DEMONSTRACAO.email,
  senhaHash: hashSimulado(CONTA_DEMONSTRACAO.senha),
  telefone: '(81) 99999-0000',
  dataNascimento: `1995-${String(new Date().getMonth() + 1).padStart(2, '0')}-10`,
  pontos: 180,
  consentimentos: { termosEPrivacidade: true, programaFidelidade: true, marketingSegmentado: true, atualizadoEm: '2026-01-10T12:00:00.000Z' },
  criadoEm: '2026-01-10T12:00:00.000Z',
};

export interface DadosCadastro {
  nome: string;
  email: string;
  senha: string;
  telefone?: string;
  dataNascimento?: string;
  consentimentos: Omit<Consentimentos, 'atualizadoEm'>;
}

export type ResultadoAutenticacao = { ok: true } | { ok: false; erro: string };

interface EstadoSessao {
  /** "Banco" simulado de clientes (no sistema real, fica no back-end) */
  clientes: Cliente[];
  clienteId?: string;
  entrar: (email: string, senha: string) => Promise<ResultadoAutenticacao>;
  cadastrar: (dados: DadosCadastro) => Promise<ResultadoAutenticacao>;
  sair: () => void;
  atualizarConsentimentos: (mudancas: Partial<Omit<Consentimentos, 'atualizadoEm' | 'termosEPrivacidade'>>) => void;
  ajustarPontos: (clienteId: string, delta: number) => void;
  excluirConta: () => void;
}

export const useSessao = create<EstadoSessao>()(
  persist(
    (set, get) => ({
      clientes: [clienteDemo],
      clienteId: undefined,

      entrar: async (email, senha) => {
        await esperar(500);
        const cliente = get().clientes.find((c) => c.email.toLowerCase() === email.trim().toLowerCase());
        // Mensagem genérica: não revela se o e-mail existe
        if (!cliente || cliente.senhaHash !== hashSimulado(senha)) return { ok: false, erro: 'E-mail ou senha incorretos.' };
        set({ clienteId: cliente.id });
        return { ok: true };
      },

      cadastrar: async (dados) => {
        await esperar(600);
        if (!dados.consentimentos.termosEPrivacidade) return { ok: false, erro: 'É preciso aceitar os Termos de Uso e a Política de Privacidade.' };
        if (get().clientes.some((c) => c.email.toLowerCase() === dados.email.trim().toLowerCase())) {
          return { ok: false, erro: 'Já existe uma conta com este e-mail.' };
        }
        const agora = new Date().toISOString();
        const novo: Cliente = {
          id: gerarId('cli'),
          nome: dados.nome.trim(),
          email: dados.email.trim().toLowerCase(),
          senhaHash: hashSimulado(dados.senha),
          telefone: dados.telefone || undefined,
          // Minimização: data de nascimento só é guardada se a pessoa aderiu à fidelidade
          dataNascimento: dados.consentimentos.programaFidelidade ? dados.dataNascimento || undefined : undefined,
          pontos: 0,
          consentimentos: { ...dados.consentimentos, atualizadoEm: agora },
          criadoEm: agora,
        };
        set((s) => ({ clientes: [...s.clientes, novo], clienteId: novo.id }));
        return { ok: true };
      },

      sair: () => set({ clienteId: undefined }),

      atualizarConsentimentos: (mudancas) =>
        set((s) => ({
          clientes: s.clientes.map((c) => {
            if (c.id !== s.clienteId) return c;
            const consentimentos = { ...c.consentimentos, ...mudancas, atualizadoEm: new Date().toISOString() };
            // Revogar a fidelidade apaga o dado que só existia por causa dela
            const dataNascimento = consentimentos.programaFidelidade ? c.dataNascimento : undefined;
            return { ...c, consentimentos, dataNascimento };
          }),
        })),

      ajustarPontos: (clienteId, delta) =>
        set((s) => ({ clientes: s.clientes.map((c) => (c.id === clienteId ? { ...c, pontos: Math.max(0, c.pontos + delta) } : c)) })),

      excluirConta: () =>
        set((s) => ({ clientes: s.clientes.filter((c) => c.id !== s.clienteId), clienteId: undefined })),
    }),
    { name: 'raizes-sessao', storage: armazenamentoSeguro },
  ),
);

export function useClienteAtual(): Cliente | null {
  return useSessao((s) => s.clientes.find((c) => c.id === s.clienteId) ?? null);
}
