import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { PainelPagamento } from '../../componentes/PainelPagamento';
import { ResumoValores } from '../../componentes/ResumoValores';
import type { FormaPagamento } from '../../dominio/tipos';
import { useCarrinho } from '../../estado/carrinho';
import { usePedidos } from '../../estado/pedidos';
import { useClienteAtual } from '../../estado/sessao';
import { recompensas, unidades } from '../../mocks/dados';
import { resolverCardapio } from '../../servicos/cardapio';
import { lerCenarioPagamento } from '../../servicos/gatewayPagamento';
import { precificar } from '../../servicos/precificacao';
import { usePagamento } from '../../servicos/usePagamento';

export function Pagamento() {
  const carrinho = useCarrinho();
  const cliente = useClienteAtual();
  const criarPedido = usePedidos((s) => s.criar);
  const navegar = useNavigate();
  const [pedidoId, setPedidoId] = useState<string>();
  const [problema, setProblema] = useState<string>();
  const { fase, mensagem, pagar } = usePagamento(pedidoId);
  const [formaPendente, setFormaPendente] = useState<FormaPagamento>();

  const unidade = unidades.find((u) => u.id === carrinho.unidadeId);
  const recompensa = recompensas.find((r) => r.id === carrinho.recompensaId);
  const valores = precificar({ itens: carrinho.itens, unidadeId: carrinho.unidadeId ?? '', cliente, recompensa });
  const cenario = lerCenarioPagamento();

  // O pedido só existe depois do primeiro clique; o pagamento dispara assim que o id está disponível
  useEffect(() => {
    if (pedidoId && formaPendente) {
      void pagar(formaPendente);
      setFormaPendente(undefined);
    }
  }, [pedidoId, formaPendente, pagar]);

  useEffect(() => {
    if (fase === 'aprovado' && pedidoId) {
      carrinho.limpar();
      navegar(`/app/pedido/${pedidoId}`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fase, pedidoId]);

  if (!cliente) return <Navigate to="/app/entrar?voltar=/app/pagamento" replace />;
  if (!unidade || (carrinho.itens.length === 0 && !pedidoId)) return <Navigate to="/app/carrinho" replace />;

  function aoPagar(forma: FormaPagamento) {
    if (pedidoId) return void pagar(forma);

    // Revalida disponibilidade: o estoque pode ter mudado enquanto a pessoa escolhia
    const cardapio = resolverCardapio(unidade!);
    const indisponiveis = carrinho.itens.filter((i) => !cardapio.find((c) => c.produto.id === i.produtoId)?.disponivel);
    if (indisponiveis.length) {
      setProblema(`Item esgotado: ${indisponiveis.map((i) => i.nome).join(', ')}. Remova do carrinho para continuar.`);
      return;
    }
    const pedido = criarPedido({
      unidadeId: unidade!.id, canal: 'app', itens: carrinho.itens, precificacao: valores, forma,
      clienteId: cliente!.id, nomeChamada: cliente!.nome.split(' ')[0], recompensaId: recompensa?.id,
    });
    setPedidoId(pedido.id);
    setFormaPendente(forma);
  }

  return (
    <div className="container pagina">
      <Link to="/app/carrinho" className="texto-pequeno">← Voltar ao carrinho</Link>
      <h1 style={{ marginTop: 'var(--e2)' }}>Pagamento</h1>
      {cenario !== 'aprovar' && (
        <div className="aviso aviso-info" style={{ marginBottom: 'var(--e4)' }}>
          <p className="texto-pequeno">Modo de teste ativo: o serviço de pagamento vai simular <strong>{cenario}</strong>.</p>
        </div>
      )}
      <div className="layout-checkout">
        <section className="cartao" aria-label="Pagamento">
          {problema ? (
            <div className="aviso aviso-erro" role="alert"><div><p>{problema}</p><Link to="/app/carrinho">Revisar carrinho</Link></div></div>
          ) : (
            <PainelPagamento fase={fase === 'ocioso' && formaPendente ? 'processando' : fase} mensagem={mensagem} aoPagar={aoPagar} rotuloBotao="Pagar e enviar pedido" />
          )}
        </section>
        <aside className="cartao-plano pilha" aria-label="Resumo do pedido">
          <h2 style={{ fontSize: '1.15rem' }}>Pedido para retirada</h2>
          <p className="texto-suave texto-pequeno">{unidade.nome}</p>
          <ul className="texto-pequeno" style={{ paddingLeft: 'var(--e4)', margin: 0 }}>
            {carrinho.itens.map((i) => <li key={i.produtoId}>{i.quantidade}× {i.nome}</li>)}
          </ul>
          <ResumoValores valores={valores} />
        </aside>
      </div>
    </div>
  );
}
