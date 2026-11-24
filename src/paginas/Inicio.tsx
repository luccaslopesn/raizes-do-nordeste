import { Link } from 'react-router-dom';
import { Icone, type NomeIcone } from '../componentes/Icone';
import { Logo } from '../componentes/Logo';
import '../estilos/cliente.css';

const canais: { para: string; titulo: string; texto: string; icone: NomeIcone; destaque?: boolean }[] = [
  { para: '/app', titulo: 'App e site do cliente', texto: 'Escolher unidade, cardápio, pagamento, acompanhamento, fidelidade e privacidade. Mobile-first.', icone: 'carrinho', destaque: true },
  { para: '/totem', titulo: 'Totem de autoatendimento', texto: 'Pedido por toque, CPF opcional para pontos e limpeza automática da sessão.', icone: 'toque' },
  { para: '/operacao', titulo: 'Operação da loja', texto: 'Balcão, cozinha e painel do gerente com auditoria. Acesso por perfil.', icone: 'painel' },
  { para: '/painel?unidade=rec-boa-vista', titulo: 'Painel de chamada', texto: 'Tela da loja com os códigos em preparo e prontos.', icone: 'relogio' },
];

const roteiro: { passo: string; link?: string; rotulo?: string }[] = [
  { passo: 'Faça um pedido no app com a conta de demonstração e pague com Pix.', link: '/app/entrar?voltar=/app', rotulo: 'Entrar' },
  { passo: 'Em outra aba, entre na operação como Cozinha (PIN 1234) e avance o pedido. O app atualiza sozinho.', link: '/operacao', rotulo: 'Operação' },
  { passo: 'Simule pagamento recusado, tempo esgotado e serviço instável.', link: '/app/carrinho?pagamento=recusar', rotulo: 'Recusar' },
  { passo: 'Compare o cardápio de uma unidade completa com uma reduzida.', link: '/app/unidade/sp-paulista', rotulo: 'Unidade reduzida' },
  { passo: 'Crie uma conta nova: os consentimentos opcionais começam desmarcados.', link: '/app/cadastro', rotulo: 'Cadastro' },
  { passo: 'Revogue consentimentos, baixe ou exclua seus dados.', link: '/app/privacidade', rotulo: 'Privacidade' },
];

export function Inicio() {
  return (
    <div className="app-cliente" style={{ paddingBottom: 0 }}>
      <section className="heroi">
        <div className="container">
          <Logo tamanho={56} />
          <h1 style={{ marginTop: 'var(--e5)' }}>Protótipo multicanal da rede Raízes do Nordeste</h1>
          <p>Interface front-end com dados simulados e pagamento por serviço externo simulado. Nenhum pagamento real é feito.</p>
        </div>
      </section>

      <main className="container pagina pilha">
        <h2>Escolha um canal</h2>
        <div className="grade grade-2">
          {canais.map((c) => (
            <Link key={c.para} to={c.para} className="cartao cartao-unidade" style={c.destaque ? { background: 'var(--sol-claro)' } : undefined}>
              <span style={{ color: 'var(--barro)' }}><Icone nome={c.icone} tamanho={32} /></span>
              <h3>{c.titulo}</h3>
              <span className="texto-suave">{c.texto}</span>
            </Link>
          ))}
        </div>

        <section className="cartao-plano pilha" aria-labelledby="roteiro">
          <h2 id="roteiro">Roteiro rápido de avaliação</h2>
          <ol className="pilha" style={{ paddingLeft: 'var(--e5)', margin: 0 }}>
            {roteiro.map((r) => (
              <li key={r.passo}>{r.passo} {r.link && <Link to={r.link}>{r.rotulo} →</Link>}</li>
            ))}
          </ol>
          <p className="texto-pequeno texto-suave" style={{ margin: 0 }}>
            Cenários de pagamento: acrescente <code>?pagamento=recusar</code>, <code>?pagamento=expirar</code> ou <code>?pagamento=instavel</code> à URL antes de pagar.
            Conta de demonstração: demo@raizes.com.br / raizes123. CPF de teste no totem: 529.982.247-25.
          </p>
        </section>
      </main>

      <footer className="rodape">
        <div className="container texto-pequeno">Projeto Multidisciplinar · Trilha Front-end · Lucas Lopes Nepomusceno · RU 4589258</div>
      </footer>
    </div>
  );
}
