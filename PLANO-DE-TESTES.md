# Plano de testes

Automação: `e2e/fluxos.cjs` (Playwright, ponta a ponta, gera as capturas em `evidencias/`) e `src/**/*.test.ts` (Vitest, regras de negócio).
Última execução (24/11/2026): 23/23 execuções E2E (21 cenários; CT14 em 3 larguras) e 15/15 testes de unidade aprovados, sem erros de console. Lighthouse (celular): performance 95, acessibilidade 100, boas práticas 100.

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

| CT16 | Login inválido | Negativo · Segurança | Conta demo | Senha "errada123" | "E-mail ou senha incorretos." sem indicar qual campo | 22 |
| CT17 | PIN incorreto | Negativo · Segurança | — | PIN "0000" na operação | "PIN incorreto." | — |
| CT18 | CPF inválido no totem | Negativo · Validação | Totem com item | CPF 123.456.789-00 | "CPF inválido. Confira os números." | 23 |
| CT19 | Inatividade no totem | Negativo · Privacidade | Item no carrinho | 60 s sem toque + 15 s | Aviso "Ainda está aí?"; sessão e carrinho apagados | 24 |
| CT20 | Cancelamento auditado | Positivo · Auditoria | Gerente no balcão | Cobrar, cancelar com motivo "Pedido duplicado" | Registro na auditoria com perfil, código e motivo | 25–26 |
| CT21 | Serviço instável | Negativo · Integração | `?pagamento=instavel` | Pagar; "Tentar novamente" | Primeira: "Falha de comunicação."; segunda (mesma chave) aprovada | 27 |

Verificação manual: "Baixar meus dados" e "Excluir minha conta" na Central de Privacidade.
