import { useEffect, useState } from 'react';
import type { Pedido, StatusPedido } from '../../dominio/tipos';
import { useOperacao } from '../../estado/operacao';
import { ROTULO_STATUS, usePedidos } from '../../estado/pedidos';

const COLUNAS: { status: StatusPedido; acao: string }[] = [
  { status: 'recebido', acao: 'Iniciar preparo' },
  { status: 'em-preparo', acao: 'Marcar como pronto' },
  { status: 'pronto', acao: 'Entregue ao cliente' },
];

const ROTULO_CANAL = { app: 'App', web: 'Site', totem: 'Totem', balcao: 'Balcão' };

function useAgora(intervalo = 15_000) {
  const [agora, setAgora] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setAgora(Date.now()), intervalo); return () => clearInterval(t); }, [intervalo]);
  return agora;
}

export function CartaoPedidoCozinha({ pedido, acao, aoAgir, agora }: { pedido: Pedido; acao: string; aoAgir: () => void; agora: number }) {
  const minutos = Math.floor((agora - new Date(pedido.criadoEm).getTime()) / 60000);
  const atrasado = minutos >= 15 && pedido.status !== 'pronto';
  return (
    <article className={`cartao pedido-kds ${atrasado ? 'atrasado' : ''}`} aria-label={`Pedido ${pedido.codigoRetirada}`}>
      <div className="linha-entre">
        <span className="kds-codigo">{pedido.codigoRetirada}</span>
        <span className={`selo ${atrasado ? 'selo-erro' : 'selo-neutro'}`}>{minutos} min</span>
      </div>
      <div className="texto-pequeno texto-suave">{ROTULO_CANAL[pedido.canal]}{pedido.nomeChamada ? ` · ${pedido.nomeChamada}` : ''}</div>
      <ul className="kds-itens">
        {pedido.itens.map((i) => <li key={i.produtoId}><strong>{i.quantidade}×</strong> {i.nome}{i.observacao ? <em> · {i.observacao}</em> : null}</li>)}
      </ul>
      <button className="botao botao-bloco" onClick={aoAgir}>{acao}</button>
    </article>
  );
}

export function Cozinha() {
  const { unidadeId, perfil } = useOperacao();
  const { pedidos, avancar } = usePedidos();
  const agora = useAgora();
  const daUnidade = pedidos.filter((p) => p.unidadeId === unidadeId);

  return (
    <div className="kds">
      {COLUNAS.map(({ status, acao }) => {
        // Mais antigo primeiro: ordem de chegada
        const lista = daUnidade.filter((p) => p.status === status).sort((a, b) => a.criadoEm.localeCompare(b.criadoEm));
        return (
          <section key={status} className={`kds-coluna kds-${status}`} aria-labelledby={`col-${status}`}>
            <h2 id={`col-${status}`}>{ROTULO_STATUS[status]} <span className="kds-contagem">{lista.length}</span></h2>
            {lista.length === 0 && <p className="texto-suave texto-pequeno">Nenhum pedido.</p>}
            {lista.map((p) => <CartaoPedidoCozinha key={p.id} pedido={p} acao={acao} agora={agora} aoAgir={() => avancar(p.id, perfil ?? 'cozinha')} />)}
          </section>
        );
      })}
    </div>
  );
}
