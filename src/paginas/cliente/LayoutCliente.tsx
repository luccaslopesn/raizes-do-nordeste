import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { BannerCookies } from '../../componentes/BannerCookies';
import { Icone, type NomeIcone } from '../../componentes/Icone';
import { Logo } from '../../componentes/Logo';
import { contarItens, useCarrinho } from '../../estado/carrinho';
import { useClienteAtual } from '../../estado/sessao';
import { unidades } from '../../mocks/dados';
import '../../estilos/cliente.css';

const navegacao: { para: string; rotulo: string; icone: NomeIcone }[] = [
  { para: '/app', rotulo: 'Cardápio', icone: 'cardapio' },
  { para: '/app/promocoes', rotulo: 'Promoções', icone: 'etiqueta' },
  { para: '/app/pedidos', rotulo: 'Pedidos', icone: 'recibo' },
  { para: '/app/conta', rotulo: 'Conta', icone: 'usuario' },
];

export function LayoutCliente() {
  const { itens, unidadeId } = useCarrinho();
  const cliente = useClienteAtual();
  const unidade = unidades.find((u) => u.id === unidadeId);
  const quantidade = contarItens(itens);
  const { pathname } = useLocation();

  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  return (
    <div className="app-cliente">
      <a href="#conteudo" className="pular-para-conteudo">Pular para o conteúdo</a>
      <header className="cabecalho">
        <div className="container cabecalho-conteudo">
          <Link to="/app" className="cabecalho-marca" aria-label="Raízes do Nordeste (página inicial)"><Logo tamanho={36} /></Link>

          {unidade && (
            <Link to="/app" className="cabecalho-unidade" title="Trocar unidade">
              <Icone nome="local" tamanho={18} />
              <span><span className="visualmente-oculto">Unidade: </span>{unidade.nome}</span>
            </Link>
          )}

          <nav className="nav-desktop" aria-label="Principal">
            {navegacao.map((n) => (
              <NavLink key={n.para} to={unidade && n.para === '/app' ? `/app/unidade/${unidade.id}` : n.para} end={n.para === '/app'}>
                {n.para === '/app/conta' && cliente ? cliente.nome.split(' ')[0] : n.rotulo}
              </NavLink>
            ))}
            <NavLink to="/app/fidelidade">Fidelidade</NavLink>
          </nav>

          <Link to="/app/carrinho" className="cabecalho-carrinho" aria-label={`Carrinho, ${quantidade} ${quantidade === 1 ? 'item' : 'itens'}`}>
            <Icone nome="carrinho" />
            {quantidade > 0 && <span className="contador" aria-hidden="true">{quantidade}</span>}
          </Link>
        </div>
      </header>

      <main id="conteudo" className="conteudo-cliente">
        <Outlet />
      </main>

      <footer className="rodape">
        <div className="container linha-entre">
          <span className="texto-pequeno">Raízes do Nordeste · protótipo acadêmico, dados simulados</span>
          <nav className="linha texto-pequeno" aria-label="Rodapé">
            <Link to="/app/privacidade">Central de Privacidade</Link>
            <Link to="/app/politica-de-privacidade">Política de Privacidade</Link>
            <Link to="/">Outros canais</Link>
          </nav>
        </div>
      </footer>

      <nav className="nav-inferior" aria-label="Atalhos">
        {navegacao.map((n) => (
          <NavLink key={n.para} to={unidade && n.para === '/app' ? `/app/unidade/${unidade.id}` : n.para} end={n.para === '/app'}>
            <Icone nome={n.icone} />
            <span>{n.rotulo}</span>
          </NavLink>
        ))}
      </nav>

      <BannerCookies />
    </div>
  );
}
