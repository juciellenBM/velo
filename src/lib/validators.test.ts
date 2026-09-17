import { describe, it, expect } from 'vitest';
import { isValidCpf, isValidEmailStrict, onlyDigits } from './validators';

describe('validators', () => {
  describe('isValidCpf', () => {
    it('deve validar CPFs válidos conhecidos sem formatação', () => {
      expect(isValidCpf('90632700033')).toBe(true);
      expect(isValidCpf('01711917141')).toBe(true);
      expect(isValidCpf('56130983018')).toBe(true);
      expect(isValidCpf('94663718000')).toBe(true);
    });

    it('deve validar CPFs válidos com pontuação e traço', () => {
      expect(isValidCpf('906.327.000-33')).toBe(true);
      expect(isValidCpf('017.119.171-41')).toBe(true);
      expect(isValidCpf('561.309.830-18')).toBe(true);
      expect(isValidCpf('946.637.180-00')).toBe(true);
    });

    it('deve rejeitar sequências de dígitos repetidos conhecidas', () => {
      expect(isValidCpf('00000000000')).toBe(false);
      expect(isValidCpf('11111111111')).toBe(false);
      expect(isValidCpf('222.222.222-22')).toBe(false);
      expect(isValidCpf('333.333.333-33')).toBe(false);
      expect(isValidCpf('99999999999')).toBe(false);
    });

    it('deve rejeitar CPF com primeiro dígito verificador incorreto', () => {
      // 906327000 33 é o correto -> 906327000 43 tem o 1º dígito alterado
      expect(isValidCpf('90632700043')).toBe(false);
    });

    it('deve rejeitar CPF com segundo dígito verificador incorreto', () => {
      // 906327000 33 é o correto -> 906327000 34 tem o 2º dígito alterado
      expect(isValidCpf('90632700034')).toBe(false);
    });

    it('deve rejeitar CPFs inválidos conhecidos dos testes de checkout', () => {
      expect(isValidCpf('44177930838')).toBe(false);
    });

    it('deve rejeitar CPFs com menos ou mais de 11 dígitos numéricos', () => {
      expect(isValidCpf('1234567890')).toBe(false); // 10 dígitos
      expect(isValidCpf('906327000331')).toBe(false); // 12 dígitos
      expect(isValidCpf('123')).toBe(false);
    });

    it('deve rejeitar string vazia ou sem números', () => {
      expect(isValidCpf('')).toBe(false);
      expect(isValidCpf('abcdefghijk')).toBe(false);
    });
  });

  describe('isValidEmailStrict', () => {
    it('deve validar e-mails com formatos válidos', () => {
      expect(isValidEmailStrict('cliente@velo.dev')).toBe(true);
      expect(isValidEmailStrict('juciellen@hotmail.com')).toBe(true);
      expect(isValidEmailStrict('contato.pedido@empresa.com.br')).toBe(true);
    });

    it('deve rejeitar e-mails com @. ou pontos consecutivos', () => {
      expect(isValidEmailStrict('jbmoraes@.com')).toBe(false);
      expect(isValidEmailStrict('usuario@dominio..com')).toBe(false);
    });

    it('deve rejeitar strings sem @ ou sem domínio válido', () => {
      expect(isValidEmailStrict('emailsemdominio')).toBe(false);
      expect(isValidEmailStrict('email@semextensao')).toBe(false);
      expect(isValidEmailStrict('')).toBe(false);
    });
  });

  describe('onlyDigits', () => {
    it('deve remover caracteres não numéricos mantendo apenas dígitos', () => {
      expect(onlyDigits('(64) 99251-6810')).toBe('64992516810');
      expect(onlyDigits('017.119.171-41')).toBe('01711917141');
      expect(onlyDigits('R$ 40.000,00')).toBe('4000000');
      expect(onlyDigits('somente-letras')).toBe('');
    });
  });
});
