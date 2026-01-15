import { describe, it, expect } from 'vitest';
import { InvoiceValidator } from '../../../src/validators/InvoiceValidator.js';
import { Invoice } from '../../../src/models/Invoice.js';
import { InvoiceItem } from '../../../src/models/InvoiceItem.js';
import { ValidationError } from '../../../src/exceptions/ValidationError.js';
import {
  INVOICE_TYPE_SALE,
  PAYMENT_CASH,
  PAYMENT_TRANSFER,
  TEMPLATE_B2C,
  TEMPLATE_B2B,
  TEMPLATE_B2F,
  TAX_TVA,
  CURRENCY_EUR,
} from '../../../src/utils/constants.js';

describe('InvoiceValidator', () => {
  let validator: InvoiceValidator;

  const createValidInvoice = () => {
    const invoice = new Invoice({
      invoiceType: INVOICE_TYPE_SALE,
      paymentMethod: PAYMENT_CASH,
      template: TEMPLATE_B2C,
      pointOfSale: 'Caisse 1',
      establishment: 'Magasin Principal',
      clientCompanyName: 'Jean Dupont',
      clientPhone: '0709123456',
      clientEmail: 'jean@email.com',
    });

    invoice.addItem(new InvoiceItem({
      description: 'Product',
      quantity: 1,
      amount: 10000,
      taxes: [TAX_TVA],
    }));

    return invoice;
  };

  beforeEach(() => {
    validator = new InvoiceValidator();
  });

  describe('valid invoice', () => {
    it('should pass validation for a valid B2C invoice', () => {
      const invoice = createValidInvoice();

      expect(() => validator.validate(invoice)).not.toThrow();
    });

    it('should pass validation for a valid B2B invoice', () => {
      const invoice = new Invoice({
        invoiceType: INVOICE_TYPE_SALE,
        paymentMethod: PAYMENT_TRANSFER,
        template: TEMPLATE_B2B,
        pointOfSale: 'Caisse 1',
        establishment: 'Magasin',
        clientCompanyName: 'Entreprise ABC',
        clientPhone: '0709123456',
        clientEmail: 'contact@abc.ci',
        clientNcc: '9500015F',
      });

      invoice.addItem(new InvoiceItem({
        description: 'Service',
        quantity: 1,
        amount: 100000,
        taxes: [TAX_TVA],
      }));

      expect(() => validator.validate(invoice)).not.toThrow();
    });

    it('should pass validation for a valid B2F invoice', () => {
      const invoice = new Invoice({
        invoiceType: INVOICE_TYPE_SALE,
        paymentMethod: PAYMENT_TRANSFER,
        template: TEMPLATE_B2F,
        pointOfSale: 'Caisse 1',
        establishment: 'Magasin',
        clientCompanyName: 'Foreign Company',
        clientPhone: '0709123456',
        clientEmail: 'contact@foreign.com',
        foreignCurrency: CURRENCY_EUR,
        foreignCurrencyRate: 655.957,
      });

      invoice.addItem(new InvoiceItem({
        description: 'Export Product',
        quantity: 1,
        amount: 100000,
        taxes: [TAX_TVA],
      }));

      expect(() => validator.validate(invoice)).not.toThrow();
    });
  });

  describe('required fields', () => {
    it('should fail when pointOfSale is empty', () => {
      const invoice = new Invoice({
        invoiceType: INVOICE_TYPE_SALE,
        paymentMethod: PAYMENT_CASH,
        template: TEMPLATE_B2C,
        pointOfSale: '',
        establishment: 'Magasin',
        clientCompanyName: 'Jean',
        clientPhone: '0709123456',
        clientEmail: 'jean@email.com',
      });

      invoice.addItem(new InvoiceItem({
        description: 'Product',
        quantity: 1,
        amount: 10000,
        taxes: [TAX_TVA],
      }));

      expect(() => validator.validate(invoice)).toThrow(ValidationError);
    });

    it('should fail when no items', () => {
      const invoice = new Invoice({
        invoiceType: INVOICE_TYPE_SALE,
        paymentMethod: PAYMENT_CASH,
        template: TEMPLATE_B2C,
        pointOfSale: 'Caisse 1',
        establishment: 'Magasin',
        clientCompanyName: 'Jean',
        clientPhone: '0709123456',
        clientEmail: 'jean@email.com',
      });

      expect(() => validator.validate(invoice)).toThrow(ValidationError);
      try {
        validator.validate(invoice);
      } catch (e) {
        expect((e as ValidationError).hasError('items')).toBe(true);
      }
    });
  });

  describe('email validation', () => {
    it('should fail for invalid email', () => {
      const invoice = new Invoice({
        invoiceType: INVOICE_TYPE_SALE,
        paymentMethod: PAYMENT_CASH,
        template: TEMPLATE_B2C,
        pointOfSale: 'Caisse 1',
        establishment: 'Magasin',
        clientCompanyName: 'Jean',
        clientPhone: '0709123456',
        clientEmail: 'invalid-email',
      });

      invoice.addItem(new InvoiceItem({
        description: 'Product',
        quantity: 1,
        amount: 10000,
        taxes: [TAX_TVA],
      }));

      expect(() => validator.validate(invoice)).toThrow(ValidationError);
    });
  });

  describe('phone validation', () => {
    it('should fail for invalid phone', () => {
      const invoice = new Invoice({
        invoiceType: INVOICE_TYPE_SALE,
        paymentMethod: PAYMENT_CASH,
        template: TEMPLATE_B2C,
        pointOfSale: 'Caisse 1',
        establishment: 'Magasin',
        clientCompanyName: 'Jean',
        clientPhone: '123', // too short
        clientEmail: 'jean@email.com',
      });

      invoice.addItem(new InvoiceItem({
        description: 'Product',
        quantity: 1,
        amount: 10000,
        taxes: [TAX_TVA],
      }));

      expect(() => validator.validate(invoice)).toThrow(ValidationError);
    });
  });

  describe('B2B validation', () => {
    it('should fail when B2B invoice has no NCC', () => {
      const invoice = new Invoice({
        invoiceType: INVOICE_TYPE_SALE,
        paymentMethod: PAYMENT_TRANSFER,
        template: TEMPLATE_B2B,
        pointOfSale: 'Caisse 1',
        establishment: 'Magasin',
        clientCompanyName: 'Entreprise',
        clientPhone: '0709123456',
        clientEmail: 'contact@entreprise.ci',
      });

      invoice.addItem(new InvoiceItem({
        description: 'Product',
        quantity: 1,
        amount: 10000,
        taxes: [TAX_TVA],
      }));

      expect(() => validator.validate(invoice)).toThrow(ValidationError);
      try {
        validator.validate(invoice);
      } catch (e) {
        expect((e as ValidationError).hasError('clientNcc')).toBe(true);
      }
    });

    it('should fail when B2B invoice has invalid NCC format', () => {
      const invoice = new Invoice({
        invoiceType: INVOICE_TYPE_SALE,
        paymentMethod: PAYMENT_TRANSFER,
        template: TEMPLATE_B2B,
        pointOfSale: 'Caisse 1',
        establishment: 'Magasin',
        clientCompanyName: 'Entreprise',
        clientPhone: '0709123456',
        clientEmail: 'contact@entreprise.ci',
        clientNcc: '12345', // invalid format
      });

      invoice.addItem(new InvoiceItem({
        description: 'Product',
        quantity: 1,
        amount: 10000,
        taxes: [TAX_TVA],
      }));

      expect(() => validator.validate(invoice)).toThrow(ValidationError);
    });
  });

  describe('B2F validation', () => {
    it('should fail when B2F invoice has no currency', () => {
      const invoice = new Invoice({
        invoiceType: INVOICE_TYPE_SALE,
        paymentMethod: PAYMENT_TRANSFER,
        template: TEMPLATE_B2F,
        pointOfSale: 'Caisse 1',
        establishment: 'Magasin',
        clientCompanyName: 'Foreign Corp',
        clientPhone: '0709123456',
        clientEmail: 'contact@foreign.com',
      });

      invoice.addItem(new InvoiceItem({
        description: 'Product',
        quantity: 1,
        amount: 10000,
        taxes: [TAX_TVA],
      }));

      expect(() => validator.validate(invoice)).toThrow(ValidationError);
      try {
        validator.validate(invoice);
      } catch (e) {
        expect((e as ValidationError).hasError('foreignCurrency')).toBe(true);
      }
    });

    it('should fail when B2F invoice has no exchange rate', () => {
      const invoice = new Invoice({
        invoiceType: INVOICE_TYPE_SALE,
        paymentMethod: PAYMENT_TRANSFER,
        template: TEMPLATE_B2F,
        pointOfSale: 'Caisse 1',
        establishment: 'Magasin',
        clientCompanyName: 'Foreign Corp',
        clientPhone: '0709123456',
        clientEmail: 'contact@foreign.com',
        foreignCurrency: CURRENCY_EUR,
        foreignCurrencyRate: 0, // invalid
      });

      invoice.addItem(new InvoiceItem({
        description: 'Product',
        quantity: 1,
        amount: 10000,
        taxes: [TAX_TVA],
      }));

      expect(() => validator.validate(invoice)).toThrow(ValidationError);
      try {
        validator.validate(invoice);
      } catch (e) {
        expect((e as ValidationError).hasError('foreignCurrencyRate')).toBe(true);
      }
    });
  });

  describe('item validation', () => {
    it('should fail when item has no description', () => {
      const invoice = createValidInvoice();
      invoice.addItem(new InvoiceItem({
        description: '',
        quantity: 1,
        amount: 10000,
        taxes: [TAX_TVA],
      }));

      expect(() => validator.validate(invoice)).toThrow(ValidationError);
    });

    it('should fail when item has zero quantity', () => {
      const invoice = new Invoice({
        invoiceType: INVOICE_TYPE_SALE,
        paymentMethod: PAYMENT_CASH,
        template: TEMPLATE_B2C,
        pointOfSale: 'Caisse 1',
        establishment: 'Magasin',
        clientCompanyName: 'Jean',
        clientPhone: '0709123456',
        clientEmail: 'jean@email.com',
      });

      invoice.addItem(new InvoiceItem({
        description: 'Product',
        quantity: 0,
        amount: 10000,
        taxes: [TAX_TVA],
      }));

      expect(() => validator.validate(invoice)).toThrow(ValidationError);
    });

    it('should fail when item has no taxes for sale invoice', () => {
      const invoice = new Invoice({
        invoiceType: INVOICE_TYPE_SALE,
        paymentMethod: PAYMENT_CASH,
        template: TEMPLATE_B2C,
        pointOfSale: 'Caisse 1',
        establishment: 'Magasin',
        clientCompanyName: 'Jean',
        clientPhone: '0709123456',
        clientEmail: 'jean@email.com',
      });

      invoice.addItem(new InvoiceItem({
        description: 'Product',
        quantity: 1,
        amount: 10000,
        taxes: [], // no taxes
      }));

      expect(() => validator.validate(invoice)).toThrow(ValidationError);
    });
  });

  describe('error collection', () => {
    it('should collect multiple errors', () => {
      const invoice = new Invoice({
        invoiceType: INVOICE_TYPE_SALE,
        paymentMethod: PAYMENT_CASH,
        template: TEMPLATE_B2C,
        pointOfSale: '',
        establishment: '',
        clientCompanyName: '',
        clientPhone: '123',
        clientEmail: 'invalid',
      });

      try {
        validator.validate(invoice);
        expect.fail('Should have thrown');
      } catch (e) {
        const error = e as ValidationError;
        expect(error.getErrorCount()).toBeGreaterThan(1);
      }
    });
  });
});
