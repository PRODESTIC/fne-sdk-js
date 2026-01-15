/**
 * Types et interfaces pour le SDK FNE
 */

// ============================================================================
// Types de base (union types pour type-safety)
// ============================================================================

export type InvoiceType = 'sale' | 'purchase';

export type PaymentMethod =
  | 'cash'
  | 'card'
  | 'check'
  | 'mobile-money'
  | 'transfer'
  | 'deferred';

export type Template = 'B2B' | 'B2C' | 'B2F' | 'B2G';

export type TaxType = 'TVA' | 'TVAB' | 'TVAC' | 'TVAD';

export type Currency =
  | 'XOF'
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'JPY'
  | 'CAD'
  | 'AUD'
  | 'CNH'
  | 'CHF'
  | 'HKD'
  | 'NZD';

// ============================================================================
// Interfaces de configuration
// ============================================================================

export interface FneClientConfig {
  apiKey: string;
  baseUrl: string;
  timeout?: number;
  retryAttempts?: number;
  testMode?: boolean;
}

export interface HttpClientConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
  retryAttempts?: number;
}

// ============================================================================
// Interfaces des modèles
// ============================================================================

export interface InvoiceOptions {
  invoiceType: InvoiceType;
  paymentMethod: PaymentMethod;
  template: Template;
  pointOfSale: string;
  establishment: string;
  clientCompanyName: string;
  clientPhone: string;
  clientEmail: string;
  clientNcc?: string | null;
  clientSellerName?: string | null;
  commercialMessage?: string | null;
  footer?: string | null;
  foreignCurrency?: Currency | null;
  foreignCurrencyRate?: number;
  isRne?: boolean;
  rne?: string | null;
  discount?: number;
}

export interface InvoiceItemOptions {
  description: string;
  quantity: number;
  amount: number;
  taxes: TaxType[];
  reference?: string | null;
  discount?: number;
  measurementUnit?: string | null;
}

export interface CustomTaxData {
  name: string;
  amount: number;
}

export interface RefundItemData {
  id: string;
  quantity: number;
}

// ============================================================================
// Interfaces de réponse API
// ============================================================================

export interface ApiResponseData {
  ncc: string;
  reference: string;
  token: string;
  warning: boolean;
  balance_sticker: number;
  invoice: Record<string, unknown>;
  statusCode?: number;
}

export interface HttpResponseData {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

// ============================================================================
// Interfaces de sérialisation
// ============================================================================

export interface InvoiceItemSerialized {
  description: string;
  quantity: number;
  amount: number;
  taxes: TaxType[];
  reference?: string;
  discount?: number;
  measurementUnit?: string;
  customTaxes?: CustomTaxData[];
}

export interface InvoiceSerialized {
  invoiceType: InvoiceType;
  paymentMethod: PaymentMethod;
  template: Template;
  pointOfSale: string;
  establishment: string;
  clientCompanyName: string;
  clientPhone: string;
  clientEmail: string;
  clientNcc?: string;
  clientSellerName?: string;
  commercialMessage?: string;
  footer?: string;
  foreignCurrency?: Currency | string;
  foreignCurrencyRate?: number;
  isRne: boolean;
  rne?: string;
  discount?: number;
  items: InvoiceItemSerialized[];
  customTaxes?: CustomTaxData[];
}

// ============================================================================
// Interfaces d'erreur
// ============================================================================

export interface ValidationErrors {
  [field: string]: string;
}

export interface ErrorContext {
  [key: string]: unknown;
}
