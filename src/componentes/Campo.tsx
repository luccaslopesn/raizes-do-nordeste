import { useId, type InputHTMLAttributes, type ReactNode } from 'react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  rotulo: string;
  dica?: ReactNode;
  erro?: string;
}

/** Campo acessível: rótulo, dica e erro ligados por aria-describedby */
export function Campo({ rotulo, dica, erro, id, ...resto }: Props) {
  const idGerado = useId();
  const idCampo = id ?? idGerado;
  const idDica = dica ? `${idCampo}-dica` : undefined;
  const idErro = erro ? `${idCampo}-erro` : undefined;
  return (
    <div className="campo">
      <label htmlFor={idCampo}>
        {rotulo}
        {resto.required && <span aria-hidden="true"> *</span>}
      </label>
      {dica && <span id={idDica} className="dica">{dica}</span>}
      <input
        id={idCampo}
        className="entrada"
        aria-invalid={erro ? true : undefined}
        aria-describedby={[idDica, idErro].filter(Boolean).join(' ') || undefined}
        {...resto}
      />
      {erro && <span id={idErro} className="erro-campo" role="alert">{erro}</span>}
    </div>
  );
}
