/**
 * Extrai apenas os dígitos numéricos de uma string.
 */
export const onlyDigits = (value: string): string => value.replace(/\D/g, '');

/**
 * Valida se um CPF é matematicamente válido segundo o algoritmo do Módulo 11 (Receita Federal).
 * - Remove caracteres não numéricos.
 * - Rejeita CPFs com tamanho diferente de 11 dígitos.
 * - Rejeita sequências com todos os dígitos repetidos (ex: 111.111.111-11).
 * - Calcula e verifica o primeiro e segundo dígitos verificadores.
 */
export const isValidCpf = (value: string): boolean => {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const calcDigit = (base: string, factor: number): number => {
    let total = 0;
    for (let i = 0; i < base.length; i++) {
      total += Number(base[i]) * (factor - i);
    }
    const mod = total % 11;
    return mod < 2 ? 0 : 11 - mod;
  };

  const d1 = calcDigit(cpf.slice(0, 9), 10);
  const d2 = calcDigit(cpf.slice(0, 10), 11);
  return cpf.endsWith(`${d1}${d2}`);
};

/**
 * Valida se o formato do e-mail é estritamente válido.
 */
export const isValidEmailStrict = (value: string): boolean => {
  const email = value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
  if (email.includes('@.') || email.includes('..')) return false;
  return true;
};
