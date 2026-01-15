import { FneError } from './FneError.js';

/**
 * Erreur d'authentification
 */
export class AuthenticationError extends FneError {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }

  /**
   * Créer une erreur pour une clé API invalide
   */
  public static invalidApiKey(): AuthenticationError {
    return new AuthenticationError(
      'Clé API invalide ou manquante. Veuillez vérifier votre clé API.'
    );
  }

  /**
   * Créer une erreur pour une clé API trop courte
   */
  public static apiKeyTooShort(minLength: number): AuthenticationError {
    return new AuthenticationError(
      `La clé API doit contenir au moins ${minLength} caractères.`
    );
  }

  /**
   * Créer une erreur pour un token expiré
   */
  public static tokenExpired(): AuthenticationError {
    return new AuthenticationError(
      'Le token a expiré. Veuillez vous reconnecter.'
    );
  }

  /**
   * Créer une erreur pour une authentification non autorisée
   */
  public static unauthorized(): AuthenticationError {
    return new AuthenticationError(
      "Authentification échouée. Vous n'êtes pas autorisé à accéder à cette ressource."
    );
  }

  /**
   * Créer une erreur pour une clé API manquante
   */
  public static missingApiKey(): AuthenticationError {
    return new AuthenticationError(
      "Aucune clé API fournie. Veuillez configurer votre clé API avant d'effectuer des requêtes."
    );
  }
}
