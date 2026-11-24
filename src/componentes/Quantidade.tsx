interface Props {
  valor: number;
  aoMudar: (valor: number) => void;
  minimo?: number;
  maximo?: number;
  nome: string;
}

export function Quantidade({ valor, aoMudar, minimo = 0, maximo = 20, nome }: Props) {
  return (
    <div className="quantidade" role="group" aria-label={`Quantidade de ${nome}`}>
      <button type="button" onClick={() => aoMudar(Math.max(minimo, valor - 1))} aria-label={valor - 1 < 1 && minimo === 0 ? `Remover ${nome}` : `Diminuir ${nome}`}>−</button>
      <output aria-live="polite">{valor}</output>
      <button type="button" onClick={() => aoMudar(Math.min(maximo, valor + 1))} disabled={valor >= maximo} aria-label={`Aumentar ${nome}`}>+</button>
    </div>
  );
}
