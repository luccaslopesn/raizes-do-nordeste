# Plano de testes

Automação: `e2e/fluxos.cjs` (Playwright, ponta a ponta, gera as capturas em `evidencias/`) e `src/**/*.test.ts` (Vitest, regras de negócio).
Última execução: 17/17 cenários E2E e 15/15 testes de unidade aprovados, sem erros de console.

| ID | Cenário | Tipo | Pré-condição | Passos | Resultado esperado | Evidência |
|---|---|---|---|---|---|---|
| CT01 | Banner de cookies | Positivo · LGPD | Primeiro acesso | Abrir `/app`; tocar "Só essenciais" | Banner aparece antes de qualquer cookie opcional; some após a escolha; preferência salva | 01 |
| CT02 | Cardápio de unidade reduzida | Positivo | — | Abrir unidade São Paulo · Paulista | Pratos que exigem cozinha completa não aparecem | 02 |
| CT03 | Produto esgotado | Negativo | Estoque local = 0 | Abrir Recife; ver "Cuscuz com charque" | Item visível com selo "Esgotado" e botão desabilitado | 03 |
| CT04 | Pedido completo no app | Positivo | Conta demo com 180 pontos | Adicionar itens; entrar; escolher recompensa; pagar com Pix | Tela de espera do serviço externo; pedido "recebido" com código de retirada e pontos | 04–07 |
| CT05 | Atualização multicanal | Positivo | Pedido pago | Em outra aba, cozinha avança o status | App muda para "Em preparo" e "Pronto" sem recarregar | 08–09 |
| CT06 | Pagamento recusado | Negativo | `?pagamento=recusar` | Pagar com crédito | Mensagem "Pagamento recusado" com motivo; opção de tentar outra forma; pedido não avança | 10 |
| CT07 | Clique duplo no pagamento | Negativo | Pedido aguardando | Clique duplo em "Pagar" | Apenas 1 pedido aprovado (idempotência) | — |
| CT08 | Serviço de pagamento sem resposta | Negativo | `?pagamento=expirar` | Pagar | Após 8 s: "Tempo esgotado. Nenhum valor foi cobrado." | 11 |
| CT09 | Cadastro inválido | Negativo · LGPD | — | E-mail "email-invalido"; enviar sem aceitar termos | Erro no campo de e-mail e exigência do aceite; opcionais desmarcados por padrão | 12 |
| CT10 | Cadastro com fidelidade | Positivo · LGPD | — | Preencher dados; marcar fidelidade | Campo de nascimento aparece com a finalidade; conta criada | 13 |
| CT11 | Revogar consentimento | Positivo · LGPD | Conta com fidelidade | Central de Privacidade → desmarcar fidelidade | Data de nascimento passa a "Não guardado" | 14 |
| CT12 | Pedido no totem com CPF | Positivo · LGPD | Totem em descanso | Tocar; escolher itens; digitar CPF; pagar no débito | CPF não aparece em claro; pontos creditados; senha de retirada | 15–18 |
| CT13 | Controle de acesso | Negativo + Positivo | — | Perfil Cozinha abre `/gestao`; depois Gerente | Cozinha recebe "Acesso negado"; gerente vê indicadores e auditoria | 19–20 |
| CT14 | Responsividade | Positivo | — | Cardápio em 360, 768 e 1280 px | Sem rolagem horizontal em nenhuma largura | 21 |
| CT15 | Navegação por teclado | Positivo · Acessibilidade | — | Pressionar Tab ao abrir | Primeiro foco é "Pular para o conteúdo" | — |

Casos manuais complementares (não automatizados):
- Totem: ficar 60 s sem tocar → aviso "Ainda está aí?" com contagem de 15 s → sessão apagada.
- Totem: CPF válido sem conta → pedido segue sem pontos; CPF inválido → "CPF inválido".
- Balcão: cancelar pedido → registro na auditoria com perfil e motivo; pontos estornados.
- `?pagamento=instavel`: primeira tentativa falha por comunicação, a segunda (mesma chave) é aprovada.
