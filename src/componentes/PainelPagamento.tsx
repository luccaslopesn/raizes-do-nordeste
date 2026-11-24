import { useState } from 'react';
import type { FormaPagamento } from '../dominio/tipos';
import type { FasePagamento } from '../servicos/usePagamento';
import { Icone } from './Icone';

export const FORMAS: { id: FormaPagamento; rotulo: string; icone: 'pix' | 'cartao' }[] = [
  { id: 'pix', rotulo: 'Pix', icone: 'pix' },
  { id: 'cartao-credito', rotulo: 'Cartão de crédito', icone: 'cartao' },
  { id: 'cartao-debito', rotulo: 'Cartão de débito', icone: 'cartao' },
];

interface Props {
  fase: FasePagamento;
  mensagem?: string;
  aoPagar: (forma: FormaPagamento) => void;
  rotuloBotao: string;
  totem?: boolean;
}

/**
 * Interface do pagamento comum aos canais. Deixa claro que quem processa
 * é um serviço externo e mostra cada resposta possível.
 */
export function PainelPagamento({ fase, mensagem, aoPagar, rotuloBotao, totem = false }: Props) {
  const [forma, setForma] = useState<FormaPagamento>('pix');

  if (fase === 'processando') {
    return (
      <div className="estado-pagamento" role="status" aria-live="polite">
        {forma === 'pix' && !totem ? <div className="qr-simulado" aria-label="QR Code Pix simulado" role="img" /> : <div className="girando" aria-hidden="true" />}
        <h2>{forma === 'pix' ? 'Aguardando confirmação do Pix' : totem ? 'Siga as instruções na maquininha' : 'Processando pagamento'}</h2>
        <p className="texto-suave">Estamos aguardando a resposta do serviço de pagamento. Não feche esta tela.</p>
        <span className="selo-externo"><Icone nome="escudo" tamanho={16} /> Processado por serviço externo de pagamento</span>
      </div>
    );
  }

  return (
    <div className="pilha">
      {fase === 'recusado' && (
        <div className="aviso aviso-erro" role="alert">
          <div><p><strong>Pagamento recusado.</strong> {mensagem}</p><p className="texto-pequeno">Tente outra forma de pagamento. Seu pedido continua reservado.</p></div>
        </div>
      )}
      {fase === 'expirado' && (
        <div className="aviso aviso-atencao" role="alert">
          <div><p><strong>Tempo esgotado.</strong> {mensagem}</p></div>
        </div>
      )}
      {fase === 'falha-comunicacao' && (
        <div className="aviso aviso-erro" role="alert">
          <div><p><strong>Falha de comunicação.</strong> {mensagem}</p></div>
        </div>
      )}

      <fieldset style={{ border: 'none', padding: 0, margin: 0 }} className="pilha">
        <legend className="rotulo" style={{ marginBottom: 'var(--e2)' }}>Forma de pagamento</legend>
        {FORMAS.map((f) => (
          <label key={f.id} className="escolha" style={totem ? { minHeight: 80, fontSize: '1.25rem' } : undefined}>
            <input type="radio" name="forma" value={f.id} checked={forma === f.id} onChange={() => setForma(f.id)} />
            <Icone nome={f.icone} />
            {f.rotulo}
          </label>
        ))}
      </fieldset>

      <button className={`botao botao-bloco ${totem ? 'botao-totem' : ''}`} onClick={() => aoPagar(forma)}>
        {fase === 'ocioso' ? rotuloBotao : 'Tentar novamente'}
      </button>
      <p className="texto-pequeno texto-suave" style={{ textAlign: 'center' }}>
        Os dados do cartão são digitados apenas no ambiente do serviço de pagamento. A Raízes do Nordeste não armazena esses dados.
      </p>
    </div>
  );
}
