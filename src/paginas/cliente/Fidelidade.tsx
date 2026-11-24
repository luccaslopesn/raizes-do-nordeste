import { Link } from 'react-router-dom';
import { useCarrinho } from '../../estado/carrinho';
import { useClienteAtual, useSessao } from '../../estado/sessao';
import { PONTOS_POR_REAL, recompensas } from '../../mocks/dados';

export function Fidelidade() {
  const cliente = useClienteAtual();
  const atualizar = useSessao((s) => s.atualizarConsentimentos);
  const carrinho = useCarrinho();

  const comoFunciona = (
    <section className="cartao-plano pilha">
      <h2 style={{ fontSize: '1.15rem' }}>Como funciona</h2>
      <ul style={{ margin: 0, paddingLeft: 'var(--e4)' }}>
        <li>Cada R$ 1 pago vira {PONTOS_POR_REAL} ponto, em qualquer canal: app, site ou totem.</li>
        <li>Pedidos até 9h valem pontos em dobro.</li>
        <li>Os pontos entram quando o pagamento é aprovado e saem se o pedido for cancelado.</li>
      </ul>
    </section>
  );

  if (!cliente) {
    return (
      <div className="container pagina pilha" style={{ maxWidth: '40rem' }}>
        <h1>Programa de fidelidade</h1>
        <p className="texto-suave">Junte pontos a cada pedido e troque por produtos e descontos.</p>
        {comoFunciona}
        <div className="linha">
          <Link to="/app/cadastro?voltar=/app/fidelidade" className="botao">Criar conta</Link>
          <Link to="/app/entrar?voltar=/app/fidelidade" className="botao botao-secundario">Entrar</Link>
        </div>
      </div>
    );
  }

  if (!cliente.consentimentos.programaFidelidade) {
    return (
      <div className="container pagina pilha" style={{ maxWidth: '40rem' }}>
        <h1>Programa de fidelidade</h1>
        <div className="aviso aviso-info"><p>Você ainda não participa. Para somar pontos, precisamos guardar o histórico dos seus pedidos. Você pode sair a qualquer momento pela Central de Privacidade.</p></div>
        {comoFunciona}
        <button className="botao" onClick={() => atualizar({ programaFidelidade: true })}>Quero participar</button>
      </div>
    );
  }

  const proxima = recompensas.find((r) => r.custoPontos > cliente.pontos);
  const progresso = proxima ? Math.min(100, (cliente.pontos / proxima.custoPontos) * 100) : 100;

  return (
    <div className="container pagina pilha" style={{ maxWidth: '44rem' }}>
      <h1>Fidelidade</h1>
      <section className="cartao-pontos pilha" aria-label="Saldo de pontos">
        <span className="texto-pequeno">Seu saldo</span>
        <span className="numero">{cliente.pontos} <span style={{ fontSize: '1.25rem' }}>pontos</span></span>
        {proxima && (
          <>
            <div className="barra-progresso" role="progressbar" aria-valuemin={0} aria-valuemax={proxima.custoPontos} aria-valuenow={cliente.pontos} aria-label={`Progresso até ${proxima.titulo}`}>
              <span style={{ width: `${progresso}%` }} />
            </div>
            <span className="texto-pequeno">Faltam {proxima.custoPontos - cliente.pontos} pontos para {proxima.titulo.toLowerCase()}</span>
          </>
        )}
      </section>

      <h2>Recompensas</h2>
      <div className="grade grade-3">
        {recompensas.map((r) => {
          const pode = cliente.pontos >= r.custoPontos;
          const aplicada = carrinho.recompensaId === r.id;
          return (
            <article key={r.id} className="cartao pilha">
              <h3 style={{ margin: 0 }}>{r.titulo}</h3>
              <span className="selo selo-anil" style={{ alignSelf: 'start' }}>{r.custoPontos} pontos</span>
              <button className="botao botao-secundario" disabled={!pode || carrinho.itens.length === 0} onClick={() => carrinho.aplicarRecompensa(aplicada ? undefined : r.id)}>
                {aplicada ? 'Remover do carrinho' : pode ? 'Usar no próximo pedido' : 'Pontos insuficientes'}
              </button>
            </article>
          );
        })}
      </div>
      {carrinho.itens.length === 0 && <p className="texto-pequeno texto-suave">Adicione itens ao carrinho para usar uma recompensa.</p>}
      {comoFunciona}
    </div>
  );
}
