/** Simula a latência de rede de uma API real (ms). Zerada nos testes. */
export const configuracaoRede = { latenciaMinima: 300, latenciaMaxima: 900 };

export function simularLatencia(): Promise<void> {
  const { latenciaMinima, latenciaMaxima } = configuracaoRede;
  const ms = latenciaMinima + Math.random() * (latenciaMaxima - latenciaMinima);
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function esperar(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
