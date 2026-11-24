import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { usePedidos } from './estado/pedidos';
import { useSessao } from './estado/sessao';
import { sincronizarEntreAbas } from './estado/sincronizarAbas';
import { roteador } from './rotas';
import './estilos/base.css';

// App, cozinha e painel abertos em abas diferentes enxergam os mesmos pedidos
sincronizarEntreAbas(usePedidos, useSessao);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={roteador} />
  </StrictMode>,
);
