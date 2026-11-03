# Raízes do Nordeste · Front-end multicanal

Projeto Multidisciplinar UNINTER 2026, trilha Front-end, Opção B (codificação).

Interface para uma rede de lanchonetes nordestinas com três canais (App/Web, Totem, operação da loja), cardápio dinâmico por unidade, fidelidade, pagamento via serviço externo simulado e LGPD na interface.

## Rodar localmente
```bash
npm install
npm run dev      # http://localhost:5173
npm test         # testes das regras de negócio
npm run build
```

## Decisões
- **React + TypeScript + Vite**, mobile-first.
- **Dados mockados** em `src/mocks`, com latência simulada em `src/servicos`. As telas só conhecem os serviços, então a troca pelo back-end real não afeta a interface.
- **Pagamento externo simulado** (`src/servicos/gatewayPagamento.ts`): o sistema só solicita, recebe a resposta, registra e atualiza o pedido. Chave de idempotência evita cobrança duplicada; tempo limite trata provedor sem resposta.

## Simular cenários de pagamento
Acrescente à URL: `?pagamento=recusar`, `?pagamento=expirar` ou `?pagamento=instavel`.

## Estrutura
```
src/
  dominio/     tipos do negócio
  mocks/       unidades, produtos, estoque, campanhas, recompensas
  servicos/    cardápio por unidade, gateway de pagamento simulado
  estado/      carrinho, preferências de privacidade
  paginas/     telas por canal
```
