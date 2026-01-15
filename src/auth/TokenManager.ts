import { AuthenticationError } from '../exceptions/AuthenticationError.js';
import { MIN_API_KEY_LENGTH } from '../utils/constants.js';

/**
 * Gestionnaire de tokens et clés API
 */
export class TokenManager {
  private apiKey?: string;
  private readonly cache: Map<string, { data: unknown; expiresAt: number }> =
    new Map();

  /**
   * Définir la clé API
   */
  public setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Obtenir la clé API
   * @throws AuthenticationError si aucune clé n'est définie
   */
  public getApiKey(): string {
    if (!this.apiKey) {
      throw AuthenticationError.missingApiKey();
    }
    return this.apiKey;
  }

  /**
   * Vérifier si une clé API est définie
   */
  public hasApiKey(): boolean {
    return !!this.apiKey && this.apiKey.length > 0;
  }

  /**
   * Obtenir le token Bearer formaté
   */
  public getBearerToken(): string {
    return `Bearer ${this.getApiKey()}`;
  }

  /**
   * Valider la clé API
   * @throws AuthenticationError si la clé est invalide
   */
  public validateApiKey(): void {
    if (!this.hasApiKey()) {
      throw AuthenticationError.missingApiKey();
    }

    if (this.apiKey!.length < MIN_API_KEY_LENGTH) {
      throw AuthenticationError.apiKeyTooShort(MIN_API_KEY_LENGTH);
    }
  }

  /**
   * Mettre en cache une réponse
   * @param key - Clé de cache
   * @param data - Données à mettre en cache
   * @param ttlSeconds - Durée de vie en secondes (défaut: 1 heure)
   */
  public cacheResponse(
    key: string,
    data: unknown,
    ttlSeconds: number = 3600
  ): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { data, expiresAt });
  }

  /**
   * Obtenir une réponse du cache
   * @param key - Clé de cache
   * @returns Les données cachées ou null si expirées/absentes
   */
  public getCachedResponse<T = unknown>(key: string): T | null {
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    // Vérifier l'expiration
    if (Date.now() > cached.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  /**
   * Invalider tout le cache
   */
  public invalidateCache(): void {
    this.cache.clear();
  }

  /**
   * Effacer une entrée du cache
   * @param key - Clé à effacer (si null, efface tout)
   */
  public clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Nettoyer les entrées expirées du cache
   */
  public cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now > value.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Obtenir le nombre d'entrées en cache
   */
  public getCacheSize(): number {
    return this.cache.size;
  }
}
