import { describe, it, expect } from 'vitest';
import { Invoice } from '../../../src/models/Invoice.js';
import { InvoiceItem } from '../../../src/models/InvoiceItem.js';
import {
  INVOICE_TYPE_SALE,
  INVOICE_TYPE_PURCHASE,
  PAYMENT_CASH,
  PAYMENT_TRANSFER,
  TEMPLATE_B2C,
  TEMPLATE_B2B,
  TEMPLATE_B2F,
  TAX_TVA,
  CURRENCY_EUR,
} from '../../../src/utils/constants.js';

describe('Invoice', () => {
  const defaultOptions = {
    invoiceType: INVOICE_TYPE_SALE as const,
    paymentMethod: PAYMENT_CASH as const,
    template: TEMPLATE_B2C as const,
    pointOfSale: 'Caisse 1',
    establishment: 'Magasin Principal',
    clientCompanyName: 'Jean Dupont',
    clientPhone: '0709123456',
    clientEmail: 'jean@email.com',
  };

  describe('constructor', () => {
    it('should create an invoice with required fields', () => {
      const invoice = new Invoice(defaultOptions);

      expect(invoice.getInvoiceType()).toBe(INVOICE_TYPE_SALE);
      expect(invoice.getPaymentMethod()).toBe(PAYMENT_CASH);
      expect(invoice.getTemplate()).toBe(TEMPLATE_B2C);
      expect(invoice.getPointOfSale()).toBe('Caisse 1');
      expect(invoice.getEstablishment()).toBe('Magasin Principal');
      expect(invoice.getClientCompanyName()).toBe('Jean Dupont');
      expect(invoice.getClientPhone()).toBe('0709123456');
      expect(invoice.getClientEmail()).toBe('jean@email.com');
    });

    it('should initialize optional fields with defaults', () => {
      const invoice = new Invoice(defaultOptions);

      expect(invoice.getClientNcc()).toBeNull();
      expect(invoice.getClientSellerName()).toBeNull();
      expect(invoice.getCommercialMessage()).toBeNull();
      expect(invoice.getFooter()).toBeNull();
      expect(invoice.getForeignCurrency()).toBeNull();
      expect(invoice.getForeignCurrencyRate()).toBe(0);
      expect(invoice.getIsRne()).toBe(false);
      expect(invoice.getRne()).toBeNull();
      expect(invoice.getDiscount()).toBe(0);
      expect(invoice.getItems()).toEqual([]);
      expect(invoice.getCustomTaxes()).toEqual([]);
    });
  });

  describe('fluent interface', () => {
    it('should support method chaining', () => {
      const invoice = new Invoice(defaultOptions)
        .setClientNcc('9500015F')
        .setClientSellerName('Marie Martin')
        .setCommercialMessage('Merci pour votre achat!')
        .setFooter('Conditions de vente...')
        .setDiscount(10);

      expect(invoice.getClientNcc()).toBe('9500015F');
      expect(invoice.getClientSellerName()).toBe('Marie Martin');
      expect(invoice.getCommercialMessage()).toBe('Merci pour votre achat!');
      expect(invoice.getFooter()).toBe('Conditions de vente...');
      expect(invoice.getDiscount()).toBe(10);
    });
  });

  describe('B2B invoice', () => {
    it('should create a B2B invoice with NCC', () => {
      const invoice = new Invoice({
        ...defaultOptions,
        template: TEMPLATE_B2B,
        paymentMethod: PAYMENT_TRANSFER,
        clientNcc: '9500015F',
      });

      expect(invoice.isB2B()).toBe(true);
      expect(invoice.getClientNcc()).toBe('9500015F');
    });
  });

  describe('B2F invoice', () => {
    it('should create a B2F invoice with foreign currency', () => {
      const invoice = new Invoice({
        ...defaultOptions,
        template: TEMPLATE_B2F,
        foreignCurrency: CURRENCY_EUR,
        foreignCurrencyRate: 655.957,
      });

      expect(invoice.isB2F()).toBe(true);
      expect(invoice.getForeignCurrency()).toBe(CURRENCY_EUR);
      expect(invoice.getForeignCurrencyRate()).toBe(655.957);
    });
  });

  describe('purchase invoice', () => {
    it('should create a purchase invoice', () => {
      const invoice = new Invoice({
        ...defaultOptions,
        invoiceType: INVOICE_TYPE_PURCHASE,
      });

      expect(invoice.isPurchase()).toBe(true);
      expect(invoice.getInvoiceType()).toBe(INVOICE_TYPE_PURCHASE);
    });
  });

  describe('items management', () => {
    it('should add items to invoice', () => {
      const invoice = new Invoice(defaultOptions);
      const item = new InvoiceItem({
        description: 'Product 1',
        quantity: 2,
        amount: 10000,
        taxes: [TAX_TVA],
      });

      invoice.addItem(item);

      expect(invoice.getItems()).toHaveLength(1);
      expect(invoice.getItemCount()).toBe(1);
    });

    it('should add multiple items', () => {
      const invoice = new Invoice(defaultOptions);

      invoice
        .addItem(new InvoiceItem({
          description: 'Product 1',
          quantity: 1,
          amount: 10000,
          taxes: [TAX_TVA],
        }))
        .addItem(new InvoiceItem({
          description: 'Product 2',
          quantity: 2,
          amount: 20000,
          taxes: [TAX_TVA],
        }));

      expect(invoice.getItemCount()).toBe(2);
    });
  });

  describe('custom taxes', () => {
    it('should add custom taxes', () => {
      const invoice = new Invoice(defaultOptions)
        .addCustomTax('DTD', 1000)
        .addCustomTax('AIRSI', 500);

      expect(invoice.getCustomTaxes()).toHaveLength(2);
    });
  });

  describe('RNE', () => {
    it('should set RNE properties', () => {
      const invoice = new Invoice(defaultOptions)
        .setRne(true, 'RNE-2024-001');

      expect(invoice.getIsRne()).toBe(true);
      expect(invoice.getRne()).toBe('RNE-2024-001');
    });
  });

  describe('discount validation', () => {
    it('should throw error for discount below 0', () => {
      const invoice = new Invoice(defaultOptions);

      expect(() => invoice.setDiscount(-5)).toThrow('La remise doit être entre 0 et 100');
    });

    it('should throw error for discount above 100', () => {
      const invoice = new Invoice(defaultOptions);

      expect(() => invoice.setDiscount(150)).toThrow('La remise doit être entre 0 et 100');
    });
  });

  describe('toArray', () => {
    it('should serialize invoice to array', () => {
      const invoice = new Invoice(defaultOptions);
      const item = new InvoiceItem({
        description: 'Product',
        quantity: 1,
        amount: 10000,
        taxes: [TAX_TVA],
      });
      invoice.addItem(item);

      const result = invoice.toArray();

      expect(result.invoiceType).toBe(INVOICE_TYPE_SALE);
      expect(result.paymentMethod).toBe(PAYMENT_CASH);
      expect(result.template).toBe(TEMPLATE_B2C);
      expect(result.items).toHaveLength(1);
      expect(result.isRne).toBe(false);
    });

    it('should include optional fields only when set', () => {
      const invoice = new Invoice({
        ...defaultOptions,
        clientNcc: '9500015F',
      });

      const result = invoice.toArray();

      expect(result.clientNcc).toBe('9500015F');
      expect(result.clientSellerName).toBeUndefined();
    });
  });
});
