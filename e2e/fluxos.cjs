/**
 * Teste ponta a ponta dos fluxos principais + capturas de tela (evidências).
 * Uso: npm run build && npx vite preview --port 4173  (em outro terminal)
 *      node e2e/fluxos.cjs [urlBase]
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.argv[2] || 'http://localhost:4173';
const SAIDA = path.join(__dirname, '..', 'evidencias');
fs.mkdirSync(SAIDA, { recursive: true });

const resultados = [];
const errosConsole = [];

async function caso(id, nome, fn) {
  try {
    await fn();
    resultados.push({ id, nome, ok: true });
    console.log(`✔ ${id} ${nome}`);
  } catch (e) {
    resultados.push({ id, nome, ok: false, erro: e.message.split('\n')[0] });
    console.log(`✘ ${id} ${nome}: ${e.message.split('\n')[0]}`);
  }
}

async function foto(pagina, nome) {
  await pagina.screenshot({ path: path.join(SAIDA, `${nome}.png`), fullPage: true });
}

(async () => {
  const navegador = await chromium.launch();
  const contexto = await navegador.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const app = await contexto.newPage();
  app.on('console', (m) => m.type() === 'error' && errosConsole.push(m.text()));
  app.on('pageerror', (e) => errosConsole.push(e.message));

  await caso('CT01', 'Banner de cookies aparece e aceita "só essenciais"', async () => {
    await app.goto(`${BASE}/app`);
    await app.getByRole('region', { name: 'Sua privacidade' }).waitFor();
    await foto(app, '01-app-unidades-banner-cookies');
    await app.getByRole('button', { name: 'Só essenciais' }).click();
    await app.getByRole('region', { name: 'Sua privacidade' }).waitFor({ state: 'detached' });
  });

  await caso('CT02', 'Unidade reduzida não exibe pratos de cozinha completa', async () => {
    await app.goto(`${BASE}/app/unidade/sp-paulista`);
    await app.getByRole('heading', { name: 'Tapioca de coco com leite condensado' }).waitFor();
    if (await app.getByRole('heading', { name: 'Cuscuz com charque' }).count()) throw new Error('cuscuz visível em unidade reduzida');
    await foto(app, '02-cardapio-unidade-reduzida');
  });

  await caso('CT03', 'Produto esgotado aparece desabilitado', async () => {
    await app.goto(`${BASE}/app/unidade/rec-boa-vista`);
    const botao = app.getByRole('button', { name: 'Cuscuz com charque indisponível' });
    await botao.waitFor();
    if (!(await botao.isDisabled())) throw new Error('botão habilitado');
    await foto(app, '03-cardapio-unidade-completa');
  });

  let codigo;
  await caso('CT04', 'Pedido no app com conta demo, recompensa e Pix aprovado', async () => {
    await app.getByRole('button', { name: 'Adicionar Tapioca de carne de sol ao carrinho' }).click();
    await app.getByRole('button', { name: /Adicionar Tapioca de carne de sol/ }).click();
    await app.getByRole('button', { name: 'Adicionar Suco de cajá ao carrinho' }).click();
    await app.getByRole('link', { name: /Ver carrinho/ }).click();
    await app.getByRole('link', { name: 'Entrar', exact: true }).last().click();
    await app.getByRole('button', { name: 'Entrar com conta de demonstração' }).click();
    await app.waitForURL('**/app/carrinho');
    await app.getByText('Café coado grátis').click();
    await foto(app, '04-carrinho-com-recompensa');
    await app.getByRole('button', { name: 'Ir para pagamento' }).click();
    await foto(app, '05-pagamento-escolha');
    await app.getByRole('button', { name: 'Pagar e enviar pedido' }).click();
    await app.getByText('Aguardando confirmação do Pix').waitFor();
    await foto(app, '06-pagamento-aguardando-servico-externo');
    await app.waitForURL('**/app/pedido/**', { timeout: 15000 });
    await app.getByRole('heading', { name: 'Pedido recebido' }).waitFor();
    codigo = (await app.locator('.codigo-retirada').textContent()).trim();
    await foto(app, '07-acompanhar-pedido-recebido');
  });

  await caso('CT05', 'Cozinha avança o pedido e o app atualiza sozinho (outra aba)', async () => {
    const op = await contexto.newPage();
    await op.setViewportSize({ width: 1280, height: 800 });
    await op.goto(`${BASE}/operacao`);
    await op.getByRole('radio', { name: /^Cozinha/ }).check();
    await op.getByLabel('PIN').fill('1234');
    await op.getByRole('button', { name: 'Entrar' }).click();
    await op.waitForURL('**/cozinha');
    await op.getByRole('article', { name: `Pedido ${codigo}` }).getByRole('button', { name: 'Iniciar preparo' }).click();
    await foto(op, '08-cozinha-kds');
    await app.getByRole('heading', { name: 'Em preparo' }).waitFor({ timeout: 5000 });
    await op.getByRole('article', { name: `Pedido ${codigo}` }).getByRole('button', { name: 'Marcar como pronto' }).click();
    await app.getByRole('heading', { name: 'Pronto para retirada' }).waitFor({ timeout: 5000 });
    await foto(app, '09-acompanhar-pedido-pronto');
    await op.close();
  });

  await caso('CT06', 'Pagamento recusado mostra motivo e permite outra forma', async () => {
    await app.goto(`${BASE}/app/unidade/rec-boa-vista`);
    await app.getByRole('button', { name: 'Adicionar Bolo de macaxeira ao carrinho' }).click();
    await app.goto(`${BASE}/app/pagamento?pagamento=recusar`);
    await app.getByLabel('Cartão de crédito').check();
    await app.getByRole('button', { name: 'Pagar e enviar pedido' }).click();
    await app.getByText('Pagamento recusado.').waitFor({ timeout: 10000 });
    await foto(app, '10-pagamento-recusado');
  });

  await caso('CT07', 'Clique duplo no botão de pagar não gera duas cobranças', async () => {
    await app.goto(`${BASE}/app/pagamento`);
    const botao = app.getByRole('button', { name: /Pagar e enviar pedido|Tentar novamente/ });
    await botao.dblclick();
    await app.waitForURL('**/app/pedido/**', { timeout: 15000 });
    const total = await app.evaluate(() => JSON.parse(localStorage.getItem('raizes-pedidos')).state.pedidos.filter((p) => p.itens.some((i) => i.produtoId === 'bolo-macaxeira') && p.clienteId === 'cli-demo' && p.pagamento.status === 'aprovado').length);
    if (total !== 1) throw new Error(`${total} pedidos aprovados`);
  });

  await caso('CT08', 'Serviço de pagamento expira e informa que nada foi cobrado', async () => {
    await app.goto(`${BASE}/app/unidade/rec-boa-vista`);
    await app.getByRole('button', { name: 'Adicionar Café coado na hora ao carrinho' }).click();
    await app.goto(`${BASE}/app/pagamento?pagamento=expirar`);
    await app.getByRole('button', { name: 'Pagar e enviar pedido' }).click();
    await app.getByText('Tempo esgotado.').waitFor({ timeout: 15000 });
    await foto(app, '11-pagamento-expirado');
  });

  await caso('CT09', 'Cadastro vazio mostra erros e exige aceite dos termos', async () => {
    await app.getByRole('link', { name: 'Conta' }).last().click();
    await app.getByRole('button', { name: 'Sair da conta' }).click();
    await app.goto(`${BASE}/app/cadastro`);
    const opcionais = app.locator('.opcao-consentimento input');
    for (let i = 0; i < 3; i++) if (await opcionais.nth(i).isChecked()) throw new Error('consentimento marcado por padrão');
    await app.getByLabel('E-mail').fill('email-invalido');
    await app.getByRole('button', { name: 'Criar conta' }).click();
    await app.getByText('Informe um e-mail válido').waitFor();
    await app.getByText('Para criar a conta, aceite').waitFor();
    await foto(app, '12-cadastro-erros-validacao');
  });

  await caso('CT10', 'Cadastro com fidelidade pede data de nascimento com finalidade', async () => {
    await app.getByLabel('Nome').fill('Maria Teste');
    await app.getByLabel('E-mail').fill('maria@teste.com');
    await app.locator('input[autocomplete="new-password"]').first().fill('senha1234');
    await app.getByLabel('Confirmar senha').fill('senha1234');
    await app.locator('#consent-termos').check();
    await app.getByText('Quero participar do programa de fidelidade').click();
    await app.getByText('Finalidade: liberar o benefício').waitFor();
    await foto(app, '13-cadastro-consentimentos');
    await app.getByRole('button', { name: 'Criar conta' }).click();
    await app.waitForURL(`${BASE}/app`);
  });

  await caso('CT11', 'Revogar fidelidade apaga a data de nascimento', async () => {
    await app.goto(`${BASE}/app/privacidade`);
    await app.getByLabel(/Programa de fidelidade/).uncheck();
    await app.getByRole('cell', { name: 'Não guardado' }).waitFor();
    await foto(app, '14-central-privacidade');
  });

  // Totem em formato retrato (1080 x 1920 dividido por 2)
  const totem = await contexto.newPage();
  await totem.setViewportSize({ width: 540, height: 960 });
  totem.on('pageerror', (e) => errosConsole.push(e.message));

  await caso('CT12', 'Totem: pedido com CPF mascarado e senha de retirada', async () => {
    await totem.goto(`${BASE}/totem`);
    await foto(totem, '15-totem-descanso');
    await totem.getByRole('button', { name: /Toque para fazer seu pedido/ }).click();
    await totem.getByRole('button', { name: /Tapioca de carne de sol/ }).click();
    await totem.getByRole('button', { name: 'Bebidas' }).click();
    await totem.getByRole('button', { name: /Suco de graviola/ }).click();
    await foto(totem, '16-totem-cardapio');
    await totem.getByRole('button', { name: 'Revisar pedido' }).click();
    await totem.getByRole('button', { name: 'Continuar' }).click();
    for (const d of '52998224725') await totem.getByRole('button', { name: d, exact: true }).click();
    const tela = await totem.locator('.totem-cpf').textContent();
    if (tela.includes('529')) throw new Error('CPF exibido sem máscara');
    await foto(totem, '17-totem-cpf-mascarado');
    await totem.getByRole('button', { name: 'Confirmar CPF' }).click();
    await totem.getByText('Pontos serão creditados').waitFor();
    await totem.getByLabel('Cartão de débito').check();
    await totem.getByRole('button', { name: 'Pagar' }).click();
    await totem.getByRole('heading', { name: 'Pedido confirmado!' }).waitFor({ timeout: 10000 });
    await foto(totem, '18-totem-confirmacao');
  });

  await caso('CT13', 'Gerente vê indicadores e auditoria; cozinha não acessa gestão', async () => {
    const op = await contexto.newPage();
    await op.setViewportSize({ width: 1280, height: 800 });
    await op.goto(`${BASE}/operacao`);
    await op.getByRole('radio', { name: /^Cozinha/ }).check();
    await op.getByLabel('PIN').fill('1234');
    await op.getByRole('button', { name: 'Entrar' }).click();
    await op.goto(`${BASE}/gestao`);
    await op.getByRole('heading', { name: 'Acesso negado' }).waitFor();
    await op.goto(`${BASE}/operacao`);
    await op.getByRole('radio', { name: /^Gerente/ }).check();
    await op.getByLabel('PIN').fill('1234');
    await op.getByRole('button', { name: 'Entrar' }).click();
    await op.getByRole('link', { name: 'Gestão' }).click();
    await op.getByText('Faturamento').waitFor();
    await foto(op, '19-gestao-gerente');
    await op.getByRole('link', { name: 'Balcão' }).click();
    await foto(op, '20-balcao');
    await op.close();
  });

  // Responsividade: mesma tela em 3 larguras
  for (const largura of [360, 768, 1280]) {
    await caso(`CT14-${largura}`, `Sem rolagem horizontal em ${largura}px`, async () => {
      const p = await contexto.newPage();
      await p.setViewportSize({ width: largura, height: 900 });
      await p.goto(`${BASE}/app/unidade/rec-boa-vista`);
      await p.getByRole('heading', { name: 'Tapioca de coco com leite condensado' }).waitFor();
      const excesso = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      await foto(p, `21-responsivo-${largura}px`);
      await p.close();
      if (excesso > 1) throw new Error(`rolagem horizontal de ${excesso}px`);
    });
  }

  await caso('CT15', 'Navegação por teclado alcança o link de pular conteúdo', async () => {
    const p = await contexto.newPage();
    await p.goto(`${BASE}/app`);
    await p.keyboard.press('Tab');
    const focado = await p.evaluate(() => document.activeElement?.textContent);
    await p.close();
    if (!focado?.includes('Pular para o conteúdo')) throw new Error(`foco em "${focado}"`);
  });


  await caso('CT16', 'Login com senha errada mostra mensagem genérica', async () => {
    const p = await contexto.newPage();
    await p.goto(`${BASE}/app/entrar`);
    await p.getByLabel('E-mail').fill('demo@raizes.com.br');
    await p.getByLabel('Senha').fill('errada123');
    await p.getByRole('button', { name: 'Entrar', exact: true }).click();
    await p.getByText('E-mail ou senha incorretos.').waitFor();
    await foto(p, '22-login-invalido');
    await p.close();
  });

  await caso('CT17', 'PIN incorreto bloqueia a operação', async () => {
    const p = await contexto.newPage();
    await p.goto(`${BASE}/operacao`);
    await p.getByLabel('PIN').fill('0000');
    await p.getByRole('button', { name: 'Entrar' }).click();
    await p.getByText('PIN incorreto.').waitFor();
    await p.close();
  });

  await caso('CT18', 'Totem: CPF inválido é rejeitado', async () => {
    const p = await contexto.newPage();
    await p.setViewportSize({ width: 540, height: 960 });
    await p.goto(`${BASE}/totem`);
    await p.getByRole('button', { name: /Toque para fazer seu pedido/ }).click();
    await p.getByRole('button', { name: /Bolo de macaxeira/ }).first().click().catch(async () => {
      await p.getByRole('button', { name: 'Bolos e doces' }).click();
      await p.getByRole('button', { name: /Bolo de macaxeira/ }).click();
    });
    await p.getByRole('button', { name: 'Revisar pedido' }).click();
    await p.getByRole('button', { name: 'Continuar' }).click();
    for (const d of '12345678900') await p.getByRole('button', { name: d, exact: true }).click();
    await p.getByRole('button', { name: 'Confirmar CPF' }).click();
    await p.getByText('CPF inválido. Confira os números.').waitFor();
    await foto(p, '23-totem-cpf-invalido');
    await p.close();
  });

  await caso('CT19', 'Totem: inatividade avisa e apaga a sessão', async () => {
    const p = await contexto.newPage();
    await p.setViewportSize({ width: 540, height: 960 });
    await p.clock.install();
    await p.goto(`${BASE}/totem`);
    await p.getByRole('button', { name: /Toque para fazer seu pedido/ }).click();
    await p.getByRole('button', { name: 'Bebidas' }).click();
    await p.getByRole('button', { name: /Suco de cajá/ }).click();
    await p.clock.runFor(61_000);
    await p.getByRole('alertdialog', { name: 'Ainda está aí?' }).waitFor();
    await foto(p, '24-totem-inatividade');
    await p.clock.runFor(16_000);
    await p.getByRole('button', { name: /Toque para fazer seu pedido/ }).waitFor();
    await p.getByRole('button', { name: /Toque para fazer seu pedido/ }).click();
    await p.getByRole('button', { name: 'Revisar pedido' }).waitFor();
    if (!(await p.getByRole('button', { name: 'Revisar pedido' }).isDisabled())) throw new Error('carrinho não foi limpo');
    await p.close();
  });

  await caso('CT20', 'Cancelamento no balcão exige motivo e entra na auditoria', async () => {
    const p = await contexto.newPage();
    await p.setViewportSize({ width: 1280, height: 900 });
    await p.goto(`${BASE}/operacao`);
    await p.getByRole('radio', { name: /^Gerente/ }).check();
    await p.getByLabel('PIN').fill('1234');
    await p.getByRole('button', { name: 'Entrar' }).click();
    await p.waitForURL('**/balcao');
    await p.getByRole('button', { name: /Tapioca de coco/ }).click();
    await p.getByRole('button', { name: 'Cobrar na maquininha' }).click();
    await p.getByText(/enviado para a cozinha/).waitFor({ timeout: 10000 });
    const codigo = (await p.getByText(/enviado para a cozinha/).textContent()).match(/Pedido (\w+)/)[1];
    await p.getByRole('row', { name: new RegExp(codigo) }).getByRole('button', { name: 'Cancelar' }).click();
    await p.getByLabel('Motivo').selectOption('Pedido duplicado');
    await foto(p, '25-balcao-cancelamento');
    await p.getByRole('button', { name: 'Confirmar cancelamento' }).click();
    await p.getByRole('link', { name: 'Gestão' }).click();
    await p.getByRole('row', { name: new RegExp(`${codigo}.*Pedido duplicado`) }).waitFor();
    await foto(p, '26-auditoria-cancelamento');
    await p.close();
  });

  await caso('CT21', 'Serviço instável: nova tentativa com a mesma chave é aprovada', async () => {
    const p = await contexto.newPage();
    await p.goto(`${BASE}/app/entrar`);
    await p.getByRole('button', { name: 'Entrar com conta de demonstração' }).click();
    await p.waitForURL(`${BASE}/app`);
    await p.goto(`${BASE}/app/unidade/for-aldeota`);
    await p.getByRole('button', { name: 'Adicionar Suco de cajá ao carrinho' }).click();
    await p.goto(`${BASE}/app/pagamento?pagamento=instavel`);
    await p.getByRole('button', { name: 'Pagar e enviar pedido' }).click();
    await p.getByText('Falha de comunicação.').waitFor({ timeout: 10000 });
    await foto(p, '27-pagamento-falha-comunicacao');
    await p.getByRole('button', { name: 'Tentar novamente' }).click();
    await p.waitForURL('**/app/pedido/**', { timeout: 15000 });
    await p.close();
  });

  await navegador.close();
  fs.writeFileSync(path.join(SAIDA, 'resultado.json'), JSON.stringify({ resultados, errosConsole }, null, 2));
  const falhas = resultados.filter((r) => !r.ok).length;
  console.log(`\n${resultados.length - falhas}/${resultados.length} casos passaram. Erros de console: ${errosConsole.length}`);
  errosConsole.slice(0, 10).forEach((e) => console.log('  console:', e));
  process.exit(falhas ? 1 : 0);
})();
