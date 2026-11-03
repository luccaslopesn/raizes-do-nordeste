import { describe, expect, it } from 'vitest';
import { unidades } from '../mocks/dados';
import { resolverCardapio } from './cardapio';

const unidade = (id: string) => unidades.find((u) => u.id === id)!;
const novembro = new Date(2026, 10, 3);
const junho = new Date(2026, 5, 20);

describe('cardápio por unidade', () => {
  it('oculta produtos que exigem cozinha completa em unidade reduzida', () => {
    const ids = resolverCardapio(unidade('sp-paulista'), novembro).map((i) => i.produto.id);
    expect(ids).not.toContain('cus-ovo');
    expect(ids).toContain('tap-coco');
  });

  it('mostra produto esgotado como indisponível, sem removê-lo', () => {
    const item = resolverCardapio(unidade('rec-boa-vista'), novembro).find((i) => i.produto.id === 'cus-charque');
    expect(item?.disponivel).toBe(false);
    expect(item?.motivoIndisponivel).toBe('esgotado');
  });

  it('exibe produtos juninos só dentro da janela sazonal', () => {
    const emNovembro = resolverCardapio(unidade('rec-boa-vista'), novembro).map((i) => i.produto.id);
    const emJunho = resolverCardapio(unidade('rec-boa-vista'), junho).map((i) => i.produto.id);
    expect(emNovembro).not.toContain('pamonha');
    expect(emJunho).toContain('pamonha');
  });
});
