import { describe, it, expect } from 'vitest';
import { InvoiceItem } from '../../../src/models/InvoiceItem.js';
import { TAX_TVA, TAX_TVAB } from '../../../src/utils/constants.js';

describe('InvoiceItem', () => {
  const defaultOptions = {
    description: 'Laptop HP ProBook',
    quantity: 2,
    amount: 650000,
    taxes: [TAX_TVA] as const,
  };

  describe('constructor', () => {
    it('should create an item with required fields', () => {
      const item = new InvoiceItem(defaultOptions);

      expect(item.getDescription()).toBe('Laptop HP ProBook');
      expect(item.getQuantity()).toBe(2);
      expect(item.getAmount()).toBe(650000);
      expect(item.getTaxes()).toEqual([TAX_TVA]);
    });

    it('should initialize optional fields with defaults', () => {
      const item = new InvoiceItem(defaultOptions);

      expect(item.getReference()).toBeNull();
      expect(item.getDiscount()).toBe(0);
      expect(item.getMeasurementUnit()).toBeNull();
      expect(item.getCustomTaxes()).toEqual([]);
    });
  });

  describe('fluent interface', () => {
    it('should support method chaining', () => {
      const item = new InvoiceItem(defaultOptions)
        .setReference('HP-PB-450G8')
        .setDiscount(5)
        .setMeasurementUnit('pcs');

      expect(item.getReference()).toBe('HP-PB-450G8');
      expect(item.getDiscount()).toBe(5);
      expect(item.getMeasurementUnit()).toBe('pcs');
    });
  });

  describe('custom taxes', () => {
    it('should add custom taxes', () => {
      const item = new InvoiceItem(defaultOptions)
        .addCustomTax('DTD', 1000)
        .addCustomTax('AIRSI', 500);

      const customTaxes = item.getCustomTaxes();

      expect(customTaxes).toHaveLength(2);
      expect(customTaxes[0]?.getName()).toBe('DTD');
      expect(customTaxes[0]?.getAmount()).toBe(1000);
      expect(customTaxes[1]?.getName()).toBe('AIRSI');
      expect(customTaxes[1]?.getAmount()).toBe(500);
    });
  });

  describe('calculations', () => {
    it('should calculate total HT', () => {
      const item = new InvoiceItem({
        description: 'Product',
        quantity: 3,
        amount: 10000,
        taxes: [TAX_TVA],
      });

      expect(item.getTotalHT()).toBe(30000);
    });

    it('should calculate total HT after discount', () => {
      const item = new InvoiceItem({
        description: 'Product',
        quantity: 2,
        amount: 10000,
        taxes: [TAX_TVA],
      })
        .setDiscount(10);

      expect(item.getTotalHTAfterDiscount()).toBe(18000); // 20000 - 10%
    });
  });

  describe('discount validation', () => {
    it('should throw error for discount below 0', () => {
      const item = new InvoiceItem(defaultOptions);

      expect(() => item.setDiscount(-5)).toThrow('La remise doit être entre 0 et 100');
    });

    it('should throw error for discount above 100', () => {
      const item = new InvoiceItem(defaultOptions);

      expect(() => item.setDiscount(150)).toThrow('La remise doit être entre 0 et 100');
    });
  });

  describe('multiple taxes', () => {
    it('should support multiple tax types', () => {
      const item = new InvoiceItem({
        ...defaultOptions,
        taxes: [TAX_TVA, TAX_TVAB],
      });

      expect(item.getTaxes()).toEqual([TAX_TVA, TAX_TVAB]);
    });
  });

  describe('toArray', () => {
    it('should serialize item to array', () => {
      const item = new InvoiceItem(defaultOptions);

      const result = item.toArray();

      expect(result.description).toBe('Laptop HP ProBook');
      expect(result.quantity).toBe(2);
      expect(result.amount).toBe(650000);
      expect(result.taxes).toEqual([TAX_TVA]);
    });

    it('should include optional fields only when set', () => {
      const item = new InvoiceItem(defaultOptions)
        .setReference('REF-001');

      const result = item.toArray();

      expect(result.reference).toBe('REF-001');
      expect(result.measurementUnit).toBeUndefined();
    });

    it('should include discount only when > 0', () => {
      const itemWithoutDiscount = new InvoiceItem(defaultOptions);
      const itemWithDiscount = new InvoiceItem(defaultOptions).setDiscount(10);

      expect(itemWithoutDiscount.toArray().discount).toBeUndefined();
      expect(itemWithDiscount.toArray().discount).toBe(10);
    });

    it('should include custom taxes when present', () => {
      const item = new InvoiceItem(defaultOptions)
        .addCustomTax('DTD', 1000);

      const result = item.toArray();

      expect(result.customTaxes).toHaveLength(1);
      expect(result.customTaxes?.[0]).toEqual({ name: 'DTD', amount: 1000 });
    });
  });
});
