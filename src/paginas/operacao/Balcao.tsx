import { useEffect, useMemo, useState } from 'react';
import { Dialogo } from '../../componentes/Dialogo';
import { PainelPagamento } from '../../componentes/PainelPagamento';
import { Quantidade } from '../../componentes/Quantidade';
import { ResumoValores } from '../../componentes/ResumoValores';
import type { FormaPagamento, Pedido } from '../../dominio/tipos';
import { useCarrinhoBalcao } from '../../estado/carrinho';
import { useOperacao } from '../../estado/operacao';
import { ROTULO_STATUS, usePedidos } from '../../estado/pedidos';
import { unidades } from '../../mocks/dados';
import { resolverCardapio } from '../../servicos/cardapio';
import { precificar } from '../../servicos/precificacao';
import { usePagamento } from '../../servicos/usePagamento';
import { formatarHora, formatarMoeda } from '../../util/formatacao';

const MOTIVOS = ['Cliente desistiu', 'Item indisponível', 'Pedido duplicado', 'Erro no registro'];

export function Balcao() {
  const { unidadeId, perfil } = useOperacao();
  const unidade = unidades.find((u) => u.id === unidadeId)!;
  const cardapio = useMemo(() => resolverCardapio(unidade), [unidade]);
  const carrinho = useCarrinhoBalcao();
  const { pedidos, criar, avancar, cancelar } = usePedidos();
  const [nome, setNome] = useState('');
  const [pedidoId, setPedidoId] = useState<string>();
  const [formaPendente, setFormaPendente] = useState<FormaPagamento>();
  const { fase, mensagem, pagar } = usePagamento(pedidoId);
  const [busca, setBusca] = useState('');
  const [cancelando, setCancelando] = useState<Pedido>();
  const [motivo, setMotivo] = useState(MOTIVOS[0]);
  const [confirmacao, setConfirmacao] = useState<string>();

  const valores = precificar({ itens: carrinho.itens, unidadeId });

  useEffect(() => { carrinho.selecionarUnidade(unidadeId); }, [unidadeId]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (pedidoId && formaPendente) { void pagar(formaPendente); setFormaPendente(undefined); }
  }, [pedidoId, formaPendente, pagar]);
  useEffect(() => {
    if (fase === 'aprovado' && pedidoId) {
      const p = usePedidos.getState().pedidos.find((x) => x.id === pedidoId);
      setConfirmacao(`Pedido ${p?.codigoRetirada} enviado para a cozinha.`);
      carrinho.limpar(); setNome(''); setPedidoId(undefined);
    }
  }, [fase]); // eslint-disable-line react-hooks/exhaustive-deps

  function aoPagar(forma: FormaPagamento) {
    if (pedidoId) return void pagar(forma);
    const p = criar({ unidadeId, canal: 'balcao', itens: carrinho.itens, precificacao: valores, forma, nomeChamada: nome.trim().split(' ')[0] || undefined });
    setPedidoId(p.id);
    setFormaPendente(forma);
  }

  const termo = busca.trim().toUpperCase();
  const emAndamento = pedidos
    .filter((p) => p.unidadeId === unidadeId && ['recebido', 'em-preparo', 'pronto'].includes(p.status))
    .filter((p) => !termo || p.codigoRetirada.includes(termo) || p.nomeChamada?.toUpperCase().includes(termo));

  return (
    <div className="balcao">
      <section className="cartao pilha" aria-labelledby="novo-pedido">
        <h2 id="novo-pedido">Novo pedido</h2>
        {confirmacao && <div className="aviso aviso-sucesso" role="status"><p>{confirmacao}</p></div>}
        <div className="balcao-produtos">
          {cardapio.map((item) => (
            <button key={item.produto.id} className="balcao-produto" disabled={!item.disponivel || !!pedidoId}
              onClick={() => { setConfirmacao(undefined); carrinho.adicionar({ produtoId: item.produto.id, nome: item.produto.nome, precoUnitario: item.preco }); }}>
              <span>{item.produto.nome}</span>
              <strong>{item.disponivel ? formatarMoeda(item.preco) : 'Esgotado'}</strong>
            </button>
          ))}
        </div>
      </section>

      <section className="cartao pilha" aria-labelledby="pedido-atual">
        <h2 id="pedido-atual">Pedido atual</h2>
        {carrinho.itens.length === 0 ? <p className="texto-suave">Toque nos produtos para adicionar.</p> : (
          <>
            {carrinho.itens.map((i) => (
              <div key={i.produtoId} className="linha-entre">
                <span>{i.nome}</span>
                <Quantidade nome={i.nome} valor={i.quantidade} aoMudar={(q) => carrinho.alterarQuantidade(i.produtoId, q)} />
              </div>
            ))}
            <div className="campo">
              <label htmlFor="nome-chamada">Nome para chamada (opcional)</label>
              <input id="nome-chamada" className="entrada" value={nome} onChange={(e) => setNome(e.target.value)} maxLength={20} disabled={!!pedidoId} />
              <span className="dica">Só o primeiro nome. Não peça CPF nem telefone aqui.</span>
            </div>
            <ResumoValores valores={valores} />
            <PainelPagamento fase={fase === 'ocioso' && formaPendente ? 'processando' : fase} mensagem={mensagem} aoPagar={aoPagar} rotuloBotao="Cobrar na maquininha" />
          </>
        )}
      </section>

      <section className="cartao pilha balcao-lista" aria-labelledby="em-andamento">
        <div className="linha-entre">
          <h2 id="em-andamento" style={{ margin: 0 }}>Em andamento</h2>
          <input className="entrada" type="search" placeholder="Buscar código ou nome" aria-label="Buscar pedido por código ou nome" value={busca} onChange={(e) => setBusca(e.target.value)} style={{ maxWidth: '14rem' }} />
        </div>
        <div className="rolagem-horizontal">
          <table className="tabela">
            <thead><tr><th scope="col">Código</th><th scope="col">Chegada</th><th scope="col">Status</th><th scope="col">Ações</th></tr></thead>
            <tbody>
              {emAndamento.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.codigoRetirada}</strong>{p.nomeChamada ? <div className="texto-pequeno">{p.nomeChamada}</div> : null}</td>
                  <td>{formatarHora(p.criadoEm)}</td>
                  <td>{ROTULO_STATUS[p.status]}</td>
                  <td>
                    <div className="linha" style={{ gap: 'var(--e2)' }}>
                      {p.status === 'pronto' && <button className="botao" onClick={() => avancar(p.id, perfil ?? 'atendente')}>Entregar</button>}
                      <button className="botao botao-secundario" onClick={() => { setCancelando(p); setMotivo(MOTIVOS[0]); }}>Cancelar</button>
                    </div>
                  </td>
                </tr>
              ))}
              {emAndamento.length === 0 && <tr><td colSpan={4} className="texto-suave">Nenhum pedido em andamento.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <Dialogo aberto={!!cancelando} titulo={`Cancelar pedido ${cancelando?.codigoRetirada ?? ''}?`} aoFechar={() => setCancelando(undefined)}>
        <p className="texto-pequeno">O cancelamento fica registrado na auditoria com seu perfil, data e motivo.{cancelando?.pagamento.status === 'aprovado' ? ' O estorno é solicitado ao serviço de pagamento.' : ''}</p>
        <div className="campo" style={{ marginBottom: 'var(--e4)' }}>
          <label htmlFor="motivo">Motivo</label>
          <select id="motivo" className="entrada" value={motivo} onChange={(e) => setMotivo(e.target.value)}>
            {MOTIVOS.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div className="linha">
          <button className="botao botao-secundario" onClick={() => setCancelando(undefined)}>Voltar</button>
          <button className="botao botao-perigo" onClick={() => { if (cancelando) cancelar(cancelando.id, motivo, perfil ?? 'atendente'); setCancelando(undefined); }}>Confirmar cancelamento</button>
        </div>
      </Dialogo>
    </div>
  );
}
