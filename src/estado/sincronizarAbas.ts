/**
 * Mantém lojas persistidas iguais entre abas: um pedido feito no app
 * aparece na cozinha aberta em outra aba, como aconteceria com o back-end.
 */
type LojaPersistida = { persist: { rehydrate: () => Promise<void> | void; getOptions: () => { name?: string } } };

export function sincronizarEntreAbas(...lojas: LojaPersistida[]) {
  if (typeof window === 'undefined') return;
  window.addEventListener('storage', (evento) => {
    for (const loja of lojas) {
      if (evento.key === loja.persist.getOptions().name) void loja.persist.rehydrate();
    }
  });
}
