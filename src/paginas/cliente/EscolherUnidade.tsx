import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icone } from '../../componentes/Icone';
import { listarUnidades } from '../../servicos/cardapio';
import { useAssincrono } from '../../servicos/useAssincrono';

export function EscolherUnidade() {
  const { dados: unidades, carregando, erro, recarregar } = useAssincrono(listarUnidades, []);
  const [busca, setBusca] = useState('');

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return (unidades ?? []).filter((u) => !termo || `${u.nome} ${u.cidade} ${u.uf}`.toLowerCase().includes(termo));
  }, [unidades, busca]);

  return (
    <>
      <section className="heroi">
        <div className="container">
          <p className="sobretitulo" style={{ color: 'var(--sol)' }}>Peça e retire sem fila</p>
          <h1>Sabor do Nordeste, do jeito de cada lugar</h1>
          <p>Escolha a unidade onde vai retirar. O cardápio, os preços e as promoções mudam de acordo com ela.</p>
        </div>
      </section>

      <div className="container pagina pilha">
        <div className="campo" style={{ maxWidth: '28rem' }}>
          <label htmlFor="busca-unidade">Buscar unidade ou cidade</label>
          <input id="busca-unidade" className="entrada" type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Ex.: Recife" />
        </div>

        {erro && (
          <div className="aviso aviso-erro" role="alert">
            <p>Não foi possível carregar as unidades. <button className="botao-texto botao" onClick={recarregar}>Tentar de novo</button></p>
          </div>
        )}

        <div className="grade grade-2" aria-busy={carregando}>
          {carregando && [1, 2, 3, 4].map((i) => <div key={i} className="esqueleto" style={{ height: 132 }} />)}
          {!carregando && filtradas.map((u) => (
            <Link key={u.id} to={`/app/unidade/${u.id}`} className="cartao cartao-unidade">
              <div className="linha-entre">
                <h3>{u.nome}</h3>
                <span className={`selo ${u.formato === 'completa' ? 'selo-mandacaru' : 'selo-sol'}`}>
                  {u.formato === 'completa' ? 'Cozinha completa' : 'Cardápio reduzido'}
                </span>
              </div>
              <span className="linha texto-suave texto-pequeno"><Icone nome="local" tamanho={16} /> {u.cidade} · {u.uf}</span>
              <span className="linha texto-suave texto-pequeno"><Icone nome="relogio" tamanho={16} /> {u.horarioAbertura} às {u.horarioFechamento}</span>
            </Link>
          ))}
          {!carregando && !erro && filtradas.length === 0 && <p className="texto-suave">Nenhuma unidade encontrada para “{busca}”.</p>}
        </div>
      </div>
    </>
  );
}
