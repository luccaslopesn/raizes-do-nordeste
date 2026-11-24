# Raízes do Nordeste · Front-end multicanal

Projeto Multidisciplinar UNINTER 2026 · Trilha Front-end · Opção B (codificação)
Lucas Lopes Nepomusceno · RU 4589258

Protótipo funcional da interface da rede de lanchonetes Raízes do Nordeste em três canais (App/Web, Totem e operação da loja), com cardápio dinâmico por unidade, fidelidade, campanhas, pagamento por serviço externo simulado e LGPD aplicada na interface.

**Deploy:** https://raizes-do-nordeste-red.vercel.app  
**Repositório:** https://github.com/luccaslopesn/raizes-do-nordeste
**Nenhum pagamento real é feito.** Todos os dados são simulados.

## Acesso rápido para avaliação

| Canal | Rota | Credencial |
|---|---|---|
| App/Web do cliente | `/app` | `demo@raizes.com.br` / `raizes123` (ou crie uma conta) |
| Totem | `/totem` (unidade: `?unidade=sp-paulista`) | CPF de teste `529.982.247-25` (opcional) |
| Operação: balcão, cozinha, gestão | `/operacao` | perfil Atendente, Cozinha ou Gerente · PIN `1234` |
| Painel de chamada (TV) | `/painel?unidade=rec-boa-vista` | — |

**Cenários de pagamento:** antes de pagar, acrescente à URL `?pagamento=recusar`, `?pagamento=expirar` ou `?pagamento=instavel`.
**Multicanal ao vivo:** faça um pedido no app e abra a cozinha em outra aba. Quando a cozinha muda o status, o app e o painel de chamada atualizam sozinhos.

## Rodar localmente
```bash
npm install
npm run dev          # http://localhost:5173
npm test             # testes de unidade (Vitest)
npm run build
```

Testes ponta a ponta com capturas de tela (precisa do Playwright):
```bash
npm run build && npx vite preview --port 4173     # terminal 1
npx playwright install chromium && npm run e2e    # terminal 2
```

## Decisões de arquitetura
- **React 19 + TypeScript + Vite**, mobile-first, CSS próprio com tokens de design.
- **Camada de serviços** (`src/servicos`): as telas não conhecem os mocks. Para ligar ao back-end real basta trocar a implementação dos serviços.
- **Estado** com Zustand. Pedidos e sessão ficam no `localStorage` e são sincronizados entre abas, simulando o back-end compartilhado entre canais. O carrinho do totem e do balcão fica só em memória.
- **Regra de preço única** (`precificacao.ts`) para todos os canais: melhor campanha elegível, recompensa de fidelidade e pontos.
- **Pagamento externo** (`gatewayPagamento.ts`, `usePagamento.ts`): o sistema solicita, aguarda, registra a resposta e atualiza o pedido. Chave de idempotência contra cobrança duplicada, tempo limite de 8 s, nova chave só após recusa ou expiração.
- **Divisão de código por canal:** o app do cliente não baixa o código do totem nem da operação.
- **Acessibilidade:** rótulos ligados a campos, erros anunciados, foco visível, link "pular para o conteúdo", alvos de toque ≥ 44 px (72 px no totem), `prefers-reduced-motion`.

## LGPD na interface
- Banner de cookies com "Só essenciais" no mesmo peso de "Aceitar".
- Cadastro com consentimentos granulares **desmarcados por padrão** e finalidade escrita ao lado de cada dado.
- Data de nascimento só é pedida e guardada com adesão à fidelidade; é apagada ao revogar.
- Central de Privacidade: ver dados e finalidade, revogar consentimentos, baixar dados (JSON), excluir conta.
- Totem: CPF opcional, oculto durante a digitação e não guardado; sessão apagada por inatividade.
- Operação: acesso por perfil, equipe vê só primeiro nome e código, gestão só com dados agregados, auditoria de cancelamentos e descontos.

## Estrutura
```
src/
  dominio/      tipos do negócio
  mocks/        unidades, produtos, estoque, campanhas, recompensas
  servicos/     cardápio por unidade, precificação, gateway de pagamento
  estado/       carrinho, sessão, pedidos + auditoria, operação, privacidade
  componentes/  peças reutilizáveis (campo, diálogo, pagamento, linha do tempo…)
  paginas/      cliente/, totem/, operacao/
e2e/            fluxos ponta a ponta (Playwright)
evidencias/     capturas geradas pelos testes
wireframes/     wireframes de baixa fidelidade (HTML + PNG)
```
