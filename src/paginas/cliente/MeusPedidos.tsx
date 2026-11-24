import { Link, Navigate } from 'react-router-dom';
import { ROTULO_STATUS, usePedidos } from '../../estado/pedidos';
import { useClienteAtual } from '../../estado/sessao';
import { unidades } from '../../mocks/dados';
import { formatarDataHora, formatarMoeda } from '../../util/formatacao';

const CLASSE_STATUS: Record<string, string> = {
  recebido: 'selo-anil', 'em-preparo': 'selo-sol', pronto: 'selo-mandacaru', retirado: 'selo-neutro', cancelado: 'selo-erro', 'aguardando-pagamento': 'selo-neutro',
};

export function MeusPedidos() {
  const cliente = useClienteAtual();
  const todos = usePedidos((s) => s.pedidos);
  if (!cliente) return <Navigate to="/app/entrar?voltar=/app/pedidos" replace />;
  const meus = todos.filter((p) => p.clienteId === cliente.id && p.pagamento.status === 'aprovado');

  return (
    <div className="container pagina pilha" style={{ maxWidth: '44rem' }}>
      <h1>Meus pedidos</h1>
      {meus.length === 0 && (
        <div className="cartao-plano pilha">
          <p>Você ainda não fez pedidos.</p>
          <Link to="/app" className="botao">Fazer o primeiro pedido</Link>
        </div>
      )}
      {meus.map((p) => (
        <Link key={p.id} to={`/app/pedido/${p.id}`} className="cartao cartao-unidade">
          <div className="linha-entre">
            <strong>{unidades.find((u) => u.id === p.unidadeId)?.nome}</strong>
            <span className={`selo ${CLASSE_STATUS[p.status]}`}>{ROTULO_STATUS[p.status]}</span>
          </div>
          <span className="texto-suave texto-pequeno">{formatarDataHora(p.criadoEm)} · {p.itens.reduce((s, i) => s + i.quantidade, 0)} itens · {formatarMoeda(p.total)} · código {p.codigoRetirada}</span>
        </Link>
      ))}
    </div>
  );
}
