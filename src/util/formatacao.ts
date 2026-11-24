const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const dataHora = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
const hora = new Intl.DateTimeFormat('pt-BR', { timeStyle: 'short' });

export const formatarMoeda = (valor: number) => moeda.format(valor);
export const formatarDataHora = (iso: string) => dataHora.format(new Date(iso));
export const formatarHora = (iso: string) => hora.format(new Date(iso));
export const arredondar = (valor: number) => Math.round(valor * 100) / 100;

export function gerarId(prefixo = ''): string {
  const aleatorio =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;
  return prefixo ? `${prefixo}-${aleatorio}` : aleatorio;
}

/** Código curto para chamada no balcão: sem 0/O e 1/I para evitar confusão */
export function gerarCodigoRetirada(): string {
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const letra = letras[Math.floor(Math.random() * letras.length)];
  const numero = String(Math.floor(Math.random() * 900) + 100);
  return `${letra}${numero}`;
}

/** Exibe só o fim do CPF: 123.456.789-09 -> ***.***.***-09 */
export function mascararCpf(cpf: string): string {
  const digitos = cpf.replace(/\D/g, '');
  if (digitos.length < 2) return '';
  return `***.***.***-${digitos.slice(-2)}`;
}

/** Máscara de digitação: 12345678909 -> 123.456.789-09 */
export function aplicarMascaraCpf(valor: string): string {
  const d = valor.replace(/\D/g, '').slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2');
}

export function cpfValido(cpf: string): boolean {
  const d = cpf.replace(/\D/g, '');
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const digito = (fatia: number) => {
    let soma = 0;
    for (let i = 0; i < fatia; i++) soma += Number(d[i]) * (fatia + 1 - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return digito(9) === Number(d[9]) && digito(10) === Number(d[10]);
}

export function emailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

/** Hash simulado (não criptográfico). No sistema real a senha só trafega para o back-end. */
export function hashSimulado(texto: string): string {
  let h = 5381;
  for (let i = 0; i < texto.length; i++) h = ((h << 5) + h + texto.charCodeAt(i)) | 0;
  return `sim$${(h >>> 0).toString(16)}`;
}
