export type CreditStatus = 'APROVADO' | 'REPROVADO' | 'EM_ANALISE';

/**
 * Avalia a decisão de crédito com base no score do cliente, valor de entrada e preço total.
 * 
 * Regras de Decisão (Ordem de Avaliação):
 * 1️⃣ Regra da Entrada Alta: SE (Entrada >= 50% do Total) E (Score < 700) → APROVADO
 * 2️⃣ Score Alto: SE Score > 700 → APROVADO
 * 3️⃣ Score Médio: SE Score entre 501 e 700 → EM_ANALISE
 * 4️⃣ Score Baixo: SE Score <= 500 → REPROVADO
 */
export function evaluateCreditDecision(
  score: number,
  entryValue: number,
  totalPrice: number
): CreditStatus {
  const entryPercentage = totalPrice > 0 ? entryValue / totalPrice : 0;

  // 1️⃣ Regra da Entrada Alta: SE (Entrada >= 50% do Total) E (Score < 700) → APROVADO
  if (entryPercentage >= 0.5 && score < 700) {
    return 'APROVADO';
  }

  // 2️⃣ Score Alto: SE Score > 700 → APROVADO
  if (score > 700) {
    return 'APROVADO';
  }

  // 3️⃣ Score Médio: SE Score entre 501 e 700 → EM_ANALISE
  if (score >= 501 && score <= 700) {
    return 'EM_ANALISE';
  }

  // 4️⃣ Score Baixo: SE Score <= 500 → REPROVADO
  return 'REPROVADO';
}
