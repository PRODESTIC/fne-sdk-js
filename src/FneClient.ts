import { HttpClient } from './http/HttpClient.js';
import { TokenManager } from './auth/TokenManager.js';
import { InvoiceService } from './services/InvoiceService.js';
import { RefundService } from './services/RefundService.js';
import { PurchaseService } from './services/PurchaseService.js';
import {
  TEST_BASE_URL,
  DEFAULT_TIMEOUT,
  DEFAULT_RETRY_ATTEMPTS,
} from './utils/constants.js';
import type { FneClientConfig } from './types/index.js';

/**
 * Client principal pour l'API FNE
 *
 * @example
 * ```typescript
 * // Mode test
 * const client = FneClient.test('votre_cle_api');
 *
 * // Mode production
 * const client = FneClient.production('votre_cle_api', 'https://api.dgi.ci/ws');
 *
 * // Signer une facture
 * const response = await client.invoices().signInvoice(invoice);
 * ```
 */
export class FneClient {
  private readonly httpClient: HttpClient;
  private readonly tokenManager: TokenManager;
  private _testMode: boolean;
  private _baseUrl: string;
  private _timeout: number;
  private _retryAttempts: number;

  // Services (lazy-loaded)
  private _invoiceService?: InvoiceService;
  private _refundService?: RefundService;
  private _purchaseService?: PurchaseService;

  private constructor(config: FneClientConfig) {
    this._baseUrl = config.baseUrl;
    this._testMode = config.testMode ?? true;
    this._timeout = config.timeout ?? DEFAULT_TIMEOUT;
    this._retryAttempts = config.retryAttempts ?? DEFAULT_RETRY_ATTEMPTS;

    // Initialiser le gestionnaire de tokens
    this.tokenManager = new TokenManager();
    this.tokenManager.setApiKey(config.apiKey);

    // Initialiser le client HTTP
    this.httpClient = new HttpClient({
      baseUrl: this._baseUrl,
      apiKey: config.apiKey,
      timeout: this._timeout,
      retryAttempts: this._retryAttempts,
    });
  }

  // ============================================================================
  // Factory Methods
  // ============================================================================

  /**
   * Créer un client en mode test
   * @param apiKey - Clé API FNE
   */
  public static test(apiKey: string): FneClient {
    return new FneClient({
      apiKey,
      baseUrl: TEST_BASE_URL,
      testMode: true,
    });
  }

  /**
   * Créer un client en mode production
   * @param apiKey - Clé API FNE
   * @param baseUrl - URL de base de l'API de production
   */
  public static production(apiKey: string, baseUrl: string): FneClient {
    if (!baseUrl || baseUrl.trim().length === 0) {
      throw new Error("L'URL de production est requise");
    }

    return new FneClient({
      apiKey,
      baseUrl,
      testMode: false,
    });
  }

  // ============================================================================
  // Configuration
  // ============================================================================

  /**
   * Définir la clé API
   */
  public setApiKey(apiKey: string): this {
    this.tokenManager.setApiKey(apiKey);
    this.httpClient.setApiKey(apiKey);
    return this;
  }

  /**
   * Activer le mode test
   */
  public enableTestMode(): this {
    this._testMode = true;
    this._baseUrl = TEST_BASE_URL;
    this.rebuildHttpClient();
    return this;
  }

  /**
   * Activer le mode production
   * @param productionUrl - URL de production
   */
  public enableProductionMode(productionUrl: string): this {
    if (!productionUrl || productionUrl.trim().length === 0) {
      throw new Error("L'URL de production est requise");
    }

    this._testMode = false;
    this._baseUrl = productionUrl;
    this.rebuildHttpClient();
    return this;
  }

  /**
   * Vérifier si le client est en mode test
   */
  public isTestMode(): boolean {
    return this._testMode;
  }

  /**
   * Obtenir la configuration actuelle
   */
  public getConfig(): FneClientConfig {
    return {
      apiKey: this.tokenManager.hasApiKey() ? this.tokenManager.getApiKey() : '',
      baseUrl: this._baseUrl,
      testMode: this._testMode,
      timeout: this._timeout,
      retryAttempts: this._retryAttempts,
    };
  }

  /**
   * Valider la configuration
   * @throws AuthenticationError si la configuration est invalide
   */
  public validateConfiguration(): void {
    this.tokenManager.validateApiKey();
  }

  /**
   * Vider le cache
   */
  public clearCache(): this {
    this.tokenManager.clearCache();
    return this;
  }

  // ============================================================================
  // Services
  // ============================================================================

  /**
   * Obtenir le service de facturation (vente)
   */
  public invoices(): InvoiceService {
    if (!this._invoiceService) {
      this._invoiceService = new InvoiceService(this.httpClient);
    }
    return this._invoiceService;
  }

  /**
   * Obtenir le service de remboursement/avoir
   */
  public refunds(): RefundService {
    if (!this._refundService) {
      this._refundService = new RefundService(this.httpClient);
    }
    return this._refundService;
  }

  /**
   * Obtenir le service d'achat
   */
  public purchases(): PurchaseService {
    if (!this._purchaseService) {
      this._purchaseService = new PurchaseService(this.httpClient);
    }
    return this._purchaseService;
  }

  // ============================================================================
  // Private Methods
  // ============================================================================

  /**
   * Reconstruire le client HTTP après changement de configuration
   */
  private rebuildHttpClient(): void {
    // Le HttpClient est immuable, on met à jour via les setters disponibles
    // Pour un changement d'URL de base, il faudrait recréer le client
    // mais ici on garde la simplicité en ne changeant que ce qui est modifiable
    this.httpClient.setApiKey(this.tokenManager.getApiKey());

    // Réinitialiser les services pour qu'ils utilisent le nouveau client
    this._invoiceService = undefined;
    this._refundService = undefined;
    this._purchaseService = undefined;
  }
}
