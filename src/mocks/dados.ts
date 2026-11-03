import type { Campanha, Produto, Recompensa, Unidade } from '../dominio/tipos';

export const unidades: Unidade[] = [
  { id: 'rec-boa-vista', nome: 'Recife · Boa Vista', cidade: 'Recife', uf: 'PE', regiao: 'nordeste', formato: 'completa', horarioAbertura: '06:00', horarioFechamento: '22:00' },
  { id: 'for-aldeota', nome: 'Fortaleza · Aldeota', cidade: 'Fortaleza', uf: 'CE', regiao: 'nordeste', formato: 'completa', horarioAbertura: '06:00', horarioFechamento: '21:00' },
  { id: 'sp-paulista', nome: 'São Paulo · Av. Paulista', cidade: 'São Paulo', uf: 'SP', regiao: 'sudeste', formato: 'reduzida', horarioAbertura: '06:30', horarioFechamento: '20:00' },
  { id: 'car-shopping', nome: 'Caruaru · Shopping', cidade: 'Caruaru', uf: 'PE', regiao: 'nordeste', formato: 'reduzida', horarioAbertura: '10:00', horarioFechamento: '22:00' },
];

export const produtos: Produto[] = [
  { id: 'tap-carne-sol', nome: 'Tapioca de carne de sol', descricao: 'Carne de sol desfiada com queijo coalho e manteiga de garrafa', categoria: 'tapiocas', precoBase: 22.9, exigeCozinhaCompleta: false },
  { id: 'tap-coco', nome: 'Tapioca de coco com leite condensado', descricao: 'Coco fresco ralado e leite condensado', categoria: 'tapiocas', precoBase: 16.5, exigeCozinhaCompleta: false },
  { id: 'cus-ovo', nome: 'Cuscuz recheado com ovo e queijo', descricao: 'Cuscuz de milho com ovo mexido e queijo coalho', categoria: 'cuscuz', precoBase: 18.9, exigeCozinhaCompleta: true,
    variacoesRegionais: { sudeste: { preco: 20.9, observacao: 'Servido com manteiga comum na região Sudeste' } } },
  { id: 'cus-charque', nome: 'Cuscuz com charque', descricao: 'Charque acebolado e cuscuz no vapor', categoria: 'cuscuz', precoBase: 24.9, exigeCozinhaCompleta: true },
  { id: 'bolo-macaxeira', nome: 'Bolo de macaxeira', descricao: 'Fatia do bolo da casa', categoria: 'bolos', precoBase: 9.9, exigeCozinhaCompleta: false },
  { id: 'pamonha', nome: 'Pamonha doce', descricao: 'Edição junina', categoria: 'bolos', precoBase: 11.9, exigeCozinhaCompleta: false,
    sazonal: { inicio: '06-01', fim: '07-31', rotulo: 'São João' } },
  { id: 'canjica', nome: 'Canjica', descricao: 'Edição junina, com canela', categoria: 'bolos', precoBase: 10.9, exigeCozinhaCompleta: false,
    sazonal: { inicio: '06-01', fim: '07-31', rotulo: 'São João' } },
  { id: 'suco-caja', nome: 'Suco de cajá', descricao: '400 ml', categoria: 'bebidas', precoBase: 9.5, exigeCozinhaCompleta: false },
  { id: 'suco-graviola', nome: 'Suco de graviola', descricao: '400 ml', categoria: 'bebidas', precoBase: 9.5, exigeCozinhaCompleta: false },
  { id: 'cafe-coado', nome: 'Café coado na hora', descricao: '200 ml', categoria: 'bebidas', precoBase: 5.5, exigeCozinhaCompleta: false },
  { id: 'cafe-completo', nome: 'Café da manhã sertanejo', descricao: 'Cuscuz, ovo, queijo coalho, macaxeira e café', categoria: 'cafe-da-manha', precoBase: 34.9, exigeCozinhaCompleta: true },
];

/** Estoque local por unidade: produtoId -> quantidade */
export const estoquePorUnidade: Record<string, Record<string, number>> = {
  'rec-boa-vista': { 'tap-carne-sol': 40, 'tap-coco': 30, 'cus-ovo': 25, 'cus-charque': 0, 'bolo-macaxeira': 12, pamonha: 20, canjica: 20, 'suco-caja': 50, 'suco-graviola': 40, 'cafe-coado': 100, 'cafe-completo': 15 },
  'for-aldeota': { 'tap-carne-sol': 35, 'tap-coco': 30, 'cus-ovo': 20, 'cus-charque': 10, 'bolo-macaxeira': 0, pamonha: 15, canjica: 15, 'suco-caja': 40, 'suco-graviola': 0, 'cafe-coado': 80, 'cafe-completo': 10 },
  'sp-paulista': { 'tap-carne-sol': 20, 'tap-coco': 20, 'cus-ovo': 15, 'cus-charque': 5, 'bolo-macaxeira': 10, pamonha: 5, canjica: 5, 'suco-caja': 30, 'suco-graviola': 30, 'cafe-coado': 60, 'cafe-completo': 5 },
  'car-shopping': { 'tap-carne-sol': 25, 'tap-coco': 25, 'cus-ovo': 0, 'cus-charque': 0, 'bolo-macaxeira': 8, pamonha: 10, canjica: 10, 'suco-caja': 30, 'suco-graviola': 30, 'cafe-coado': 50, 'cafe-completo': 0 },
};

export const campanhas: Campanha[] = [
  { id: 'camp-cafe', titulo: 'Café em dobro', descricao: 'Pontos em dobro em pedidos até 9h', tipo: 'pontos-em-dobro', valor: 2, segmentada: false, validaAte: '2026-12-31' },
  { id: 'camp-aniversario', titulo: 'Mês do seu aniversário', descricao: '15% de desconto no mês do aniversário', tipo: 'percentual', valor: 15, segmentada: true, validaAte: '2026-12-31' },
  { id: 'camp-paulista', titulo: 'Inauguração Paulista', descricao: 'R$ 5 de desconto acima de R$ 30', tipo: 'valor-fixo', valor: 5, segmentada: false, unidadesIds: ['sp-paulista'], validaAte: '2026-12-15' },
];

export const recompensas: Recompensa[] = [
  { id: 'rec-cafe', titulo: 'Café coado grátis', custoPontos: 50, descontoEmReais: 5.5 },
  { id: 'rec-10', titulo: 'R$ 10 de desconto', custoPontos: 100, descontoEmReais: 10 },
  { id: 'rec-tapioca', titulo: 'Tapioca de coco grátis', custoPontos: 150, descontoEmReais: 16.5 },
];

/** 1 ponto a cada R$ 1 gasto (regra simplificada para o protótipo) */
export const PONTOS_POR_REAL = 1;
