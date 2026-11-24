import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dialogo } from '../../componentes/Dialogo';
import { usePedidos } from '../../estado/pedidos';
import { usePrivacidade } from '../../estado/privacidade';
import { useClienteAtual, useSessao } from '../../estado/sessao';
import { formatarDataHora } from '../../util/formatacao';

/** Direitos do titular (LGPD art. 18) acessíveis em um só lugar */
export function Privacidade() {
  const cliente = useClienteAtual();
  const { atualizarConsentimentos, excluirConta } = useSessao();
  const { cookies, definirCookies } = usePrivacidade();
  const pedidos = usePedidos((s) => s.pedidos);
  const navegar = useNavigate();
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [aviso, setAviso] = useState('');

  function exportarDados() {
    if (!cliente) return;
    const { senhaHash: _omitida, ...dadosPessoais } = cliente;
    const conteudo = {
      geradoEm: new Date().toISOString(),
      titular: dadosPessoais,
      pedidos: pedidos.filter((p) => p.clienteId === cliente.id).map(({ pagamento, ...p }) => ({ ...p, pagamento: { forma: pagamento.forma, status: pagamento.status } })),
    };
    const blob = new Blob([JSON.stringify(conteudo, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'meus-dados-raizes-do-nordeste.json';
    link.click();
    URL.revokeObjectURL(link.href);
    setAviso('Arquivo com seus dados gerado.');
  }

  return (
    <div className="container pagina pilha" style={{ maxWidth: '44rem' }}>
      <p className="sobretitulo">LGPD</p>
      <h1>Central de Privacidade</h1>
      <p className="texto-suave">Veja quais dados temos, para que usamos e mude suas escolhas quando quiser. <Link to="/app/politica-de-privacidade">Ler a Política de Privacidade</Link>.</p>
      <p className="visualmente-oculto" aria-live="polite">{aviso}</p>

      <section className="cartao pilha" aria-labelledby="titulo-cookies-pref">
        <h2 id="titulo-cookies-pref" style={{ fontSize: '1.2rem' }}>Cookies neste dispositivo</h2>
        <label className="opcao-consentimento">
          <input type="checkbox" checked disabled />
          <span><strong>Essenciais</strong><span className="texto-pequeno texto-suave">Carrinho e sessão. Sem eles o app não funciona.</span></span>
        </label>
        <label className="opcao-consentimento">
          <input type="checkbox" checked={cookies.analiticos} onChange={(e) => { definirCookies(e.target.checked); setAviso('Preferência de cookies salva.'); }} />
          <span><strong>Análise de uso</strong><span className="texto-pequeno texto-suave">Estatísticas anônimas de navegação para melhorar o app.</span></span>
        </label>
      </section>

      {!cliente ? (
        <div className="aviso aviso-info"><p><Link to="/app/entrar?voltar=/app/privacidade">Entre na sua conta</Link> para ver seus dados e consentimentos.</p></div>
      ) : (
        <>
          <section className="cartao pilha" aria-labelledby="titulo-dados">
            <h2 id="titulo-dados" style={{ fontSize: '1.2rem' }}>Seus dados</h2>
            <div className="rolagem-horizontal">
              <table className="tabela">
                <thead><tr><th scope="col">Dado</th><th scope="col">Valor</th><th scope="col">Por que temos</th></tr></thead>
                <tbody>
                  <tr><td>Nome</td><td>{cliente.nome}</td><td>Identificar e chamar você na retirada</td></tr>
                  <tr><td>E-mail</td><td>{cliente.email}</td><td>Acesso à conta e comprovantes</td></tr>
                  <tr><td>Telefone</td><td>{cliente.telefone ?? 'Não informado'}</td><td>Contato sobre problemas no pedido</td></tr>
                  <tr><td>Nascimento</td><td>{cliente.dataNascimento ? new Date(cliente.dataNascimento + 'T12:00').toLocaleDateString('pt-BR') : 'Não guardado'}</td><td>Benefício de aniversário (só com fidelidade)</td></tr>
                  <tr><td>Pontos</td><td>{cliente.pontos}</td><td>Programa de fidelidade</td></tr>
                </tbody>
              </table>
            </div>
            <p className="texto-pequeno texto-suave" style={{ margin: 0 }}>Dados de cartão nunca passam por nós: ficam com o serviço de pagamento.</p>
          </section>

          <section className="cartao pilha" aria-labelledby="titulo-consent">
            <h2 id="titulo-consent" style={{ fontSize: '1.2rem' }}>Consentimentos</h2>
            <label className="opcao-consentimento">
              <input type="checkbox" checked disabled />
              <span><strong>Termos de Uso e Política de Privacidade</strong><span className="texto-pequeno texto-suave">Necessário para manter a conta. Para revogar, exclua a conta abaixo.</span></span>
            </label>
            <label className="opcao-consentimento">
              <input type="checkbox" checked={cliente.consentimentos.programaFidelidade} onChange={(e) => { atualizarConsentimentos({ programaFidelidade: e.target.checked }); setAviso('Consentimento atualizado.'); }} />
              <span><strong>Programa de fidelidade</strong><span className="texto-pequeno texto-suave">Ao sair, você deixa de acumular pontos e sua data de nascimento é apagada.</span></span>
            </label>
            <label className="opcao-consentimento">
              <input type="checkbox" checked={cliente.consentimentos.marketingSegmentado} onChange={(e) => { atualizarConsentimentos({ marketingSegmentado: e.target.checked }); setAviso('Consentimento atualizado.'); }} />
              <span><strong>Ofertas personalizadas</strong><span className="texto-pequeno texto-suave">Uso do histórico de pedidos para sugerir promoções.</span></span>
            </label>
            <p className="texto-pequeno texto-suave" style={{ margin: 0 }}>Última alteração: {formatarDataHora(cliente.consentimentos.atualizadoEm)}</p>
          </section>

          <section className="cartao pilha" aria-labelledby="titulo-direitos">
            <h2 id="titulo-direitos" style={{ fontSize: '1.2rem' }}>Seus direitos</h2>
            <div className="linha">
              <button className="botao botao-secundario" onClick={exportarDados}>Baixar meus dados</button>
              <button className="botao botao-perigo" onClick={() => setConfirmarExclusao(true)}>Excluir minha conta</button>
            </div>
          </section>

          <Dialogo aberto={confirmarExclusao} titulo="Excluir conta?" aoFechar={() => setConfirmarExclusao(false)}>
            <p>Seus dados pessoais e pontos serão apagados. Pedidos já pagos são mantidos de forma anônima pelo prazo exigido pela legislação fiscal.</p>
            <div className="linha">
              <button className="botao botao-secundario" onClick={() => setConfirmarExclusao(false)}>Cancelar</button>
              <button className="botao botao-perigo" onClick={() => { excluirConta(); setConfirmarExclusao(false); navegar('/app'); }}>Excluir definitivamente</button>
            </div>
          </Dialogo>
        </>
      )}
    </div>
  );
}
