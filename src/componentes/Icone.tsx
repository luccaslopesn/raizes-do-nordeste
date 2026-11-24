const caminhos = {
  carrinho: 'M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6.2M10 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z',
  cardapio: 'M4 5h16M4 12h16M4 19h10',
  etiqueta: 'M3 12V4h8l10 10-8 8L3 12Zm5-4.5a1 1 0 1 0 0 .01',
  recibo: 'M6 3h12v18l-3-2-3 2-3-2-3 2V3Zm3 5h6M9 12h6M9 16h4',
  usuario: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-8 9a8 8 0 0 1 16 0',
  escudo: 'M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Zm-3 9 2 2 4-4',
  voltar: 'M15 18l-6-6 6-6',
  check: 'M5 12l5 5L20 7',
  fechar: 'M6 6l12 12M18 6 6 18',
  relogio: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-13v5l3 2',
  estrela: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z',
  local: 'M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  sair: 'M15 4h4v16h-4M10 8l-4 4 4 4M6 12h10',
  alerta: 'M12 3 2 20h20L12 3Zm0 6v5m0 3v.01',
  mais: 'M12 5v14M5 12h14',
  pix: 'M12 3l4 4-4 4-4-4 4-4Zm0 10 4 4-4 4-4-4 4-4ZM3 12l4-4 4 4-4 4-4-4Zm10 0 4-4 4 4-4 4-4-4Z',
  cartao: 'M3 6h18v12H3V6Zm0 4h18M7 15h4',
  toque: 'M9 11V5a2 2 0 1 1 4 0v6m0-2a2 2 0 1 1 4 0v2m0 0a2 2 0 1 1 4 0v3a7 7 0 0 1-7 7h-1a7 7 0 0 1-6-3.5L4 14a2 2 0 0 1 3.4-2L9 14',
  painel: 'M4 4h7v7H4V4Zm9 0h7v4h-7V4ZM4 13h7v7H4v-7Zm9-3h7v10h-7V10Z',
  fogo: 'M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-6 1-9Z',
} as const;

export type NomeIcone = keyof typeof caminhos;

export function Icone({ nome, tamanho = 22, rotulo }: { nome: NomeIcone; tamanho?: number; rotulo?: string }) {
  return (
    <svg
      width={tamanho} height={tamanho} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      role={rotulo ? 'img' : undefined} aria-label={rotulo} aria-hidden={rotulo ? undefined : true}
    >
      <path d={caminhos[nome]} />
    </svg>
  );
}
