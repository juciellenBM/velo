import { describe, it, expect } from 'vitest';
import {
  calculateTotalPrice,
  calculateInstallment,
  formatPrice,
  CarConfiguration,
} from './configuratorStore';

describe('configuratorStore - Funções Puras', () => {
  describe('calculateTotalPrice', () => {
    it('deve calcular o preço base com rodas aero e sem opcionais', () => {
      const config: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'aero',
        optionals: [],
      };

      const total = calculateTotalPrice(config);
      expect(total).toBe(40000);
    });

    it('deve somar o valor das rodas sport ao preço base', () => {
      const config: CarConfiguration = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'sport',
        optionals: [],
      };

      const total = calculateTotalPrice(config);
      expect(total).toBe(42000); // 40000 + 2000
    });

    it('deve somar opcionais individuais corretamente', () => {
      const configWithPark: CarConfiguration = {
        exteriorColor: 'midnight-black',
        interiorColor: 'deep-blue',
        wheelType: 'aero',
        optionals: ['precision-park'],
      };

      expect(calculateTotalPrice(configWithPark)).toBe(45500); // 40000 + 5500

      const configWithFlux: CarConfiguration = {
        exteriorColor: 'lunar-white',
        interiorColor: 'carbon-black',
        wheelType: 'aero',
        optionals: ['flux-capacitor'],
      };

      expect(calculateTotalPrice(configWithFlux)).toBe(45000); // 40000 + 5000
    });

    it('deve calcular o valor completo com rodas sport e múltiplos opcionais', () => {
      const fullConfig: CarConfiguration = {
        exteriorColor: 'lunar-white',
        interiorColor: 'deep-blue',
        wheelType: 'sport',
        optionals: ['precision-park', 'flux-capacitor'],
      };

      // 40000 (base) + 2000 (sport) + 5500 (precision-park) + 5000 (flux-capacitor) = 52500
      expect(calculateTotalPrice(fullConfig)).toBe(52500);
    });

    it('deve tolerar lista de opcionais não definida ou vazia', () => {
      const configWithoutOptionals = {
        exteriorColor: 'glacier-blue',
        interiorColor: 'carbon-black',
        wheelType: 'aero',
      } as unknown as CarConfiguration;

      expect(calculateTotalPrice(configWithoutOptionals)).toBe(40000);
    });
  });

  describe('calculateInstallment', () => {
    it('deve calcular a parcela em 12x com 2% de juros compostos ao mês', () => {
      const total = 40000;
      const installment = calculateInstallment(total);

      // (40000 * 0.02 * (1.02)^12) / ((1.02)^12 - 1) ≈ 3782.38
      expect(installment).toBe(3782.38);
    });

    it('deve calcular a parcela corretamente para outros valores totais', () => {
      const total = 52500;
      const installment = calculateInstallment(total);

      // (52500 * 0.02 * (1.02)^12) / ((1.02)^12 - 1) ≈ 4964.38
      expect(installment).toBe(4964.38);
    });
  });

  describe('formatPrice', () => {
    it('deve formatar valor numérico no padrão de moeda brasileira (BRL)', () => {
      const formatted = formatPrice(40000);
      // Normaliza espaços (como non-breaking space \u00a0 comum no Intl)
      const normalized = formatted.replace(/\u00a0/g, ' ');

      expect(normalized).toBe('R$ 40.000,00');
    });

    it('deve formatar valores com casas decimais', () => {
      const formatted = formatPrice(3782.38);
      const normalized = formatted.replace(/\u00a0/g, ' ');

      expect(normalized).toBe('R$ 3.782,38');
    });

    it('deve formatar zero corretamente', () => {
      const formatted = formatPrice(0);
      const normalized = formatted.replace(/\u00a0/g, ' ');

      expect(normalized).toBe('R$ 0,00');
    });
  });
});
