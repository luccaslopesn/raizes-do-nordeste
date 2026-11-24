import type { Pedido } from '../dominio/tipos';
import { FLUXO_STATUS, ROTULO_STATUS } from '../estado/pedidos';
import { formatarHora } from '../util/formatacao';

/** Etapas do pedido com o horário de cada transição */
export function LinhaDoTempo({ pedido }: { pedido: Pedido }) {
  if (pedido.status === 'cancelado') {
    return (
      <div className="aviso aviso-erro" role="status">
        <p><strong>Pedido cancelado.</strong> {pedido.cancelamento?.motivo}</p>
      </div>
    );
  }
  const etapas = FLUXO_STATUS.slice(1);
  const atual = etapas.indexOf(pedido.status);

  return (
    <ol className="linha-do-tempo" aria-label="Andamento do pedido">
      {etapas.map((status, i) => {
        const momento = pedido.historico.find((h) => h.status === status);
        const estado = i < atual ? 'feito' : i === atual ? 'atual' : 'futuro';
        return (
          <li key={status} className={`etapa etapa-${estado}`} aria-current={estado === 'atual' ? 'step' : undefined}>
            <span className="etapa-marcador" aria-hidden="true" />
            <span className="etapa-rotulo">{ROTULO_STATUS[status]}</span>
            {momento && <time className="etapa-hora" dateTime={momento.em}>{formatarHora(momento.em)}</time>}
          </li>
        );
      })}
    </ol>
  );
}
