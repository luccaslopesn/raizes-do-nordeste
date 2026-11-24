import { useCallback, useEffect, useState } from 'react';

/** Estado de carregamento/erro padronizado para chamadas à API simulada */
export function useAssincrono<T>(buscar: () => Promise<T>, dependencias: unknown[]) {
  const [dados, setDados] = useState<T>();
  const [erro, setErro] = useState<string>();
  const [carregando, setCarregando] = useState(true);
  const [tentativa, setTentativa] = useState(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const buscarMemo = useCallback(buscar, dependencias);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro(undefined);
    buscarMemo()
      .then((r) => ativo && setDados(r))
      .catch((e: unknown) => ativo && setErro(e instanceof Error ? e.message : 'Erro inesperado'))
      .finally(() => ativo && setCarregando(false));
    return () => { ativo = false; };
  }, [buscarMemo, tentativa]);

  return { dados, erro, carregando, recarregar: () => setTentativa((t) => t + 1) };
}
