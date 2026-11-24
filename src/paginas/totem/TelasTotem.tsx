import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { IlustracaoProduto, ROTULO_CATEGORIA } from '../../componentes/CartaoProduto';
import { Icone } from '../../componentes/Icone';
import { SimboloSol } from '../../componentes/Logo';
import { PainelPagamento } from '../../componentes/PainelPagamento';
import { Quantidade } from '../../componentes/Quantidade';
import { ResumoValores } from '../../componentes/ResumoValores';
import type { CategoriaProduto, FormaPagamento } from '../../dominio/tipos';
import { contarItens, useCarrinhoTotem } from '../../estado/carrinho';
import { usePedidos } from '../../estado/pedidos';
import { useSessao } from '../../estado/sessao';
import { unidades } from '../../mocks/dados';
import { resolverCardapio } from '../../servicos/cardapio';
import { precificar } from '../../servicos/precificacao';
import { usePagamento } from '../../servicos/usePagamento';
import { cpfValido, formatarMoeda } from '../../util/formatacao';
import { useNavegarTotem } from './LayoutTotem';
import { CPF_DEMONSTRACAO, useSessaoTotem } from './sessaoTotem';

function usePrecoTotem() {
  const carrinho = useCarrinhoTotem();
  const { unidadeId, clienteId } = useSessaoTotem();
  const cliente = useSessao((s) => s.clientes.find((c) => c.id === clienteId) ?? null);
  return { carrinho, cliente, unidadeId, valores: precificar({ itens: carrinho.itens, unidadeId, cliente }) };
}

export function TotemDescanso() {
  const navegar = useNavegarTotem();
  const unidade = unidades.find((u) => u.id === useSessaoTotem.getState().unidadeId);
  return (
    <button className="totem-descanso" onClick={() => navegar('/totem/cardapio')}>
      <SimboloSol tamanho={180} />
      <span className="totem-descanso-titulo">Raízes do Nordeste</span>
      <span className="totem-descanso-unidade">{unidade?.nome}</span>
      <span className="totem-descanso-chamada"><Icone nome="toque" tamanho={40} /> Toque para fazer seu pedido</span>
      <span className="totem-descanso-rodape">Sem cadastro. Se quiser somar pontos, é só informar o CPF no final.</span>
    </button>
  );
}

export function TotemCardapio() {
  const navegar = useNavegarTotem();
  const { carrinho, unidadeId, valores } = usePrecoTotem();
  const unidade = unidades.find((u) => u.id === unidadeId)!;
  const itens = useMemo(() => resolverCardapio(unidade), [unidade]);
  const categorias = [...new Set(itens.map((i) => i.produto.categoria))];
  const [categoria, setCategoria] = useState<CategoriaProduto>(categorias[0]);

  useEffect(() => { carrinho.selecionarUnidade(unidadeId); }, [unidadeId]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="totem-cardapio">
      <nav className="totem-categorias" aria-label="Categorias">
        {categorias.map((c) => (
          <button key={c} aria-pressed={categoria === c} onClick={() => setCategoria(c)}>{ROTULO_CATEGORIA[c]}</button>
        ))}
      </nav>
      <div className="totem-produtos">
        {itens.filter((i) => i.produto.categoria === categoria).map((item) => {
          const noCarrinho = carrinho.itens.find((i) => i.produtoId === item.produto.id)?.quantidade ?? 0;
          return (
            <button
              key={item.produto.id}
              className={`totem-produto ${noCarrinho ? 'selecionado' : ''}`}
              disabled={!item.disponivel}
              onClick={() => carrinho.adicionar({ produtoId: item.produto.id, nome: item.produto.nome, precoUnitario: item.preco })}
            >
              <IlustracaoProduto item={item} tamanho={120} />
              <span className="totem-produto-nome">{item.produto.nome}</span>
              <span className="totem-produto-preco">{item.disponivel ? formatarMoeda(item.preco) : 'Esgotado'}</span>
              {noCarrinho > 0 && <span className="totem-produto-qtd" aria-label={`${noCarrinho} no pedido`}>{noCarrinho}</span>}
            </button>
          );
        })}
      </div>
      <div className="totem-barra">
        <span className="totem-barra-total">{contarItens(carrinho.itens)} itens · {formatarMoeda(valores.subtotal)}</span>
        <button className="botao botao-totem" disabled={carrinho.itens.length === 0} onClick={() => navegar('/totem/carrinho')}>Revisar pedido</button>
      </div>
    </div>
  );
}

