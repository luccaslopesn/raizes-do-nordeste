import { Link, useParams } from 'react-router-dom';
import { LinhaDoTempo } from '../../componentes/LinhaDoTempo';
import { ROTULO_STATUS, usePedidos } from '../../estado/pedidos';
import { useClienteAtual } from '../../estado/sessao';
import { unidades } from '../../mocks/dados';
import { formatarDataHora, formatarMoeda } from '../../util/formatacao';

export function AcompanharPedido() {
  const { pedidoId } = useParams();
  const cliente = useClienteAtual();
  const pedido = usePedidos((s) => s.pedidos.find((p) => p.id === pedidoId));

  // Cada cliente só vê os próprios pedidos
  if (!pedido || pedido.clienteId !== cliente?.id) {
    return (
      <div className="container pagina pilha" style={{ maxWidth: '36rem' }}>
        <h1>Pedido não encontrado</h1>
        <p className="texto-suave">Confira se você está na conta usada para fazer o pedido.</p>
        <Link to="/app/pedidos" className="botao">Meus pedidos</Link>
      </div>
    );
  }

  const unidade = unidades.find((u) => u.id === pedido.unidadeId);
  const pronto = pedido.status === 'pronto';

  return (
    <div className="container pagina" style={{ maxWidth: '44rem' }}>
      <p className="sobretitulo">Pedido feito em {formatarDataHora(pedido.criadoEm)}</p>
      <h1 aria-live="polite">{ROTULO_STATUS[pedido.status]}</h1>

      <div className="grade grade-2" style={{ marginTop: 'var(--e4)' }}>
        <section className="cartao pilha" aria-label="Código de retirada" style={pronto ? { background: 'var(--sol-claro)' } : undefined}>
          <span className="texto-suave texto-pequeno">Código de retirada</span>
          <span className="codigo-retirada">{pedido.codigoRetirada}</span>
          <p className="texto-pequeno" style={{ margin: 0 }}>
            {pronto ? 'Seu pedido está pronto! Mostre este código no balcão.' : 'Mostre este código no balcão quando o pedido estiver pronto.'}
          </p>
          <p className="texto-pequeno texto-suave" style={{ margin: 0 }}>{unidade?.nome}</p>
        </section>

        <section className="cartao" aria-label="Andamento">
          <LinhaDoTempo pedido={pedido} />
        </section>
      </div>

      <section className="cartao-plano pilha" style={{ marginTop: 'var(--e5)' }} aria-label="Detalhes do pedido">
        <h2 style={{ fontSize: '1.15rem' }}>Itens</h2>
        <ul style={{ margin: 0, paddingLeft: 'var(--e4)' }}>
          {pedido.itens.map((i) => <li key={i.produtoId}>{i.quantidade}× {i.nome} · {formatarMoeda(i.precoUnitario * i.quantidade)}</li>)}
        </ul>
        <div className="linha-entre"><span>Total pago</span><strong>{formatarMoeda(pedido.total)}</strong></div>
        {pedido.pontosGerados > 0 && pedido.pagamento.status === 'aprovado' && (
          <div className="aviso aviso-sucesso"><p>Você ganhou <strong>{pedido.pontosGerados} pontos</strong> com este pedido.</p></div>
        )}
        <p className="texto-pequeno texto-suave" style={{ margin: 0 }}>Transação {pedido.pagamento.transacaoId ?? '—'} · {pedido.pagamento.forma}</p>
      </section>

      <p className="texto-pequeno texto-suave" style={{ marginTop: 'var(--e4)' }}>
        Esta tela atualiza sozinha. Para simular a cozinha, abra <Link to="/operacao" target="_blank">a operação da loja</Link> em outra aba.
      </p>
    </div>
  );
}
