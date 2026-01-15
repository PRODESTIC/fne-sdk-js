/**
 * Constantes du SDK FNE
 * Identiques aux constantes du SDK PHP pour assurer la compatibilité
 */

// ============================================================================
// Types de facture
// ============================================================================

export const INVOICE_TYPE_SALE = 'sale' as const;
export const INVOICE_TYPE_PURCHASE = 'purchase' as const;

export const ALLOWED_INVOICE_TYPES = [
  INVOICE_TYPE_SALE,
  INVOICE_TYPE_PURCHASE,
] as const;

// ============================================================================
// Méthodes de paiement
// ============================================================================

export const PAYMENT_CASH = 'cash' as const;
export const PAYMENT_CARD = 'card' as const;
export const PAYMENT_CHECK = 'check' as const;
export const PAYMENT_MOBILE_MONEY = 'mobile-money' as const;
export const PAYMENT_TRANSFER = 'transfer' as const;
export const PAYMENT_DEFERRED = 'deferred' as const;

export const ALLOWED_PAYMENT_METHODS = [
  PAYMENT_CASH,
  PAYMENT_CARD,
  PAYMENT_CHECK,
  PAYMENT_MOBILE_MONEY,
  PAYMENT_TRANSFER,
  PAYMENT_DEFERRED,
] as const;

// ============================================================================
// Templates de facture
// ============================================================================

export const TEMPLATE_B2B = 'B2B' as const;
export const TEMPLATE_B2C = 'B2C' as const;
export const TEMPLATE_B2F = 'B2F' as const;
export const TEMPLATE_B2G = 'B2G' as const;

export const ALLOWED_TEMPLATES = [
  TEMPLATE_B2B,
  TEMPLATE_B2C,
  TEMPLATE_B2F,
  TEMPLATE_B2G,
] as const;

// ============================================================================
// Types de taxes
// ============================================================================

export const TAX_TVA = 'TVA' as const;    // 18%
export const TAX_TVAB = 'TVAB' as const;  // 9%
export const TAX_TVAC = 'TVAC' as const;  // 0% - Exonération conventionnelle
export const TAX_TVAD = 'TVAD' as const;  // 0% - Exonération légale

export const ALLOWED_TAX_TYPES = [
  TAX_TVA,
  TAX_TVAB,
  TAX_TVAC,
  TAX_TVAD,
] as const;

// Taux de TVA correspondants
export const TAX_RATES: Record<string, number> = {
  [TAX_TVA]: 18,
  [TAX_TVAB]: 9,
  [TAX_TVAC]: 0,
  [TAX_TVAD]: 0,
};

// ============================================================================
// Devises supportées
// ============================================================================

export const CURRENCY_XOF = 'XOF' as const;
export const CURRENCY_USD = 'USD' as const;
export const CURRENCY_EUR = 'EUR' as const;
export const CURRENCY_GBP = 'GBP' as const;
export const CURRENCY_JPY = 'JPY' as const;
export const CURRENCY_CAD = 'CAD' as const;
export const CURRENCY_AUD = 'AUD' as const;
export const CURRENCY_CNH = 'CNH' as const;
export const CURRENCY_CHF = 'CHF' as const;
export const CURRENCY_HKD = 'HKD' as const;
export const CURRENCY_NZD = 'NZD' as const;

export const ALLOWED_CURRENCIES = [
  CURRENCY_XOF,
  CURRENCY_USD,
  CURRENCY_EUR,
  CURRENCY_GBP,
  CURRENCY_JPY,
  CURRENCY_CAD,
  CURRENCY_AUD,
  CURRENCY_CNH,
  CURRENCY_CHF,
  CURRENCY_HKD,
  CURRENCY_NZD,
] as const;

// ============================================================================
// URLs et Endpoints
// ============================================================================

export const TEST_BASE_URL = 'http://54.247.95.108/ws';
export const PROD_BASE_URL = ''; // Fournie par la DGI après validation

export const ENDPOINT_SIGN_INVOICE = '/external/invoices/sign';
export const ENDPOINT_REFUND_INVOICE = '/external/invoices/{id}/refund';

// ============================================================================
// Configuration par défaut
// ============================================================================

export const DEFAULT_TIMEOUT = 30000; // 30 secondes
export const DEFAULT_RETRY_ATTEMPTS = 3;
export const MIN_API_KEY_LENGTH = 20;

// ============================================================================
// Informations SDK
// ============================================================================

export const SDK_NAME = 'FNE-SDK-JS';
export const SDK_VERSION = '1.0.0';
export const SDK_USER_AGENT = `${SDK_NAME}/${SDK_VERSION}`;

// ============================================================================
// Export groupé pour faciliter l'importation
// ============================================================================

export const Constants = {
  // Invoice types
  INVOICE_TYPE_SALE,
  INVOICE_TYPE_PURCHASE,
  ALLOWED_INVOICE_TYPES,

  // Payment methods
  PAYMENT_CASH,
  PAYMENT_CARD,
  PAYMENT_CHECK,
  PAYMENT_MOBILE_MONEY,
  PAYMENT_TRANSFER,
  PAYMENT_DEFERRED,
  ALLOWED_PAYMENT_METHODS,

  // Templates
  TEMPLATE_B2B,
  TEMPLATE_B2C,
  TEMPLATE_B2F,
  TEMPLATE_B2G,
  ALLOWED_TEMPLATES,

  // Tax types
  TAX_TVA,
  TAX_TVAB,
  TAX_TVAC,
  TAX_TVAD,
  ALLOWED_TAX_TYPES,
  TAX_RATES,

  // Currencies
  CURRENCY_XOF,
  CURRENCY_USD,
  CURRENCY_EUR,
  CURRENCY_GBP,
  CURRENCY_JPY,
  CURRENCY_CAD,
  CURRENCY_AUD,
  CURRENCY_CNH,
  CURRENCY_CHF,
  CURRENCY_HKD,
  CURRENCY_NZD,
  ALLOWED_CURRENCIES,

  // URLs and endpoints
  TEST_BASE_URL,
  PROD_BASE_URL,
  ENDPOINT_SIGN_INVOICE,
  ENDPOINT_REFUND_INVOICE,

  // Defaults
  DEFAULT_TIMEOUT,
  DEFAULT_RETRY_ATTEMPTS,
  MIN_API_KEY_LENGTH,

  // SDK info
  SDK_NAME,
  SDK_VERSION,
  SDK_USER_AGENT,
} as const;
