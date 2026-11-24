import { Link } from 'react-router-dom';

export function PoliticaPrivacidade() {
  return (
    <article className="container pagina pilha" style={{ maxWidth: '44rem' }}>
      <p className="sobretitulo">Versão de demonstração</p>
      <h1>Política de Privacidade</h1>
      <p>Esta é uma versão resumida, escrita para o protótipo acadêmico, seguindo a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).</p>

      <h2>Quais dados coletamos</h2>
      <ul>
        <li><strong>Cadastro:</strong> nome, e-mail, senha e, se você quiser, telefone.</li>
        <li><strong>Pedidos:</strong> itens, unidade, valores, canal (app, site, totem ou balcão) e horário.</li>
        <li><strong>Fidelidade (opcional):</strong> histórico de pedidos para pontos e, se informada, data de nascimento.</li>
        <li><strong>Totem:</strong> o CPF é opcional, usado só para creditar pontos e não fica salvo no aparelho.</li>
      </ul>

      <h2>Para que usamos</h2>
      <ul>
        <li>Executar o pedido que você fez (base legal: execução de contrato).</li>
        <li>Programa de fidelidade e ofertas personalizadas (base legal: consentimento, que pode ser revogado).</li>
        <li>Prevenção a fraudes e auditoria de cancelamentos e descontos (base legal: legítimo interesse).</li>
      </ul>

      <h2>Com quem compartilhamos</h2>
      <p>Apenas com o serviço externo de pagamento, que recebe o valor e o identificador do pedido. Dados de cartão são digitados diretamente no ambiente dele e não chegam até nós.</p>

      <h2>Seus direitos</h2>
      <p>Você pode ver, baixar, corrigir e excluir seus dados e revogar consentimentos a qualquer momento na <Link to="/app/privacidade">Central de Privacidade</Link>.</p>

      <h2>Quem acessa</h2>
      <p>A equipe da loja vê apenas o primeiro nome e o código de retirada. Relatórios de gestão usam dados agregados, sem identificar clientes.</p>
    </article>
  );
}
