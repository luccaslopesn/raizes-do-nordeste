import { describe, expect, it, vi } from 'vitest';
import { solicitarPagamento, TEMPO_LIMITE_PAGAMENTO_MS } from './gatewayPagamento';

describe('gateway de pagamento simulado', () => {
  it('aprova e devolve id de transação', async () => {
    vi.useFakeTimers();
    const p = solicitarPagamento({ chaveIdempotencia: 'abc-1', valor: 20, forma: 'cartao-credito' }, 'aprovar');
    await vi.runAllTimersAsync();
    expect(await p).toMatchObject({ status: 'aprovado' });
    vi.useRealTimers();
  });

  it('não cobra duas vezes a mesma chave (clique duplo)', async () => {
    vi.useFakeTimers();
    const req = { chaveIdempotencia: 'abc-2', valor: 20, forma: 'pix' as const };
    const a = solicitarPagamento(req, 'aprovar');
    const b = solicitarPagamento(req, 'aprovar');
    expect(a).toBe(b);
    await vi.runAllTimersAsync();
    vi.useRealTimers();
  });

  it('retorna recusado com motivo', async () => {
    vi.useFakeTimers();
    const p = solicitarPagamento({ chaveIdempotencia: 'abc-3', valor: 20, forma: 'cartao-debito' }, 'recusar');
    await vi.runAllTimersAsync();
    expect(await p).toMatchObject({ status: 'recusado' });
    vi.useRealTimers();
  });

  it('expira quando o provedor não responde a tempo', async () => {
    vi.useFakeTimers();
    const p = solicitarPagamento({ chaveIdempotencia: 'abc-4', valor: 20, forma: 'pix' }, 'expirar');
    await vi.advanceTimersByTimeAsync(TEMPO_LIMITE_PAGAMENTO_MS + 1000);
    expect(await p).toMatchObject({ status: 'expirado' });
    vi.useRealTimers();
  });
});
