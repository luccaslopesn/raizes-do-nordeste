import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { roteador } from './rotas';
import './estilos/base.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={roteador} />
  </StrictMode>,
);
