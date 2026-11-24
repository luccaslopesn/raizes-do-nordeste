import type { ResultadoPrecificacao } from '../servicos/precificacao';
import { formatarMoeda } from '../util/formatacao';

export function ResumoValores({ valores, grande = false }: { valores: ResultadoPrecificacao; grande?: boolean }) {
  return (
    <dl className={`resumo-valores ${grande ? 'resumo-grande' : ''}`}>
      <div><dt>Subtotal</dt><dd>{formatarMoeda(valores.subtotal)}</dd></div>
      {valores.descontoCampanha > 0 && (
        <div className="desconto"><dt>{valores.campanhaAplicada?.titulo ?? 'Campanha'}</dt><dd>− {formatarMoeda(valores.descontoCampanha)}</dd></div>
      )}
      {valores.descontoRecompensa > 0 && (
        <div className="desconto"><dt>Recompensa de fidelidade</dt><dd>− {formatarMoeda(valores.descontoRecompensa)}</dd></div>
      )}
      <div className="total"><dt>Total</dt><dd>{formatarMoeda(valores.total)}</dd></div>
      {valores.pontosGerados > 0 && (
        <div className="pontos"><dt>Você ganha</dt><dd>{valores.pontosGerados} pontos{valores.pontosEmDobro ? ' (em dobro)' : ''}</dd></div>
      )}
    </dl>
  );
}
