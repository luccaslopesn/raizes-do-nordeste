import { useEffect, useRef, type ReactNode } from 'react';

interface Props {
  aberto: boolean;
  titulo: string;
  aoFechar: () => void;
  children: ReactNode;
}

/** Diálogo nativo: foco preso, Esc fecha, leitor de tela anuncia o título */
export function Dialogo({ aberto, titulo, aoFechar, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialogo = ref.current;
    if (!dialogo) return;
    if (aberto && !dialogo.open) dialogo.showModal?.();
    if (!aberto && dialogo.open) dialogo.close();
  }, [aberto]);

  return (
    <dialog ref={ref} className="dialogo" aria-labelledby="titulo-dialogo" onClose={aoFechar} onCancel={aoFechar}>
      <h2 id="titulo-dialogo">{titulo}</h2>
      {children}
    </dialog>
  );
}
