import { Link } from 'react-router-dom';

export function EmConstrucao({ titulo }: { titulo: string }) {
  return (
    <main className="pagina">
      <h1>{titulo}</h1>
      <p>Tela em construção.</p>
      <Link to="/">Voltar ao mapa de telas</Link>
    </main>
  );
}
