import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Campo } from '../../componentes/Campo';
import { CONTA_DEMONSTRACAO, useSessao } from '../../estado/sessao';
import { emailValido } from '../../util/formatacao';

/** Aceita só caminhos internos no ?voltar= (evita redirecionamento aberto) */
export function destinoSeguro(valor: string | null, padrao = '/app') {
  return valor && valor.startsWith('/') && !valor.startsWith('//') ? valor : padrao;
}

export function Entrar() {
  const entrar = useSessao((s) => s.entrar);
  const navegar = useNavigate();
  const [params] = useSearchParams();
  const voltar = destinoSeguro(params.get('voltar'));
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erros, setErros] = useState<{ email?: string; senha?: string; geral?: string }>({});
  const [enviando, setEnviando] = useState(false);

  async function enviar(e: FormEvent, credenciais = { email, senha }) {
    e.preventDefault();
    const novos: typeof erros = {};
    if (!emailValido(credenciais.email)) novos.email = 'Informe um e-mail válido, como nome@exemplo.com.';
    if (!credenciais.senha) novos.senha = 'Informe sua senha.';
    setErros(novos);
    if (Object.keys(novos).length) return;

    setEnviando(true);
    const resultado = await entrar(credenciais.email, credenciais.senha);
    setEnviando(false);
    if (resultado.ok) navegar(voltar, { replace: true });
    else setErros({ geral: resultado.erro });
  }

  return (
    <div className="container pagina" style={{ maxWidth: '28rem' }}>
      <h1>Entrar</h1>
      <form className="cartao pilha" onSubmit={enviar} noValidate>
        {erros.geral && <div className="aviso aviso-erro" role="alert"><p>{erros.geral}</p></div>}
        <Campo rotulo="E-mail" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} erro={erros.email} required />
        <Campo rotulo="Senha" type="password" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} erro={erros.senha} required />
        <button className="botao botao-bloco" disabled={enviando}>{enviando ? 'Entrando…' : 'Entrar'}</button>
        <p className="texto-pequeno" style={{ textAlign: 'center', margin: 0 }}>
          Não tem conta? <Link to={`/app/cadastro?voltar=${encodeURIComponent(voltar)}`}>Criar conta</Link>
        </p>
      </form>

      <div className="aviso aviso-info" style={{ marginTop: 'var(--e5)' }}>
        <div>
          <p className="texto-pequeno"><strong>Para avaliação:</strong> conta de demonstração com pontos e todos os consentimentos ativos.</p>
          <button
            className="botao botao-secundario"
            onClick={(e) => { setEmail(CONTA_DEMONSTRACAO.email); setSenha(CONTA_DEMONSTRACAO.senha); void enviar(e, CONTA_DEMONSTRACAO); }}
          >
            Entrar com conta de demonstração
          </button>
        </div>
      </div>
    </div>
  );
}
