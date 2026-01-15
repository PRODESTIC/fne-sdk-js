import { describe, it, expect } from 'vitest';
import {
  calculateTTC,
  calculateVAT,
  calculateHT,
  getVatRate,
  formatAmount,
  formatAmountWithDecimals,
  formatDate,
  applyDiscount,
  convertCurrency,
  isValidNcc,
  isValidPhone,
  isValidEmail,
  extractTokenFromUrl,
  buildVerificationUrl,
  generateUniqueId,
  cleanPhoneNumber,
  normalizeNcc,
} from '../../../src/utils/helpers.js';
import { TAX_TVA, TAX_TVAB, TAX_TVAC, TAX_TVAD } from '../../../src/utils/constants.js';

describe('helpers', () => {
  describe('Tax calculations', () => {
    describe('calculateTTC', () => {
      it('should calculate TTC from HT with 18% TVA', () => {
        expect(calculateTTC(100000, 18)).toBe(118000);
      });

      it('should calculate TTC from HT with 9% TVAB', () => {
        expect(calculateTTC(100000, 9)).toBeCloseTo(109000);
      });

      it('should handle 0% TVA', () => {
        expect(calculateTTC(100000, 0)).toBe(100000);
      });
    });

    describe('calculateVAT', () => {
      it('should calculate VAT amount', () => {
        expect(calculateVAT(100000, 18)).toBe(18000);
      });

      it('should handle 0% rate', () => {
        expect(calculateVAT(100000, 0)).toBe(0);
      });
    });

    describe('calculateHT', () => {
      it('should calculate HT from TTC', () => {
        const ht = calculateHT(118000, 18);
        expect(Math.round(ht)).toBe(100000);
      });
    });

    describe('getVatRate', () => {
      it('should return correct rates for tax types', () => {
        expect(getVatRate(TAX_TVA)).toBe(18);
        expect(getVatRate(TAX_TVAB)).toBe(9);
        expect(getVatRate(TAX_TVAC)).toBe(0);
        expect(getVatRate(TAX_TVAD)).toBe(0);
      });
    });
  });

  describe('Formatting', () => {
    describe('formatAmount', () => {
      it('should format amount with FCFA symbol', () => {
        expect(formatAmount(1250000)).toBe('1 250 000 FCFA');
      });

      it('should format amount without symbol', () => {
        expect(formatAmount(1250000, false)).toBe('1 250 000');
      });

      it('should round decimals', () => {
        expect(formatAmount(1250000.75)).toBe('1 250 001 FCFA');
      });
    });

    describe('formatAmountWithDecimals', () => {
      it('should format with decimals', () => {
        expect(formatAmountWithDecimals(1250000.5, 2)).toBe('1 250 000,50 FCFA');
      });

      it('should format without symbol', () => {
        expect(formatAmountWithDecimals(1250000.5, 2, false)).toBe('1 250 000,50');
      });
    });

    describe('formatDate', () => {
      it('should format date with default format', () => {
        const date = new Date('2024-01-15T10:30:00');
        expect(formatDate(date)).toBe('15/01/2024 10:30:00');
      });

      it('should handle invalid date', () => {
        expect(formatDate('invalid')).toBe('Date invalide');
      });
    });
  });

  describe('Discount and currency', () => {
    describe('applyDiscount', () => {
      it('should apply percentage discount', () => {
        expect(applyDiscount(100000, 10)).toBe(90000);
      });

      it('should handle 0% discount', () => {
        expect(applyDiscount(100000, 0)).toBe(100000);
      });

      it('should handle 100% discount', () => {
        expect(applyDiscount(100000, 100)).toBe(0);
      });

      it('should throw for invalid discount', () => {
        expect(() => applyDiscount(100000, -5)).toThrow();
        expect(() => applyDiscount(100000, 150)).toThrow();
      });
    });

    describe('convertCurrency', () => {
      it('should convert XOF to foreign currency', () => {
        expect(convertCurrency(655957, 655.957)).toBe(1000);
      });

      it('should convert foreign currency to XOF', () => {
        expect(convertCurrency(1000, 655.957, false)).toBe(655957);
      });

      it('should throw for invalid rate', () => {
        expect(() => convertCurrency(1000, 0)).toThrow();
        expect(() => convertCurrency(1000, -1)).toThrow();
      });
    });
  });

  describe('Validation', () => {
    describe('isValidNcc', () => {
      it('should validate correct NCC format', () => {
        expect(isValidNcc('9500015F')).toBe(true);
        expect(isValidNcc('1234567A')).toBe(true);
      });

      it('should reject invalid NCC format', () => {
        expect(isValidNcc('9500015')).toBe(false);   // no letter
        expect(isValidNcc('950001F')).toBe(false);   // too short
        expect(isValidNcc('9500015f')).toBe(false);  // lowercase letter
        expect(isValidNcc('95000156')).toBe(false);  // digit instead of letter
        expect(isValidNcc('')).toBe(false);
      });
    });

    describe('isValidPhone', () => {
      it('should validate Ivorian phone numbers', () => {
        expect(isValidPhone('0709123456')).toBe(true);
        expect(isValidPhone('07 09 12 34 56')).toBe(true);
        expect(isValidPhone('+2250709123456')).toBe(true);
        expect(isValidPhone('2250709123456')).toBe(true);
      });

      it('should reject invalid phone numbers', () => {
        expect(isValidPhone('123')).toBe(false);
        expect(isValidPhone('abcdefghij')).toBe(false);
      });
    });

    describe('isValidEmail', () => {
      it('should validate correct email format', () => {
        expect(isValidEmail('user@example.com')).toBe(true);
        expect(isValidEmail('user.name@example.co.ci')).toBe(true);
      });

      it('should reject invalid email format', () => {
        expect(isValidEmail('invalid')).toBe(false);
        expect(isValidEmail('user@')).toBe(false);
        expect(isValidEmail('@example.com')).toBe(false);
      });
    });
  });

  describe('Token handling', () => {
    describe('extractTokenFromUrl', () => {
      it('should extract token from URL', () => {
        const url = 'http://54.247.95.108/fr/verification/019465c1-3f61-766c-9652-706e32dfb436';
        expect(extractTokenFromUrl(url)).toBe('019465c1-3f61-766c-9652-706e32dfb436');
      });

      it('should return null for invalid URL', () => {
        expect(extractTokenFromUrl('not-a-url')).toBeNull();
      });
    });

    describe('buildVerificationUrl', () => {
      it('should build test URL', () => {
        const url = buildVerificationUrl('abc123', true);
        expect(url).toBe('http://54.247.95.108/fr/verification/abc123');
      });

      it('should build production URL', () => {
        const url = buildVerificationUrl('abc123', false, 'https://api.dgi.ci/ws');
        expect(url).toBe('https://api.dgi.ci/fr/verification/abc123');
      });
    });
  });

  describe('Utilities', () => {
    describe('generateUniqueId', () => {
      it('should generate unique IDs', () => {
        const id1 = generateUniqueId();
        const id2 = generateUniqueId();

        expect(id1).toMatch(/^FNE-\d+-[a-z0-9]+$/);
        expect(id1).not.toBe(id2);
      });

      it('should use custom prefix', () => {
        const id = generateUniqueId('INV');
        expect(id).toMatch(/^INV-\d+-[a-z0-9]+$/);
      });
    });

    describe('cleanPhoneNumber', () => {
      it('should remove spaces and special chars', () => {
        expect(cleanPhoneNumber('07 09 12 34 56')).toBe('0709123456');
        expect(cleanPhoneNumber('07.09.12.34.56')).toBe('0709123456');
        expect(cleanPhoneNumber('07-09-12-34-56')).toBe('0709123456');
      });
    });

    describe('normalizeNcc', () => {
      it('should uppercase and trim NCC', () => {
        expect(normalizeNcc(' 9500015f ')).toBe('9500015F');
      });
    });
  });
});
