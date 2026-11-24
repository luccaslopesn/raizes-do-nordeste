import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Campo } from '../../componentes/Campo';
import { useSessao } from '../../estado/sessao';
import { emailValido } from '../../util/formatacao';
import { destinoSeguro } from './Entrar';

type Erros = Partial<Record<'nome' | 'email' | 'senha' | 'confirmacao' | 'termos' | 'dataNascimento' | 'geral', string>>;

export function Cadastro() {
  const cadastrar = useSessao((s) => s.cadastrar);
  const navegar = useNavigate();
  const [params] = useSearchParams();
  const voltar = destinoSeguro(params.get('voltar'));

  const [form, setForm] = useState({ nome: '', email: '', telefone: '', senha: '', confirmacao: '', dataNascimento: '' });
  // LGPD: todos os consentimentos começam desmarcados
  const [consentimentos, setConsentimentos] = useState({ termosEPrivacidade: false, programaFidelidade: false, marketingSegmentado: false });
  const [erros, setErros] = useState<Erros>({});
  const [enviando, setEnviando] = useState(false);

  const alterar = (campo: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [campo]: e.target.value });

  function validar(): Erros {
    const e: Erros = {};
    if (form.nome.trim().length < 3) e.nome = 'Informe seu nome (mínimo 3 letras).';
    if (!emailValido(form.email)) e.email = 'Informe um e-mail válido, como nome@exemplo.com.';
    if (form.senha.length < 8) e.senha = 'A senha precisa ter pelo menos 8 caracteres.';
    else if (!/\d/.test(form.senha) || !/[a-zA-Z]/.test(form.senha)) e.senha = 'Use letras e números na senha.';
    if (form.confirmacao !== form.senha) e.confirmacao = 'As senhas não conferem.';
    if (!consentimentos.termosEPrivacidade) e.termos = 'Para criar a conta, aceite os Termos de Uso e a Política de Privacidade.';
    if (consentimentos.programaFidelidade && form.dataNascimento && new Date(form.dataNascimento) > new Date()) e.dataNascimento = 'Data inválida.';
    return e;
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    const encontrados = validar();
    setErros(encontrados);
    if (Object.keys(encontrados).length) {
      document.querySelector<HTMLElement>('[aria-invalid="true"], #consent-termos')?.focus();
      return;
    }
    setEnviando(true);
    const r = await cadastrar({ ...form, consentimentos });
    setEnviando(false);
    if (r.ok) navegar(voltar, { replace: true });
    else setErros({ geral: r.erro });
  }

  return (
    <div className="container pagina" style={{ maxWidth: '34rem' }}>
      <h1>Criar conta</h1>
      <p className="texto-suave">Pedimos só o necessário para você fazer e acompanhar pedidos.</p>

      <form className="cartao pilha" onSubmit={enviar} noValidate>
        {erros.geral && <div className="aviso aviso-erro" role="alert"><p>{erros.geral}</p></div>}
        <Campo rotulo="Nome" autoComplete="name" value={form.nome} onChange={alterar('nome')} erro={erros.nome} required dica="Usado para chamar você no balcão." />
        <Campo rotulo="E-mail" type="email" autoComplete="email" value={form.email} onChange={alterar('email')} erro={erros.email} required dica="Usado para entrar e receber o comprovante." />
        <Campo rotulo="Telefone (opcional)" type="tel" autoComplete="tel" value={form.telefone} onChange={alterar('telefone')} dica="Só para avisar se houver problema com o pedido." />
        <Campo rotulo="Senha" type="password" autoComplete="new-password" value={form.senha} onChange={alterar('senha')} erro={erros.senha} required dica="Mínimo de 8 caracteres, com letras e números." />
        <Campo rotulo="Confirmar senha" type="password" autoComplete="new-password" value={form.confirmacao} onChange={alterar('confirmacao')} erro={erros.confirmacao} required />

        <fieldset className="pilha" style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend className="rotulo" style={{ marginBottom: 'var(--e2)' }}>Privacidade e consentimentos</legend>

          <label className="opcao-consentimento">
            <input
              id="consent-termos" type="checkbox" checked={consentimentos.termosEPrivacidade}
              onChange={(e) => setConsentimentos({ ...consentimentos, termosEPrivacidade: e.target.checked })}
              aria-invalid={erros.termos ? true : undefined} aria-describedby={erros.termos ? 'erro-termos' : undefined}
            />
            <span>
              <strong>Li e aceito os Termos de Uso e a <Link to="/app/politica-de-privacidade" target="_blank">Política de Privacidade</Link> (obrigatório)</strong>
              <span className="texto-pequeno texto-suave">Necessário para processar seus pedidos.</span>
            </span>
          </label>
          {erros.termos && <span id="erro-termos" className="erro-campo texto-pequeno" style={{ color: 'var(--erro)' }} role="alert">{erros.termos}</span>}

          <label className="opcao-consentimento">
            <input type="checkbox" checked={consentimentos.programaFidelidade} onChange={(e) => setConsentimentos({ ...consentimentos, programaFidelidade: e.target.checked })} />
            <span>
              <strong>Quero participar do programa de fidelidade (opcional)</strong>
              <span className="texto-pequeno texto-suave">Guardamos seu histórico de pedidos para somar pontos e liberar recompensas.</span>
            </span>
          </label>

          {consentimentos.programaFidelidade && (
            <Campo
              rotulo="Data de nascimento (opcional)" type="date" value={form.dataNascimento} onChange={alterar('dataNascimento')} erro={erros.dataNascimento}
              dica="Finalidade: liberar o benefício do mês do seu aniversário. Se você sair do programa, este dado é apagado."
            />
          )}

          <label className="opcao-consentimento">
            <input type="checkbox" checked={consentimentos.marketingSegmentado} onChange={(e) => setConsentimentos({ ...consentimentos, marketingSegmentado: e.target.checked })} />
            <span>
              <strong>Quero receber ofertas personalizadas (opcional)</strong>
              <span className="texto-pequeno texto-suave">Usamos seus pedidos anteriores para sugerir promoções. Você pode desativar quando quiser.</span>
            </span>
          </label>
        </fieldset>

        <button className="botao botao-bloco" disabled={enviando}>{enviando ? 'Criando conta…' : 'Criar conta'}</button>
        <p className="texto-pequeno" style={{ textAlign: 'center', margin: 0 }}>Já tem conta? <Link to={`/app/entrar?voltar=${encodeURIComponent(voltar)}`}>Entrar</Link></p>
      </form>
    </div>
  );
}
