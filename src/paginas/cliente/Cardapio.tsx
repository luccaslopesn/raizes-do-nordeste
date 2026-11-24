import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CartaoProduto, ROTULO_CATEGORIA } from '../../componentes/CartaoProduto';
import type { CategoriaProduto } from '../../dominio/tipos';
import { contarItens, useCarrinho } from '../../estado/carrinho';
import { useClienteAtual } from '../../estado/sessao';
import { unidades } from '../../mocks/dados';
import { buscarCardapio } from '../../servicos/cardapio';
import { campanhasVisiveis, precificar } from '../../servicos/precificacao';
import { useAssincrono } from '../../servicos/useAssincrono';
import { formatarMoeda } from '../../util/formatacao';

export function Cardapio() {
  const { unidadeId = '' } = useParams();
  const unidade = unidades.find((u) => u.id === unidadeId);
  const { dados: itens, carregando, erro, recarregar } = useAssincrono(() => buscarCardapio(unidadeId), [unidadeId]);
  const carrinho = useCarrinho();
  const cliente = useClienteAtual();
  const [categoria, setCategoria] = useState<CategoriaProduto | 'todas'>('todas');
  const [anuncio, setAnuncio] = useState('');

  useEffect(() => {
    if (unidade) carrinho.selecionarUnidade(unidade.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unidade?.id]);

  const categorias = useMemo(() => [...new Set((itens ?? []).map((i) => i.produto.categoria))], [itens]);
  const visiveis = (itens ?? []).filter((i) => categoria === 'todas' || i.produto.categoria === categoria);
  const campanhas = unidade ? campanhasVisiveis(unidade.id, cliente) : [];
  const quantidade = contarItens(carrinho.itens);
  const total = precificar({ itens: carrinho.itens, unidadeId, cliente }).subtotal;

  if (!unidade) {
    return (
      <div className="container pagina">
        <h1>Unidade não encontrada</h1>
        <Link to="/app" className="botao">Escolher outra unidade</Link>
      </div>
    );
  }

  return (
    <div className="container pagina pilha">
      <div>
        <Link to="/app" className="texto-pequeno">← Trocar unidade</Link>
        <h1 style={{ marginTop: 'var(--e2)' }}>{unidade.nome}</h1>
        <p className="texto-suave">
          {unidade.formato === 'completa'
            ? 'Cozinha completa: cardápio inteiro disponível.'
            : 'Unidade com cozinha reduzida: alguns pratos quentes não são servidos aqui.'}
        </p>
      </div>

      {campanhas.length > 0 && (
        <Link to="/app/promocoes" className="aviso aviso-atencao" style={{ textDecoration: 'none', color: 'inherit' }}>
          <p><strong>{campanhas[0].titulo}:</strong> {campanhas[0].descricao}{campanhas.length > 1 ? ` · e mais ${campanhas.length - 1}` : ''} →</p>
        </Link>
      )}

      <div className="abas-categorias" role="toolbar" aria-label="Filtrar por categoria">
        <button aria-pressed={categoria === 'todas'} onClick={() => setCategoria('todas')}>Tudo</button>
        {categorias.map((c) => (
          <button key={c} aria-pressed={categoria === c} onClick={() => setCategoria(c)}>{ROTULO_CATEGORIA[c]}</button>
        ))}
      </div>

      {erro && <div className="aviso aviso-erro" role="alert"><p>Erro ao carregar o cardápio. <button className="botao botao-texto" onClick={recarregar}>Tentar de novo</button></p></div>}

      <h2 className="visualmente-oculto">Produtos</h2>
      <div className="grade grade-2" aria-busy={carregando}>
        {carregando && [1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="esqueleto" style={{ height: 150 }} />)}
        {!carregando && visiveis.map((item) => (
          <CartaoProduto
            key={item.produto.id}
            item={item}
            quantidadeNoCarrinho={carrinho.itens.find((i) => i.produtoId === item.produto.id)?.quantidade}
            aoAdicionar={() => {
              carrinho.adicionar({ produtoId: item.produto.id, nome: item.produto.nome, precoUnitario: item.preco });
              setAnuncio(`${item.produto.nome} adicionado ao carrinho`);
            }}
          />
        ))}
      </div>

      <p className="visualmente-oculto" aria-live="polite">{anuncio}</p>

      {quantidade > 0 && (
        <div className="barra-carrinho">
          <Link to="/app/carrinho" className="botao">
            <span>Ver carrinho · {quantidade} {quantidade === 1 ? 'item' : 'itens'}</span>
            <span>{formatarMoeda(total)}</span>
          </Link>
        </div>
      )}
      <div style={{ height: 72 }} />
    </div>
  );
}
