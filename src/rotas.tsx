import { createBrowserRouter } from 'react-router-dom';
import { EmConstrucao } from './paginas/EmConstrucao';
import { Inicio } from './paginas/Inicio';

/**
 * Mapa de telas por canal. Cada rota vira um wireframe no documento e
 * um caso de uso no diagrama, então os nomes aqui são a referência única.
 */
export const mapaDeTelas = {
  cliente: [
    ['/app', 'Escolher unidade'],
    ['/app/unidade/:unidadeId', 'Cardápio da unidade'],
    ['/app/produto/:produtoId', 'Detalhe do produto'],
    ['/app/carrinho', 'Carrinho'],
    ['/app/pagamento', 'Pagamento (serviço externo)'],
    ['/app/pedido/:pedidoId', 'Acompanhar pedido'],
    ['/app/entrar', 'Entrar'],
    ['/app/cadastro', 'Cadastro com consentimentos'],
    ['/app/fidelidade', 'Fidelidade e recompensas'],
    ['/app/promocoes', 'Promoções e campanhas'],
    ['/app/privacidade', 'Central de privacidade'],
  ],
  totem: [
    ['/totem', 'Tela de descanso'],
    ['/totem/cardapio', 'Cardápio (touch)'],
    ['/totem/identificacao', 'Identificação opcional para pontos'],
    ['/totem/pagamento', 'Pagamento'],
    ['/totem/confirmacao', 'Senha de retirada'],
  ],
  operacao: [
    ['/balcao', 'Balcão: novo pedido e consulta'],
    ['/cozinha', 'Cozinha: fila de preparo'],
    ['/gestao', 'Gerente: indicadores e auditoria'],
  ],
} as const;

const rotasEmConstrucao = Object.values(mapaDeTelas)
  .flat()
  .map(([path, titulo]) => ({ path, element: <EmConstrucao titulo={titulo} /> }));

export const roteador = createBrowserRouter([
  { path: '/', element: <Inicio /> },
  ...rotasEmConstrucao,
  { path: '*', element: <EmConstrucao titulo="Página não encontrada" /> },
]);
