import { Link } from 'react-router-dom';
import { useCarrinho } from '../../estado/carrinho';
import { useClienteAtual, useSessao } from '../../estado/sessao';
import { campanhas, unidades } from '../../mocks/dados';
import { campanhasVisiveis } from '../../servicos/precificacao';

export function Promocoes() {
  const cliente = useClienteAtual();
  const atualizar = useSessao((s) => s.atualizarConsentimentos);
  const { unidadeId } = useCarrinho();
  const unidade = unidades.find((u) => u.id === unidadeId);

  // Sem unidade escolhida, mostra as campanhas da rede toda
  const visiveis = unidade ? campanhasVisiveis(unidade.id, cliente) : campanhas.filter((c) => !c.segmentada && !c.unidadesIds?.length);
  const existemSegmentadas = campanhas.some((c) => c.segmentada);
  const recebeSegmentadas = !!cliente?.consentimentos.marketingSegmentado;

  return (
    <div className="container pagina pilha" style={{ maxWidth: '44rem' }}>
      <h1>Promoções</h1>
      <p className="texto-suave">{unidade ? `Válidas em ${unidade.nome}.` : <>Campanhas da rede. <Link to="/app">Escolha uma unidade</Link> para ver as ofertas locais.</>}</p>

      {visiveis.map((c) => (
        <article key={c.id} className={`cartao cartao-campanha ${c.segmentada ? 'segmentada' : ''}`}>
          <div className="linha-entre">
            <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{c.titulo}</h2>
            {c.segmentada && <span className="selo selo-anil">Para você</span>}
          </div>
          <p style={{ margin: 'var(--e2) 0 0' }}>{c.descricao}</p>
          <p className="texto-pequeno texto-suave" style={{ margin: 0 }}>Válida até {new Date(c.validaAte + 'T12:00').toLocaleDateString('pt-BR')}. Aplicada automaticamente no carrinho. Campanhas de desconto não se acumulam.</p>
        </article>
      ))}

      {existemSegmentadas && !recebeSegmentadas && (
        <div className="aviso aviso-info">
          <div>
            <p><strong>Ofertas personalizadas estão desativadas.</strong> Algumas campanhas usam seu histórico de pedidos e só aparecem com sua autorização.</p>
            {cliente
              ? <button className="botao botao-secundario" onClick={() => atualizar({ marketingSegmentado: true })}>Ativar ofertas personalizadas</button>
              : <Link to="/app/entrar?voltar=/app/promocoes">Entre para ver ofertas para você</Link>}
          </div>
        </div>
      )}
    </div>
  );
}
