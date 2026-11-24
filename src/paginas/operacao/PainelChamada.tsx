import { useSearchParams } from 'react-router-dom';
import { Logo } from '../../componentes/Logo';
import { usePedidos } from '../../estado/pedidos';
import { unidades } from '../../mocks/dados';
import '../../estilos/operacao.css';

/** TV da loja: mostra só o código, nunca nome completo */
export function PainelChamada() {
  const [params] = useSearchParams();
  const unidadeId = params.get('unidade') ?? 'rec-boa-vista';
  const todos = usePedidos((s) => s.pedidos);
  const pedidos = todos.filter((p) => p.unidadeId === unidadeId);
  const preparando = pedidos.filter((p) => p.status === 'recebido' || p.status === 'em-preparo');
  const prontos = pedidos.filter((p) => p.status === 'pronto');

  return (
    <div className="painel-chamada">
      <header className="linha-entre"><Logo tamanho={48} /><span>{unidades.find((u) => u.id === unidadeId)?.nome}</span></header>
      <div className="painel-colunas">
        <section aria-labelledby="pc-preparo"><h2 id="pc-preparo">Preparando</h2><div className="painel-codigos">{preparando.map((p) => <span key={p.id}>{p.codigoRetirada}</span>)}</div></section>
        <section aria-labelledby="pc-pronto" className="painel-prontos" aria-live="polite"><h2 id="pc-pronto">Pode retirar</h2><div className="painel-codigos">{prontos.map((p) => <span key={p.id}>{p.codigoRetirada}</span>)}</div></section>
      </div>
    </div>
  );
}