export function TotemCarrinho() {
  const navegar = useNavegarTotem();
  const { carrinho, valores } = usePrecoTotem();
  if (carrinho.itens.length === 0) return <Navigate to="/totem/cardapio" replace />;
  return (
    <div className="totem-pagina">
      <h1>Revise seu pedido</h1>
      <div className="cartao totem-lista">
        {carrinho.itens.map((i) => (
          <div key={i.produtoId} className="totem-item">
            <span>{i.nome}<br /><small>{formatarMoeda(i.precoUnitario)}</small></span>
            <Quantidade nome={i.nome} valor={i.quantidade} aoMudar={(q) => carrinho.alterarQuantidade(i.produtoId, q)} />
          </div>
        ))}
      </div>
      <ResumoValores valores={valores} grande />
      <div className="totem-acoes">
        <button className="botao botao-secundario botao-totem" onClick={() => navegar('/totem/cardapio')}>Adicionar mais</button>
        <button className="botao botao-totem" onClick={() => navegar('/totem/identificacao')}>Continuar</button>
      </div>
    </div>
  );
}

const TECLAS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'limpar', '0', 'apagar'];

export function TotemIdentificacao() {
  const navegar = useNavegarTotem();
  const vincular = useSessaoTotem((s) => s.vincular);
  const [digitos, setDigitos] = useState('');
  const [erro, setErro] = useState<string>();
  const [resultado, setResultado] = useState<string>();

  // Na tela pública, os dígitos aparecem ocultos; só os 2 finais ficam visíveis ao completar
  const exibicao = '•••.•••.•••-••'.split('').map((c, i, arr) => {
    const posicoes = arr.map((x, j) => (x === '•' ? j : -1)).filter((j) => j >= 0);
    const indice = posicoes.indexOf(i);
    if (indice === -1) return c;
    if (indice >= digitos.length) return '_';
    return digitos.length === 11 && indice >= 9 ? digitos[indice] : '•';
  }).join('');

  function tocar(tecla: string) {
    setErro(undefined);
    if (tecla === 'limpar') return setDigitos('');
    if (tecla === 'apagar') return setDigitos((d) => d.slice(0, -1));
    setDigitos((d) => (d.length < 11 ? d + tecla : d));
  }

  function confirmar() {
    if (!cpfValido(digitos)) return setErro('CPF inválido. Confira os números.');
    const clienteId = digitos === CPF_DEMONSTRACAO ? 'cli-demo' : undefined;
    vincular(clienteId, digitos.slice(-2));
    setDigitos('');
    if (clienteId) navegar('/totem/pagamento');
    else setResultado('Não encontramos conta com este CPF. Seu pedido segue normalmente, sem pontos.');
  }

  if (resultado) {
    return (
      <div className="totem-pagina">
        <div className="aviso aviso-atencao"><p>{resultado}</p></div>
        <button className="botao botao-totem" onClick={() => navegar('/totem/pagamento')}>Ir para o pagamento</button>
      </div>
    );
  }

  return (
    <div className="totem-pagina">
      <h1>Quer somar pontos?</h1>
      <p className="totem-texto">Digite seu CPF para creditar pontos na sua conta Raízes. É opcional.</p>
      <div className="totem-cpf" aria-live="polite" aria-label={`CPF, ${digitos.length} de 11 dígitos`}>{exibicao}</div>
      {erro && <div className="aviso aviso-erro" role="alert"><p>{erro}</p></div>}
      <div className="totem-teclado">
        {TECLAS.map((t) => (
          <button key={t} onClick={() => tocar(t)} aria-label={t === 'apagar' ? 'Apagar último dígito' : t === 'limpar' ? 'Limpar' : t}>
            {t === 'apagar' ? '⌫' : t === 'limpar' ? 'Limpar' : t}
          </button>
        ))}
      </div>
      <p className="texto-pequeno texto-suave">O CPF é usado só para localizar sua conta e não fica salvo neste totem. Teste: 529.982.247-25</p>
      <div className="totem-acoes">
        <button className="botao botao-secundario botao-totem" onClick={() => { vincular(undefined, undefined); navegar('/totem/pagamento'); }}>Pular</button>
        <button className="botao botao-totem" disabled={digitos.length !== 11} onClick={confirmar}>Confirmar CPF</button>
      </div>
    </div>
  );
}

