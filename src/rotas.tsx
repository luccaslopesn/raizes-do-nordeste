import { createBrowserRouter, Link } from 'react-router-dom';
import { Inicio } from './paginas/Inicio';
import { AcompanharPedido } from './paginas/cliente/AcompanharPedido';
import { Cadastro } from './paginas/cliente/Cadastro';
import { Cardapio } from './paginas/cliente/Cardapio';
import { Carrinho } from './paginas/cliente/Carrinho';
import { Conta } from './paginas/cliente/Conta';
import { Entrar } from './paginas/cliente/Entrar';
import { EscolherUnidade } from './paginas/cliente/EscolherUnidade';
import { Fidelidade } from './paginas/cliente/Fidelidade';
import { LayoutCliente } from './paginas/cliente/LayoutCliente';
import { MeusPedidos } from './paginas/cliente/MeusPedidos';
import { Pagamento } from './paginas/cliente/Pagamento';
import { PoliticaPrivacidade } from './paginas/cliente/PoliticaPrivacidade';
import { Privacidade } from './paginas/cliente/Privacidade';
import { Promocoes } from './paginas/cliente/Promocoes';

/*
 * Divisão de código por canal: quem abre o app do cliente no celular não
 * baixa o código do totem nem da operação da loja (requisito de performance).
 */
const totem = () => import('./paginas/totem/TelasTotem');
const operacao = () => import('./paginas/operacao/LayoutOperacao');

function NaoEncontrada() {
  return (
    <div className="container pagina pilha">
      <h1>Página não encontrada</h1>
      <Link to="/" className="botao" style={{ alignSelf: 'start' }}>Voltar ao início</Link>
    </div>
  );
}

export const roteador = createBrowserRouter([
  { path: '/', element: <Inicio /> },
  {
    path: '/app',
    element: <LayoutCliente />,
    children: [
      { index: true, element: <EscolherUnidade /> },
      { path: 'unidade/:unidadeId', element: <Cardapio /> },
      { path: 'carrinho', element: <Carrinho /> },
      { path: 'pagamento', element: <Pagamento /> },
      { path: 'pedido/:pedidoId', element: <AcompanharPedido /> },
      { path: 'pedidos', element: <MeusPedidos /> },
      { path: 'entrar', element: <Entrar /> },
      { path: 'cadastro', element: <Cadastro /> },
      { path: 'conta', element: <Conta /> },
      { path: 'fidelidade', element: <Fidelidade /> },
      { path: 'promocoes', element: <Promocoes /> },
      { path: 'privacidade', element: <Privacidade /> },
      { path: 'politica-de-privacidade', element: <PoliticaPrivacidade /> },
      { path: '*', element: <NaoEncontrada /> },
    ],
  },
  {
    path: '/totem',
    lazy: async () => ({ Component: (await import('./paginas/totem/LayoutTotem')).LayoutTotem }),
    children: [
      { index: true, lazy: async () => ({ Component: (await totem()).TotemDescanso }) },
      { path: 'cardapio', lazy: async () => ({ Component: (await totem()).TotemCardapio }) },
      { path: 'carrinho', lazy: async () => ({ Component: (await totem()).TotemCarrinho }) },
      { path: 'identificacao', lazy: async () => ({ Component: (await totem()).TotemIdentificacao }) },
      { path: 'pagamento', lazy: async () => ({ Component: (await totem()).TotemPagamento }) },
      { path: 'confirmacao', lazy: async () => ({ Component: (await totem()).TotemConfirmacao }) },
    ],
  },
  { path: '/operacao', lazy: async () => ({ Component: (await operacao()).EntrarOperacao }) },
  ...(['balcao', 'cozinha', 'gestao'] as const).map((area) => ({
    path: `/${area}`,
    lazy: async () => {
      const { LayoutOperacao } = await operacao();
      return { Component: () => <LayoutOperacao area={area} /> };
    },
    children: [{
      index: true,
      lazy: async () => {
        if (area === 'balcao') return { Component: (await import('./paginas/operacao/Balcao')).Balcao };
        if (area === 'cozinha') return { Component: (await import('./paginas/operacao/Cozinha')).Cozinha };
        return { Component: (await import('./paginas/operacao/Gestao')).Gestao };
      },
    }],
  })),
  { path: '/painel', lazy: async () => ({ Component: (await import('./paginas/operacao/PainelChamada')).PainelChamada }) },
  { path: '*', element: <NaoEncontrada /> },
]);
