import type { CategoriaProduto, ItemCardapio } from '../dominio/tipos';
import { formatarMoeda } from '../util/formatacao';

export const ROTULO_CATEGORIA: Record<CategoriaProduto, string> = {
  tapiocas: 'Tapiocas',
  cuscuz: 'Cuscuz',
  bolos: 'Bolos e doces',
  bebidas: 'Bebidas',
  'cafe-da-manha': 'Café da manhã',
};

export function IlustracaoProduto({ item, tamanho }: { item: ItemCardapio; tamanho?: number }) {
  return (
    <div className={`ilustracao-produto ilustracao-${item.produto.categoria}`} style={tamanho ? { width: tamanho, height: tamanho } : undefined} aria-hidden="true" />
  );
}

interface Props {
  item: ItemCardapio;
  aoAdicionar: () => void;
  quantidadeNoCarrinho?: number;
}

export function CartaoProduto({ item, aoAdicionar, quantidadeNoCarrinho = 0 }: Props) {
  const { produto } = item;
  return (
    <article className={`cartao cartao-produto ${item.disponivel ? '' : 'indisponivel'}`} aria-labelledby={`produto-${produto.id}`}>
      <IlustracaoProduto item={item} />
      <div>
        <div className="linha" style={{ gap: 'var(--e1)', marginBottom: 'var(--e1)' }}>
          {produto.sazonal && <span className="selo selo-sol">{produto.sazonal.rotulo}</span>}
          {!item.disponivel && <span className="selo selo-erro">Esgotado nesta unidade</span>}
        </div>
        <h3 id={`produto-${produto.id}`}>{produto.nome}</h3>
        <p>{produto.descricao}</p>
        {item.observacaoRegional && <p className="texto-pequeno" style={{ color: 'var(--anil)' }}>{item.observacaoRegional}</p>}
        <div className="preco-linha">
          <span className="preco">{formatarMoeda(item.preco)}</span>
          <button
            className="botao botao-sol"
            onClick={aoAdicionar}
            disabled={!item.disponivel}
            aria-label={item.disponivel ? `Adicionar ${produto.nome} ao carrinho` : `${produto.nome} indisponível`}
          >
            {item.disponivel ? (quantidadeNoCarrinho > 0 ? `Adicionar (${quantidadeNoCarrinho})` : 'Adicionar') : 'Indisponível'}
          </button>
        </div>
      </div>
    </article>
  );
}