export function TotemPagamento() {
  const navegar = useNavegarTotem();
  const { carrinho, cliente, unidadeId, valores } = usePrecoTotem();
  const { pedidoId, definirPedido, cpfFinal } = useSessaoTotem();
  const criar = usePedidos((s) => s.criar);
  const { fase, mensagem, pagar } = usePagamento(pedidoId);
  const [formaPendente, setFormaPendente] = useState<FormaPagamento>();

  useEffect(() => {
    if (pedidoId && formaPendente) { void pagar(formaPendente); setFormaPendente(undefined); }
  }, [pedidoId, formaPendente, pagar]);

  useEffect(() => {
    if (fase === 'aprovado') navegar('/totem/confirmacao');
  }, [fase]); // eslint-disable-line react-hooks/exhaustive-deps

  if (carrinho.itens.length === 0) return <Navigate to="/totem/cardapio" replace />;

  function aoPagar(forma: FormaPagamento) {
    if (pedidoId) return void pagar(forma);
    const pedido = criar({ unidadeId, canal: 'totem', itens: carrinho.itens, precificacao: valores, forma, clienteId: cliente?.id });
    definirPedido(pedido.id);
    setFormaPendente(forma);
  }

  return (
    <div className="totem-pagina">
      <h1>Pagamento</h1>
      <div className="totem-total">Total <strong>{formatarMoeda(valores.total)}</strong></div>
      {cliente && <div className="aviso aviso-sucesso"><p>Pontos serão creditados na conta do CPF final {cpfFinal}: +{valores.pontosGerados} pontos.</p></div>}
      <div className="cartao">
        <PainelPagamento totem fase={fase === 'ocioso' && formaPendente ? 'processando' : fase} mensagem={mensagem} aoPagar={aoPagar} rotuloBotao="Pagar" />
      </div>
    </div>
  );
}

export function TotemConfirmacao() {
  const navegar = useNavegarTotem();
  const { pedidoId, encerrar } = useSessaoTotem();
  const pedido = usePedidos((s) => s.pedidos.find((p) => p.id === pedidoId));
  const [restante, setRestante] = useState(20);

  useEffect(() => {
    if (restante <= 0) { encerrar(); navegar('/totem'); return; }
    const t = window.setTimeout(() => setRestante((r) => r - 1), 1000);
    return () => window.clearTimeout(t);
  }, [restante]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!pedido) return <Navigate to="/totem" replace />;

  return (
    <div className="totem-pagina totem-confirmacao">
      <span className="totem-check"><Icone nome="check" tamanho={72} /></span>
      <h1>Pedido confirmado!</h1>
      <p className="totem-texto">Sua senha de retirada é</p>
      <div className="codigo-retirada totem-senha">{pedido.codigoRetirada}</div>
      <p className="totem-texto">Acompanhe o painel e retire no balcão quando sua senha aparecer.</p>
      <button className="botao botao-totem" onClick={() => { encerrar(); navegar('/totem'); }}>Concluir</button>
      <p className="texto-suave">Esta tela fecha sozinha em {restante} s.</p>
    </div>
  );
}
