import type { ApiResponseData } from '../types/index.js';

/**
 * Réponse de l'API FNE après signature d'une facture
 */
export class ApiResponse {
  private readonly _ncc: string;
  private readonly _reference: string;
  private readonly _token: string;
  private readonly _warning: boolean;
  private readonly _balanceSticker: number;
  private readonly _invoice: Record<string, unknown>;
  private readonly _statusCode: number;

  constructor(data: ApiResponseData) {
    this._ncc = data.ncc ?? '';
    this._reference = data.reference ?? '';
    this._token = data.token ?? '';
    this._warning = data.warning ?? false;
    this._balanceSticker = data.balance_sticker ?? 0;
    this._invoice = data.invoice ?? {};
    this._statusCode = data.statusCode ?? 200;
  }

  /**
   * Créer une ApiResponse à partir d'un objet JSON
   */
  public static fromJSON(json: Record<string, unknown>): ApiResponse {
    return new ApiResponse({
      ncc: (json['ncc'] as string) ?? '',
      reference: (json['reference'] as string) ?? '',
      token: (json['token'] as string) ?? '',
      warning: (json['warning'] as boolean) ?? false,
      balance_sticker: (json['balance_sticker'] as number) ?? 0,
      invoice: (json['invoice'] as Record<string, unknown>) ?? {},
      statusCode: (json['statusCode'] as number) ?? 200,
    });
  }

  // ============================================================================
  // Getters
  // ============================================================================

  /**
   * Obtenir le NCC (Numéro de Compte Contribuable)
   */
  public getNcc(): string {
    return this._ncc;
  }

  /**
   * Obtenir la référence de la facture
   */
  public getReference(): string {
    return this._reference;
  }

  /**
   * Obtenir le token/URL du QR code
   */
  public getToken(): string {
    return this._token;
  }

  /**
   * Alias pour getToken - Obtenir l'URL du QR code de vérification
   */
  public getQrCodeUrl(): string {
    return this._token;
  }

  /**
   * Vérifier s'il y a un avertissement (solde stickers faible)
   */
  public hasWarning(): boolean {
    return this._warning;
  }

  /**
   * Obtenir le solde de stickers restant
   */
  public getBalanceSticker(): number {
    return this._balanceSticker;
  }

  /**
   * Obtenir les données complètes de la facture
   */
  public getInvoice(): Record<string, unknown> {
    return { ...this._invoice };
  }

  /**
   * Obtenir le code de statut HTTP
   */
  public getStatusCode(): number {
    return this._statusCode;
  }

  /**
   * Vérifier si la réponse est un succès
   */
  public isSuccess(): boolean {
    return this._statusCode >= 200 && this._statusCode < 300;
  }

  /**
   * Vérifier si le solde de stickers est faible
   */
  public isBalanceLow(threshold: number = 100): boolean {
    return this._balanceSticker < threshold;
  }

  // ============================================================================
  // Sérialisation
  // ============================================================================

  /**
   * Convertir en objet
   */
  public toJSON(): ApiResponseData {
    return {
      ncc: this._ncc,
      reference: this._reference,
      token: this._token,
      warning: this._warning,
      balance_sticker: this._balanceSticker,
      invoice: this._invoice,
      statusCode: this._statusCode,
    };
  }
}
