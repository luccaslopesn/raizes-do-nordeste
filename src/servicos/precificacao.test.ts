import { describe, expect, it } from 'vitest';
import type { Cliente } from '../dominio/tipos';
import { recompensas } from '../mocks/dados';
import { aplicarMascaraCpf, cpfValido, mascararCpf } from '../util/formatacao';
import { campanhasVisiveis, precificar } from './precificacao';

const itens = [{ produtoId: 'tap-carne-sol', nome: 'Tapioca', precoUnitario: 22.9, quantidade: 2 }];
const tarde = new Date(2026, 10, 3, 15, 0);
const cedo = new Date(2026, 10, 3, 8, 0);

const cliente = (consent: Partial<Cliente['consentimentos']>, extra: Partial<Cliente> = {}): Cliente => ({
  id: 'c1', nome: 'Ana', email: 'a@a.com', senhaHash: 'x', pontos: 0, criadoEm: '',
  consentimentos: { termosEPrivacidade: true, programaFidelidade: false, marketingSegmentado: false, atualizadoEm: '', ...consent },
  ...extra,
});

describe('precificação', () => {
  it('não gera pontos para quem não aderiu à fidelidade', () => {
    expect(precificar({ itens, unidadeId: 'rec-boa-vista', cliente: cliente({}), agora: tarde }).pontosGerados).toBe(0);
  });

  it('gera 1 ponto por real para quem aderiu, em dobro antes das 9h', () => {
    const c = cliente({ programaFidelidade: true });
    expect(precificar({ itens, unidadeId: 'rec-boa-vista', cliente: c, agora: tarde }).pontosGerados).toBe(45);
    expect(precificar({ itens, unidadeId: 'rec-boa-vista', cliente: c, agora: cedo }).pontosGerados).toBe(90);
  });

  it('campanha segmentada só aparece com consentimento de marketing', () => {
    const sem = campanhasVisiveis('rec-boa-vista', cliente({}), tarde).map((c) => c.id);
    const com = campanhasVisiveis('rec-boa-vista', cliente({ marketingSegmentado: true }), tarde).map((c) => c.id);
    expect(sem).not.toContain('camp-aniversario');
    expect(com).toContain('camp-aniversario');
  });

  it('aplica desconto de aniversário no mês certo', () => {
    const c = cliente({ marketingSegmentado: true }, { dataNascimento: '1990-11-20' });
    const r = precificar({ itens, unidadeId: 'rec-boa-vista', cliente: c, agora: tarde });
    expect(r.descontoCampanha).toBeCloseTo(6.87);
    expect(r.total).toBeCloseTo(38.93);
  });

  it('campanha local só vale na unidade dela', () => {
    const grandes = [{ ...itens[0], quantidade: 2 }];
    expect(precificar({ itens: grandes, unidadeId: 'sp-paulista', agora: tarde }).descontoCampanha).toBe(5);
    expect(precificar({ itens: grandes, unidadeId: 'rec-boa-vista', agora: tarde }).descontoCampanha).toBe(0);
  });

  it('recompensa nunca deixa o total negativo', () => {
    const barato = [{ produtoId: 'cafe-coado', nome: 'Café', precoUnitario: 5.5, quantidade: 1 }];
    const r = precificar({ itens: barato, unidadeId: 'rec-boa-vista', recompensa: recompensas[1], agora: tarde });
    expect(r.total).toBe(0);
    expect(r.descontoRecompensa).toBe(5.5);
  });
});

describe('CPF', () => {
  it('valida dígitos verificadores', () => {
    expect(cpfValido('529.982.247-25')).toBe(true);
    expect(cpfValido('529.982.247-24')).toBe(false);
    expect(cpfValido('111.111.111-11')).toBe(false);
  });

  it('mascara para exibição e formata na digitação', () => {
    expect(mascararCpf('52998224725')).toBe('***.***.***-25');
    expect(aplicarMascaraCpf('52998224725')).toBe('529.982.247-25');
  });
});
