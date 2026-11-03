import type { ItemCardapio, Produto, Unidade } from '../dominio/tipos';
import { estoquePorUnidade, produtos, unidades } from '../mocks/dados';
import { simularLatencia } from './latencia';

function dentroDaJanela(sazonal: NonNullable<Produto['sazonal']>, data: Date): boolean {
  const mmdd = `${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;
  return mmdd >= sazonal.inicio && mmdd <= sazonal.fim;
}

/**
 * Regra central do cardápio dinâmico: resolve preço, disponibilidade e
 * variação regional de cada produto para uma unidade numa data.
 * No sistema real isso viria pronto do back-end; aqui fica isolado para
 * ser trocado por uma chamada HTTP sem mexer nas telas.
 */
export function resolverCardapio(unidade: Unidade, data: Date = new Date()): ItemCardapio[] {
  const estoque = estoquePorUnidade[unidade.id] ?? {};

  return produtos
    .filter((p) => !p.sazonal || dentroDaJanela(p.sazonal, data))
    .map((produto) => {
      const variacao = produto.variacoesRegionais?.[unidade.regiao];
      const preco = variacao?.preco ?? produto.precoBase;

      let motivoIndisponivel: ItemCardapio['motivoIndisponivel'];
      if (produto.exigeCozinhaCompleta && unidade.formato === 'reduzida') motivoIndisponivel = 'formato-da-unidade';
      else if ((estoque[produto.id] ?? 0) <= 0) motivoIndisponivel = 'esgotado';

      return {
        produto,
        preco,
        disponivel: !motivoIndisponivel,
        motivoIndisponivel,
        observacaoRegional: variacao?.observacao,
      };
    })
    // Produto que a unidade nunca serve some do cardápio; esgotado aparece desabilitado
    .filter((item) => item.motivoIndisponivel !== 'formato-da-unidade');
}

export async function listarUnidades(): Promise<Unidade[]> {
  await simularLatencia();
  return unidades;
}

export async function buscarCardapio(unidadeId: string, data?: Date): Promise<ItemCardapio[]> {
  await simularLatencia();
  const unidade = unidades.find((u) => u.id === unidadeId);
  if (!unidade) throw new Error('Unidade não encontrada');
  return resolverCardapio(unidade, data);
}
