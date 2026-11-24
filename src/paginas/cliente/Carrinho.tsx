import { Link, useNavigate } from 'react-router-dom';
import { Quantidade } from '../../componentes/Quantidade';
import { ResumoValores } from '../../componentes/ResumoValores';
import { useCarrinho } from '../../estado/carrinho';
import { useClienteAtual } from '../../estado/sessao';
import { recompensas, unidades } from '../../mocks/dados';
import { precificar } from '../../servicos/precificacao';
import { formatarMoeda } from '../../util/formatacao';

export function Carrinho() {
  const carrinho = useCarrinho();
  const cliente = useClienteAtual();
  const navegar = useNavigate();
  const unidade = unidades.find((u) => u.id === carrinho.unidadeId);
  const recompensa = recompensas.find((r) => r.id === carrinho.recompensaId);
  const valores = precificar({ itens: carrinho.itens, unidadeId: carrinho.unidadeId ?? '', cliente, recompensa });
  const participaFidelidade = !!cliente?.consentimentos.programaFidelidade;

  if (carrinho.itens.length === 0) {
    return (
      <div className="container pagina pilha" style={{ maxWidth: '36rem' }}>
        <h1>Seu carrinho está vazio</h1>
        <p className="texto-suave">Escolha uma unidade e adicione itens do cardápio.</p>
        <Link to={unidade ? `/app/unidade/${unidade.id}` : '/app'} className="botao">Ver cardápio</Link>
      </div>
    );
  }

  return (
    <div className="container pagina">
      <h1>Carrinho</h1>
      <p className="texto-suave">Retirada em <strong>{unidade?.nome}</strong> · <Link to="/app">trocar</Link></p>

      <div className="layout-checkout">
        <div className="pilha">
          <section className="cartao" aria-label="Itens do pedido">
            {carrinho.itens.map((item) => (
              <div key={item.produtoId} className="item-carrinho">
                <div>
                  <strong>{item.nome}</strong>
                  <div className="texto-suave texto-pequeno">{formatarMoeda(item.precoUnitario)} cada</div>
                </div>
                <strong>{formatarMoeda(item.precoUnitario * item.quantidade)}</strong>
                <Quantidade nome={item.nome} valor={item.quantidade} aoMudar={(q) => carrinho.alterarQuantidade(item.produtoId, q)} />
                <button className="botao botao-texto" onClick={() => carrinho.remover(item.produtoId)}>Remover</button>
              </div>
            ))}
          </section>

          {cliente && participaFidelidade && (
            <section className="cartao-plano pilha" aria-labelledby="titulo-recompensa">
              <div className="linha-entre">
                <h2 id="titulo-recompensa" style={{ margin: 0, fontSize: '1.15rem' }}>Usar pontos</h2>
                <span className="selo selo-anil">{cliente.pontos} pontos</span>
              </div>
              <div className="pilha" role="radiogroup" aria-labelledby="titulo-recompensa" style={{ gap: 'var(--e2)' }}>
                <label className="escolha">
                  <input type="radio" name="recompensa" checked={!carrinho.recompensaId} onChange={() => carrinho.aplicarRecompensa(undefined)} />
                  Não usar pontos agora
                </label>
                {recompensas.map((r) => {
                  const suficiente = cliente.pontos >= r.custoPontos;
                  return (
                    <label key={r.id} className="escolha" style={suficiente ? undefined : { opacity: 0.55, cursor: 'not-allowed' }}>
                      <input type="radio" name="recompensa" disabled={!suficiente} checked={carrinho.recompensaId === r.id} onChange={() => carrinho.aplicarRecompensa(r.id)} />
                      <span>{r.titulo} <span className="texto-suave texto-pequeno">· {r.custoPontos} pontos{!suficiente ? ' (saldo insuficiente)' : ''}</span></span>
                    </label>
                  );
                })}
              </div>
            </section>
          )}

          {cliente && !participaFidelidade && (
            <div className="aviso aviso-info"><p>Você não participa do programa de fidelidade. <Link to="/app/fidelidade">Saiba como funciona</Link>.</p></div>
          )}
        </div>

        <aside className="cartao pilha" aria-label="Resumo">
          <h2 style={{ fontSize: '1.25rem' }}>Resumo</h2>
          <ResumoValores valores={valores} />
          {cliente ? (
            <button className="botao botao-bloco" onClick={() => navegar('/app/pagamento')}>Ir para pagamento</button>
          ) : (
            <div className="pilha">
              <div className="aviso aviso-info"><p>Entre na sua conta para pagar e acompanhar o pedido.</p></div>
              <Link to="/app/entrar?voltar=/app/carrinho" className="botao botao-bloco">Entrar</Link>
              <Link to="/app/cadastro?voltar=/app/carrinho" className="botao botao-secundario botao-bloco">Criar conta</Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
