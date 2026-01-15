/**
 * SDK FNE (Facture Normalisée Électronique) pour JavaScript/TypeScript
 *
 * SDK non-officiel pour l'intégration avec l'API FNE de la DGI Côte d'Ivoire.
 * Permet de créer, signer et gérer des factures électroniques normalisées.
 *
 * @example
 * ```typescript
 * import { FneClient, Invoice, InvoiceItem, Constants } from '@prodestic/fne-sdk-js';
 *
 * // Initialiser le client
 * const client = FneClient.test('votre_cle_api');
 *
 * // Créer une facture
 * const invoice = new Invoice({
 *   invoiceType: Constants.INVOICE_TYPE_SALE,
 *   paymentMethod: Constants.PAYMENT_CASH,
 *   template: Constants.TEMPLATE_B2C,
 *   pointOfSale: 'Caisse 1',
 *   establishment: 'Magasin Principal',
 *   clientCompanyName: 'Jean Dupont',
 *   clientPhone: '0709123456',
 *   clientEmail: 'jean@email.com'
 * });
 *
 * // Ajouter des articles
 * invoice.addItem(new InvoiceItem({
 *   description: 'Laptop HP',
 *   quantity: 1,
 *   amount: 650000,
 *   taxes: [Constants.TAX_TVA]
 * }));
 *
 * // Signer la facture
 * const response = await client.invoices().signInvoice(invoice);
 * console.log('Référence:', response.getReference());
 * console.log('QR Code:', response.getQrCodeUrl());
 * ```
 *
 * @packageDocumentation
 */

// Client principal
export { FneClient } from './FneClient.js';

// Modèles
export { Invoice } from './models/Invoice.js';
export { InvoiceItem } from './models/InvoiceItem.js';
export { CustomTax } from './models/CustomTax.js';
export { RefundRequest } from './models/RefundRequest.js';
export { ApiResponse } from './models/ApiResponse.js';

// Services
export { InvoiceService } from './services/InvoiceService.js';
export { RefundService } from './services/RefundService.js';
export { PurchaseService } from './services/PurchaseService.js';

// Exceptions
export { FneError } from './exceptions/FneError.js';
export { ValidationError } from './exceptions/ValidationError.js';
export { ApiError } from './exceptions/ApiError.js';
export { AuthenticationError } from './exceptions/AuthenticationError.js';
export { NetworkError } from './exceptions/NetworkError.js';

// Validateurs
export { BaseValidator } from './validators/BaseValidator.js';
export { InvoiceValidator } from './validators/InvoiceValidator.js';

// HTTP
export { HttpClient } from './http/HttpClient.js';
export { Response } from './http/Response.js';

// Auth
export { TokenManager } from './auth/TokenManager.js';

// Utilitaires
export * from './utils/helpers.js';
export { Constants } from './utils/constants.js';
export * from './utils/constants.js';

// Types
export type {
  InvoiceType,
  PaymentMethod,
  Template,
  TaxType,
  Currency,
  FneClientConfig,
  HttpClientConfig,
  InvoiceOptions,
  InvoiceItemOptions,
  CustomTaxData,
  RefundItemData,
  ApiResponseData,
  HttpResponseData,
  InvoiceItemSerialized,
  InvoiceSerialized,
  ValidationErrors,
  ErrorContext,
} from './types/index.js';
