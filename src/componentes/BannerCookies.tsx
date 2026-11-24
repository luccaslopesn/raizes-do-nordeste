import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePrivacidade } from '../estado/privacidade';

/**
 * LGPD: nada além do essencial roda antes da escolha. "Recusar" tem o
 * mesmo peso visual de "Aceitar" (sem padrão enganoso).
 */
export function BannerCookies() {
  const { cookies, definirCookies } = usePrivacidade();
  // Só aparece com as fontes carregadas: evita que o banner mude de altura na tela (CLS)
  const [fontesProntas, setFontesProntas] = useState(false);
  useEffect(() => {
    const liberar = () => setFontesProntas(true);
    const limite = window.setTimeout(liberar, 1200);
    document.fonts?.ready.then(liberar).catch(liberar);
    return () => window.clearTimeout(limite);
  }, []);
  if (cookies.decididoEm || !fontesProntas) return null;

  return (
    <section className="banner-cookies" role="region" aria-labelledby="titulo-cookies">
      <div className="container banner-cookies-conteudo">
        <div>
          <h2 id="titulo-cookies" className="banner-cookies-titulo">Sua privacidade</h2>
          <p className="texto-pequeno">
            Usamos cookies essenciais para manter seu carrinho e sua sessão. Com sua permissão, usamos também
            cookies de análise para entender como o app é usado. Você pode mudar isso depois na{' '}
            <Link to="/app/privacidade">Central de Privacidade</Link>.
          </p>
        </div>
        <div className="linha banner-cookies-acoes">
          <button className="botao botao-secundario" onClick={() => definirCookies(false)}>Só essenciais</button>
          <button className="botao botao-secundario" onClick={() => definirCookies(true)}>Aceitar análise</button>
        </div>
      </div>
    </section>
  );
}
