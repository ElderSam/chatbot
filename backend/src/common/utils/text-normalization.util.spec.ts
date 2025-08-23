import { normalizePortugueseText, prepareTextForSearch } from './text-normalization.util';

describe('Text Normalization Utils', () => {
  describe('normalizePortugueseText', () => {
    it('should normalize Portuguese accented characters', () => {
      expect(normalizePortugueseText('sugestão')).toBe('sugestao');
      expect(normalizePortugueseText('física')).toBe('fisica');
      expect(normalizePortugueseText('segurança')).toBe('seguranca');
      expect(normalizePortugueseText('informação')).toBe('informacao');
      expect(normalizePortugueseText('configuração')).toBe('configuracao');
    });

    it('should handle mixed case text', () => {
      expect(normalizePortugueseText('SUGESTÃO')).toBe('SUGESTAO');
      expect(normalizePortugueseText('Física')).toBe('Fisica');
      expect(normalizePortugueseText('Segurança')).toBe('Seguranca');
    });

    it('should preserve basic punctuation and spaces', () => {
      expect(normalizePortugueseText('Como funciona a configuração?')).toBe('Como funciona a configuracao?');
      expect(normalizePortugueseText('Opção A, opção B.')).toBe('Opcao A, opcao B.');
    });

    it('should remove special characters but keep basic ones', () => {
      expect(normalizePortugueseText('sugestão@#$%')).toBe('sugestao');
      expect(normalizePortugueseText('física (teste)')).toBe('fisica teste');
    });

    it('should handle empty and whitespace strings', () => {
      expect(normalizePortugueseText('')).toBe('');
      expect(normalizePortugueseText('   ')).toBe('');
      expect(normalizePortugueseText('  texto  ')).toBe('texto');
    });
  });

  describe('prepareTextForSearch', () => {
    it('should normalize and lowercase text', () => {
      expect(prepareTextForSearch('SUGESTÃO')).toBe('sugestao');
      expect(prepareTextForSearch('Física Avançada')).toBe('fisica avancada');
      expect(prepareTextForSearch('Configuração de Segurança')).toBe('configuracao de seguranca');
    });

    it('should handle complex Portuguese text', () => {
      const input = 'Como configurar as opções de pagamento com cartão?';
      const expected = 'como configurar as opcoes de pagamento com cartao?';
      expect(prepareTextForSearch(input)).toBe(expected);
    });
  });
});
