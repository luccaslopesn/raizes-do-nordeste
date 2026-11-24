import { useState, type FormEvent } from 'react';
import { Navigate, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from '../../componentes/Logo';
import { ACESSO, PIN_DEMONSTRACAO, useOperacao, type PerfilEquipe } from '../../estado/operacao';
import { unidades } from '../../mocks/dados';
import '../../estilos/operacao.css';

const ROTULO_PERFIL: Record<PerfilEquipe, string> = { atendente: 'Atendente', cozinha: 'Cozinha', gerente: 'Gerente' };
const ROTULO_AREA = { balcao: 'Balcão', cozinha: 'Cozinha', gestao: 'Gestão' } as const;

export function EntrarOperacao() {
  const entrar = useOperacao((s) => s.entrar);
  const navegar = useNavigate();
  const [perfil, setPerfil] = useState<PerfilEquipe>('atendente');
  const [unidadeId, setUnidadeId] = useState('rec-boa-vista');
  const [pin, setPin] = useState('');
  const [erro, setErro] = useState<string>();

  function enviar(e: FormEvent) {
    e.preventDefault();
    if (!entrar(perfil, pin, unidadeId)) return setErro('PIN incorreto.');
    navegar(`/${ACESSO[perfil][0]}`);
  }

  return (
    <div className="operacao-login">
      <form className="cartao pilha" onSubmit={enviar} style={{ width: '100%', maxWidth: '26rem' }}>
        <Logo />
        <h1 style={{ fontSize: '1.6rem' }}>Operação da loja</h1>
        <fieldset className="pilha" style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend className="rotulo" style={{ marginBottom: 'var(--e2)' }}>Perfil</legend>
          {(Object.keys(ROTULO_PERFIL) as PerfilEquipe[]).map((p) => (
            <label key={p} className="escolha">
              <input type="radio" name="perfil" checked={perfil === p} onChange={() => setPerfil(p)} />
              <span><strong>{ROTULO_PERFIL[p]}</strong> <span className="texto-pequeno texto-suave">· acessa {ACESSO[p].map((a) => ROTULO_AREA[a]).join(', ')}</span></span>
            </label>
          ))}
        </fieldset>
        <div className="campo">
          <label htmlFor="unidade-op">Unidade</label>
          <select id="unidade-op" className="entrada" value={unidadeId} onChange={(e) => setUnidadeId(e.target.value)}>
            {unidades.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
          </select>
        </div>
        <div className="campo">
          <label htmlFor="pin">PIN</label>
          <input id="pin" className="entrada" type="password" inputMode="numeric" autoComplete="off" maxLength={6} value={pin} onChange={(e) => { setPin(e.target.value); setErro(undefined); }} aria-invalid={erro ? true : undefined} aria-describedby="pin-dica" />
          <span id="pin-dica" className="dica">Demonstração: {PIN_DEMONSTRACAO}</span>
          {erro && <span className="erro-campo" role="alert">{erro}</span>}
        </div>
        <button className="botao botao-bloco">Entrar</button>
      </form>
    </div>
  );
}

export function LayoutOperacao({ area }: { area: 'balcao' | 'cozinha' | 'gestao' }) {
  const { perfil, unidadeId, sair } = useOperacao();
  const { pathname } = useLocation();
  if (!perfil) return <Navigate to={`/operacao?voltar=${pathname}`} replace />;
  if (!ACESSO[perfil].includes(area)) {
    return (
      <div className="operacao-login">
        <div className="cartao pilha" style={{ maxWidth: '26rem' }}>
          <h1 style={{ fontSize: '1.5rem' }}>Acesso negado</h1>
          <p>O perfil {ROTULO_PERFIL[perfil]} não tem acesso a {ROTULO_AREA[area]}.</p>
          <NavLink className="botao" to={`/${ACESSO[perfil][0]}`}>Ir para {ROTULO_AREA[ACESSO[perfil][0]]}</NavLink>
        </div>
      </div>
    );
  }
  const unidade = unidades.find((u) => u.id === unidadeId);

  return (
    <div className="operacao">
      <header className="operacao-barra">
        <Logo tamanho={32} compacto />
        <strong>{unidade?.nome}</strong>
        <nav className="operacao-nav" aria-label="Áreas">
          {ACESSO[perfil].map((a) => <NavLink key={a} to={`/${a}`}>{ROTULO_AREA[a]}</NavLink>)}
        </nav>
        <span className="operacao-perfil">{ROTULO_PERFIL[perfil]}</span>
        <button className="botao botao-secundario" onClick={sair}>Sair</button>
      </header>
      <main className="operacao-conteudo"><Outlet /></main>
    </div>
  );
}
