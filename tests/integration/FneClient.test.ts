import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FneClient } from '../../src/FneClient.js';
import { Invoice } from '../../src/models/Invoice.js';
import { InvoiceItem } from '../../src/models/InvoiceItem.js';
import {
  INVOICE_TYPE_SALE,
  PAYMENT_CASH,
  TEMPLATE_B2C,
  TAX_TVA,
  TEST_BASE_URL,
} from '../../src/utils/constants.js';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('FneClient', () => {
  const API_KEY = 'test_api_key_minimum_20_chars';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('factory methods', () => {
    it('should create test client', () => {
      const client = FneClient.test(API_KEY);

      expect(client.isTestMode()).toBe(true);
      expect(client.getConfig().baseUrl).toBe(TEST_BASE_URL);
    });

    it('should create production client', () => {
      const productionUrl = 'https://api.dgi.ci/ws';
      const client = FneClient.production(API_KEY, productionUrl);

      expect(client.isTestMode()).toBe(false);
      expect(client.getConfig().baseUrl).toBe(productionUrl);
    });

    it('should throw error for production without URL', () => {
      expect(() => FneClient.production(API_KEY, '')).toThrow();
    });
  });

  describe('configuration', () => {
    it('should allow changing API key', () => {
      const client = FneClient.test(API_KEY);
      const newKey = 'new_api_key_minimum_20_chars';

      client.setApiKey(newKey);

      expect(client.getConfig().apiKey).toBe(newKey);
    });

    it('should switch to test mode', () => {
      const client = FneClient.production(API_KEY, 'https://api.dgi.ci/ws');

      client.enableTestMode();

      expect(client.isTestMode()).toBe(true);
      expect(client.getConfig().baseUrl).toBe(TEST_BASE_URL);
    });

    it('should switch to production mode', () => {
      const client = FneClient.test(API_KEY);
      const productionUrl = 'https://api.dgi.ci/ws';

      client.enableProductionMode(productionUrl);

      expect(client.isTestMode()).toBe(false);
      expect(client.getConfig().baseUrl).toBe(productionUrl);
    });

    it('should validate configuration', () => {
      const client = FneClient.test(API_KEY);

      expect(() => client.validateConfiguration()).not.toThrow();
    });
  });

  describe('services', () => {
    it('should return invoice service', () => {
      const client = FneClient.test(API_KEY);

      const invoiceService = client.invoices();

      expect(invoiceService).toBeDefined();
      expect(typeof invoiceService.signInvoice).toBe('function');
    });

    it('should return refund service', () => {
      const client = FneClient.test(API_KEY);

      const refundService = client.refunds();

      expect(refundService).toBeDefined();
      expect(typeof refundService.createRefund).toBe('function');
    });

    it('should return purchase service', () => {
      const client = FneClient.test(API_KEY);

      const purchaseService = client.purchases();

      expect(purchaseService).toBeDefined();
      expect(typeof purchaseService.signPurchaseInvoice).toBe('function');
    });

    it('should return same service instance on multiple calls', () => {
      const client = FneClient.test(API_KEY);

      const service1 = client.invoices();
      const service2 = client.invoices();

      expect(service1).toBe(service2);
    });
  });

  describe('invoice signing', () => {
    it('should sign invoice successfully', async () => {
      const mockResponse = {
        ncc: '9502363N',
        reference: 'FR-2024-001',
        token: 'http://54.247.95.108/fr/verification/abc123',
        warning: false,
        balance_sticker: 1000,
        invoice: {},
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      });

      const client = FneClient.test(API_KEY);

      const invoice = new Invoice({
        invoiceType: INVOICE_TYPE_SALE,
        paymentMethod: PAYMENT_CASH,
        template: TEMPLATE_B2C,
        pointOfSale: 'Caisse 1',
        establishment: 'Magasin',
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

      const response = await client.invoices().signInvoice(invoice);

      expect(response.isSuccess()).toBe(true);
      expect(response.getNcc()).toBe('9502363N');
      expect(response.getReference()).toBe('FR-2024-001');
      expect(response.getQrCodeUrl()).toBe('http://54.247.95.108/fr/verification/abc123');
      expect(response.hasWarning()).toBe(false);
      expect(response.getBalanceSticker()).toBe(1000);
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: () => Promise.resolve(JSON.stringify({
          message: 'Invalid invoice data',
        })),
      });

      const client = FneClient.test(API_KEY);

      const invoice = new Invoice({
        invoiceType: INVOICE_TYPE_SALE,
        paymentMethod: PAYMENT_CASH,
        template: TEMPLATE_B2C,
        pointOfSale: 'Caisse 1',
        establishment: 'Magasin',
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

      await expect(client.invoices().signInvoice(invoice)).rejects.toThrow();
    });

    it('should handle authentication errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Headers({ 'content-type': 'application/json' }),
        text: () => Promise.resolve(JSON.stringify({
          message: 'Unauthorized',
        })),
      });

      const client = FneClient.test(API_KEY);

      const invoice = new Invoice({
        invoiceType: INVOICE_TYPE_SALE,
        paymentMethod: PAYMENT_CASH,
        template: TEMPLATE_B2C,
        pointOfSale: 'Caisse 1',
        establishment: 'Magasin',
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

      await expect(client.invoices().signInvoice(invoice)).rejects.toThrow('Authentification');
    });
  });

  describe('cache management', () => {
    it('should clear cache', () => {
      const client = FneClient.test(API_KEY);

      expect(() => client.clearCache()).not.toThrow();
    });
  });
});
