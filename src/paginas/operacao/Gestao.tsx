import { useMemo, useState } from 'react';
import type { Canal } from '../../dominio/tipos';
import { useOperacao } from '../../estado/operacao';
import { usePedidos } from '../../estado/pedidos';
import { unidades } from '../../mocks/dados';
import { formatarDataHora, formatarMoeda } from '../../util/formatacao';

const ROTULO_CANAL: Record<Canal, string> = { app: 'App', web: 'Site', totem: 'Totem', balcao: 'Balcão' };
const ROTULO_ACAO = { cancelamento: 'Cancelamento', 'desconto-campanha': 'Desconto de campanha', 'resgate-recompensa': 'Resgate de pontos', 'status-alterado': 'Mudança de status' };

function Barras({ dados, formatar = String }: { dados: { rotulo: string; valor: number }[]; formatar?: (v: number) => string }) {
  const maximo = Math.max(1, ...dados.map((d) => d.valor));
  return (
    <ul className="barras">
      {dados.map((d) => (
        <li key={d.rotulo}>
          <span className="barras-rotulo">{d.rotulo}</span>
          <span className="barras-trilho"><span style={{ width: `${(d.valor / maximo) * 100}%` }} /></span>
          <span className="barras-valor">{formatar(d.valor)}</span>
        </li>
      ))}
    </ul>
  );
}

/** Painel do gerente: só dados agregados, sem identificar clientes */
export function Gestao() {
  const { unidadeId: unidadeLogada } = useOperacao();
  const { pedidos, auditoria } = usePedidos();
  const [filtroUnidade, setFiltroUnidade] = useState(unidadeLogada);
  const [filtroAcao, setFiltroAcao] = useState<'todas' | keyof typeof ROTULO_ACAO>('cancelamento');

  const desde = Date.now() - 7 * 864e5;
  const doPeriodo = useMemo(
    () => pedidos.filter((p) => (filtroUnidade === 'todas' || p.unidadeId === filtroUnidade) && new Date(p.criadoEm).getTime() >= desde && p.pagamento.status === 'aprovado'),
    [pedidos, filtroUnidade, desde],
  );
  const validos = doPeriodo.filter((p) => p.status !== 'cancelado');
  const faturamento = validos.reduce((s, p) => s + p.total, 0);
  const cancelados = doPeriodo.length - validos.length;

  const porCanal = (Object.keys(ROTULO_CANAL) as Canal[]).map((c) => ({ rotulo: ROTULO_CANAL[c], valor: validos.filter((p) => p.canal === c).length }));
  const contagemProdutos = new Map<string, number>();
  validos.forEach((p) => p.itens.forEach((i) => contagemProdutos.set(i.nome, (contagemProdutos.get(i.nome) ?? 0) + i.quantidade)));
  const maisVendidos = [...contagemProdutos].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([rotulo, valor]) => ({ rotulo, valor }));

  const registros = auditoria
    .filter((r) => (filtroUnidade === 'todas' || r.unidadeId === filtroUnidade) && (filtroAcao === 'todas' || r.acao === filtroAcao))
    .slice(0, 25);

  return (
    <div className="pilha">
      <div className="linha-entre">
        <h1 style={{ margin: 0, fontSize: '1.75rem' }}>Últimos 7 dias</h1>
        <div className="campo" style={{ minWidth: '14rem' }}>
          <label htmlFor="filtro-unidade" className="visualmente-oculto">Unidade</label>
          <select id="filtro-unidade" className="entrada" value={filtroUnidade} onChange={(e) => setFiltroUnidade(e.target.value)}>
            <option value="todas">Toda a rede</option>
            {unidades.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
          </select>
        </div>
      </div>

      <div className="indicadores">
        <div className="cartao indicador"><span>Faturamento</span><strong>{formatarMoeda(faturamento)}</strong></div>
        <div className="cartao indicador"><span>Pedidos</span><strong>{validos.length}</strong></div>
        <div className="cartao indicador"><span>Ticket médio</span><strong>{formatarMoeda(validos.length ? faturamento / validos.length : 0)}</strong></div>
        <div className="cartao indicador"><span>Cancelamentos</span><strong>{cancelados}</strong></div>
      </div>

      <div className="grade grade-2">
        <section className="cartao"><h2 style={{ fontSize: '1.15rem' }}>Pedidos por canal</h2><Barras dados={porCanal} /></section>
        <section className="cartao"><h2 style={{ fontSize: '1.15rem' }}>Mais vendidos (unidades)</h2><Barras dados={maisVendidos} /></section>
      </div>

      <section className="cartao pilha" aria-labelledby="titulo-auditoria">
        <div className="linha-entre">
          <h2 id="titulo-auditoria" style={{ fontSize: '1.15rem', margin: 0 }}>Auditoria</h2>
          <select className="entrada" aria-label="Filtrar ação" value={filtroAcao} onChange={(e) => setFiltroAcao(e.target.value as typeof filtroAcao)}>
            <option value="todas">Todas as ações</option>
            {Object.entries(ROTULO_ACAO).map(([v, r]) => <option key={v} value={v}>{r}</option>)}
          </select>
        </div>
        <div className="rolagem-horizontal">
          <table className="tabela">
            <thead><tr><th scope="col">Quando</th><th scope="col">Ação</th><th scope="col">Perfil</th><th scope="col">Pedido</th><th scope="col">Detalhe</th></tr></thead>
            <tbody>
              {registros.map((r) => (
                <tr key={r.id}>
                  <td>{formatarDataHora(r.em)}</td><td>{ROTULO_ACAO[r.acao]}</td><td>{r.perfil}</td>
                  <td>{pedidos.find((p) => p.id === r.pedidoId)?.codigoRetirada ?? r.pedidoId}</td><td>{r.detalhe}</td>
                </tr>
              ))}
              {registros.length === 0 && <tr><td colSpan={5} className="texto-suave">Nenhum registro.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
