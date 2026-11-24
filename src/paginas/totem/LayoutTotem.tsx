import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Logo } from '../../componentes/Logo';
import { unidades } from '../../mocks/dados';
import '../../estilos/totem.css';
import { useSessaoTotem } from './sessaoTotem';

export const TEMPO_INATIVIDADE_MS = 60_000;
const CONTAGEM_AVISO_S = 15;

/**
 * Totem compartilhado: depois de 60 s sem toque pergunta se a pessoa ainda
 * está ali; sem resposta em 15 s, apaga carrinho e identificação.
 */
export function LayoutTotem() {
  const { pathname } = useLocation();
  const navegar = useNavegarTotem();
  const [params] = useSearchParams();
  const { unidadeId, definirUnidade, encerrar } = useSessaoTotem();
  const [aviso, setAviso] = useState<number | null>(null);
  const timer = useRef<number>(undefined);
  const emDescanso = pathname === '/totem';
  const naConfirmacao = pathname === '/totem/confirmacao';

  useEffect(() => {
    const parametro = params.get('unidade');
    if (parametro && unidades.some((u) => u.id === parametro)) definirUnidade(parametro);
  }, [params, definirUnidade]);

  useEffect(() => {
    if (emDescanso || naConfirmacao) return;
    const reiniciar = () => {
      setAviso(null);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setAviso(CONTAGEM_AVISO_S), TEMPO_INATIVIDADE_MS);
    };
    reiniciar();
    const eventos = ['pointerdown', 'keydown', 'scroll'] as const;
    eventos.forEach((e) => window.addEventListener(e, reiniciar, { passive: true }));
    return () => {
      window.clearTimeout(timer.current);
      eventos.forEach((e) => window.removeEventListener(e, reiniciar));
    };
  }, [emDescanso, naConfirmacao, pathname]);

  useEffect(() => {
    if (aviso === null) return;
    if (aviso <= 0) {
      encerrar();
      setAviso(null);
      navegar('/totem');
      return;
    }
    const t = window.setTimeout(() => setAviso((a) => (a === null ? null : a - 1)), 1000);
    return () => window.clearTimeout(t);
  }, [aviso, encerrar, navegar]);

  const unidade = unidades.find((u) => u.id === unidadeId);

  return (
    <div className="totem">
      {!emDescanso && (
        <header className="totem-cabecalho">
          <Logo tamanho={56} />
          <span className="totem-unidade">{unidade?.nome}</span>
          {!naConfirmacao && (
            <button className="botao botao-secundario" onClick={() => { encerrar(); navegar('/totem'); }}>Cancelar pedido</button>
          )}
        </header>
      )}
      <main className="totem-conteudo"><Outlet /></main>

      {aviso !== null && (
        <div className="totem-sobreposicao" role="alertdialog" aria-labelledby="aviso-inatividade" aria-describedby="aviso-inatividade-texto">
          <div className="cartao totem-aviso">
            <h2 id="aviso-inatividade">Ainda está aí?</h2>
            <p id="aviso-inatividade-texto">Por segurança, o pedido será cancelado em <strong>{aviso}</strong> segundos.</p>
            <button className="botao botao-totem botao-bloco" onClick={() => setAviso(null)}>Continuar meu pedido</button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Mantém o ?unidade= da configuração do totem ao navegar */
export function useNavegarTotem() {
  const navegar = useNavigate();
  const [params] = useSearchParams();
  return (para: string) => {
    const unidade = params.get('unidade');
    navegar(unidade ? `${para}?unidade=${unidade}` : para);
  };
}
