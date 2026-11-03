import { Link } from 'react-router-dom';
import { mapaDeTelas } from '../rotas';

const nomesDosGrupos: Record<keyof typeof mapaDeTelas, string> = {
  cliente: 'App e Web (cliente)',
  totem: 'Totem de autoatendimento',
  operacao: 'Operação da loja',
};

/** Porta de entrada do avaliador: acesso direto a cada canal */
export function Inicio() {
  return (
    <main className="pagina">
      <h1>Raízes do Nordeste</h1>
      <p>Protótipo funcional multicanal. Dados simulados, sem pagamento real.</p>
      {(Object.keys(mapaDeTelas) as (keyof typeof mapaDeTelas)[]).map((grupo) => (
        <section key={grupo}>
          <h2>{nomesDosGrupos[grupo]}</h2>
          <ul>
            {mapaDeTelas[grupo]
              .filter(([path]) => !path.includes(':'))
              .map(([path, titulo]) => (
                <li key={path}><Link to={path}>{titulo}</Link></li>
              ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
