import { describe, it, expect } from 'vitest';
import { evaluateCreditDecision } from './creditRules';

describe('creditRules - evaluateCreditDecision', () => {
  const TOTAL_PRICE = 40000;

  describe('Regra da Entrada Alta (Entrada >= 50% do total e Score < 700)', () => {
    it('deve aprovar quando a entrada for exatamente 50% mesmo com score baixo', () => {
      const entryValue = 20000; // 50% de 40.000
      const score = 400; // score baixo que normalmente reprovaria

      const status = evaluateCreditDecision(score, entryValue, TOTAL_PRICE);
      expect(status).toBe('APROVADO');
    });

    it('deve aprovar quando a entrada for superior a 50% e score médio', () => {
      const entryValue = 25000; // 62.5% de 40.000
      const score = 650; // score médio que normalmente ficaria em análise

      const status = evaluateCreditDecision(score, entryValue, TOTAL_PRICE);
      expect(status).toBe('APROVADO');
    });

    it('deve aprovar quando a entrada for 50% com score próximo ao limite (699)', () => {
      const entryValue = 20000;
      const score = 699;

      const status = evaluateCreditDecision(score, entryValue, TOTAL_PRICE);
      expect(status).toBe('APROVADO');
    });

    it('não deve aplicar regra de entrada alta se a entrada for ligeiramente menor que 50%', () => {
      const entryValue = 19999; // 49.9975%
      const score = 400; // score baixo

      const status = evaluateCreditDecision(score, entryValue, TOTAL_PRICE);
      expect(status).toBe('REPROVADO');
    });
  });

  describe('Score Alto (Score > 700)', () => {
    it('deve aprovar com score acima de 700 mesmo com entrada zero', () => {
      const entryValue = 0;
      const score = 701; // fronteira imediata

      const status = evaluateCreditDecision(score, entryValue, TOTAL_PRICE);
      expect(status).toBe('APROVADO');
    });

    it('deve aprovar com score excelente e qualquer valor de entrada', () => {
      const entryValue = 5000;
      const score = 950;

      const status = evaluateCreditDecision(score, entryValue, TOTAL_PRICE);
      expect(status).toBe('APROVADO');
    });
  });

  describe('Score Médio (Score entre 501 e 700 com entrada < 50%)', () => {
    it('deve deixar em análise quando score for 501 (fronteira inferior) e entrada baixa', () => {
      const entryValue = 5000; // 12.5%
      const score = 501;

      const status = evaluateCreditDecision(score, entryValue, TOTAL_PRICE);
      expect(status).toBe('EM_ANALISE');
    });

    it('deve deixar em análise quando score for 700 (fronteira superior) e entrada baixa', () => {
      const entryValue = 10000; // 25%
      const score = 700;

      const status = evaluateCreditDecision(score, entryValue, TOTAL_PRICE);
      expect(status).toBe('EM_ANALISE');
    });

    it('deve deixar em análise no meio da faixa (ex: score 600)', () => {
      const entryValue = 0;
      const score = 600;

      const status = evaluateCreditDecision(score, entryValue, TOTAL_PRICE);
      expect(status).toBe('EM_ANALISE');
    });
  });

  describe('Score Baixo (Score <= 500 com entrada < 50%)', () => {
    it('deve reprovar quando score for exatamente 500 (fronteira) e entrada baixa', () => {
      const entryValue = 10000; // 25%
      const score = 500;

      const status = evaluateCreditDecision(score, entryValue, TOTAL_PRICE);
      expect(status).toBe('REPROVADO');
    });

    it('deve reprovar quando score for muito baixo (ex: 200) e sem entrada suficiente', () => {
      const entryValue = 0;
      const score = 200;

      const status = evaluateCreditDecision(score, entryValue, TOTAL_PRICE);
      expect(status).toBe('REPROVADO');
    });

    it('deve reprovar com score 0 e entrada menor que 50%', () => {
      const entryValue = 19000;
      const score = 0;

      const status = evaluateCreditDecision(score, entryValue, TOTAL_PRICE);
      expect(status).toBe('REPROVADO');
    });
  });

  describe('Casos de Borda e Segurança', () => {
    it('deve tratar preço total zerado sem disparar divisão por zero ou NaN', () => {
      const entryValue = 0;
      const score = 300;

      const status = evaluateCreditDecision(score, entryValue, 0);
      expect(status).toBe('REPROVADO');
    });
  });
});
