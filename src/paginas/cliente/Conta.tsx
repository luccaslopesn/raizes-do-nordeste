import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Icone } from '../../componentes/Icone';
import { useClienteAtual, useSessao } from '../../estado/sessao';

export function Conta() {
  const cliente = useClienteAtual();
  const sair = useSessao((s) => s.sair);
  const navegar = useNavigate();
  if (!cliente) return <Navigate to="/app/entrar?voltar=/app/conta" replace />;

  const atalhos = [
    { para: '/app/pedidos', titulo: 'Meus pedidos', texto: 'Acompanhe e reveja pedidos', icone: 'recibo' as const },
    { para: '/app/fidelidade', titulo: 'Fidelidade', texto: cliente.consentimentos.programaFidelidade ? `${cliente.pontos} pontos` : 'Você não participa', icone: 'estrela' as const },
    { para: '/app/promocoes', titulo: 'Promoções', texto: 'Campanhas ativas', icone: 'etiqueta' as const },
    { para: '/app/privacidade', titulo: 'Central de Privacidade', texto: 'Seus dados e consentimentos', icone: 'escudo' as const },
  ];

  return (
    <div className="container pagina pilha" style={{ maxWidth: '44rem' }}>
      <p className="sobretitulo">Minha conta</p>
      <h1>Olá, {cliente.nome.split(' ')[0]}</h1>
      <div className="grade grade-2">
        {atalhos.map((a) => (
          <Link key={a.para} to={a.para} className="cartao cartao-unidade">
            <span style={{ color: 'var(--barro)' }}><Icone nome={a.icone} tamanho={28} /></span>
            <h3>{a.titulo}</h3>
            <span className="texto-suave texto-pequeno">{a.texto}</span>
          </Link>
        ))}
      </div>
      <button className="botao botao-secundario" onClick={() => { sair(); navegar('/app'); }}><Icone nome="sair" /> Sair da conta</button>
    </div>
  );
}
