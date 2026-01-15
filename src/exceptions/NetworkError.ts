import { FneError } from './FneError.js';

/**
 * Erreur de réseau (connexion, timeout, DNS, etc.)
 */
export class NetworkError extends FneError {
  public readonly originalError?: Error;

  constructor(message: string, originalError?: Error) {
    super(message, { originalError: originalError?.message });
    this.name = 'NetworkError';
    this.originalError = originalError;
  }

  /**
   * Créer une erreur de connexion échouée
   */
  public static connectionFailed(originalError?: Error): NetworkError {
    return new NetworkError(
      "Impossible de se connecter au serveur FNE. Veuillez vérifier votre connexion internet.",
      originalError
    );
  }

  /**
   * Créer une erreur de timeout
   */
  public static timeout(timeoutMs?: number): NetworkError {
    const message = timeoutMs
      ? `La requête a expiré après ${timeoutMs}ms. Le serveur ne répond pas.`
      : 'La requête a expiré. Le serveur ne répond pas.';
    return new NetworkError(message);
  }

  /**
   * Créer une erreur de résolution DNS
   */
  public static dnsResolution(host?: string): NetworkError {
    const message = host
      ? `Impossible de résoudre l'adresse du serveur: ${host}`
      : "Impossible de résoudre l'adresse du serveur.";
    return new NetworkError(message);
  }

  /**
   * Créer une erreur de connexion refusée
   */
  public static connectionRefused(host?: string): NetworkError {
    const message = host
      ? `Connexion refusée par le serveur: ${host}`
      : 'Connexion refusée par le serveur.';
    return new NetworkError(message);
  }

  /**
   * Créer une erreur de connexion réinitialisée
   */
  public static connectionReset(): NetworkError {
    return new NetworkError(
      'La connexion a été réinitialisée par le serveur.'
    );
  }

  /**
   * Créer une erreur SSL/TLS
   */
  public static sslError(originalError?: Error): NetworkError {
    return new NetworkError(
      'Erreur de certificat SSL/TLS. La connexion sécurisée a échoué.',
      originalError
    );
  }

  /**
   * Créer une erreur générique de réseau
   */
  public static fromError(error: Error): NetworkError {
    // Détecter le type d'erreur réseau
    const message = error.message.toLowerCase();

    if (message.includes('timeout') || message.includes('timed out')) {
      return NetworkError.timeout();
    }

    if (message.includes('enotfound') || message.includes('dns')) {
      return NetworkError.dnsResolution();
    }

    if (message.includes('econnrefused')) {
      return NetworkError.connectionRefused();
    }

    if (message.includes('econnreset')) {
      return NetworkError.connectionReset();
    }

    if (
      message.includes('ssl') ||
      message.includes('certificate') ||
      message.includes('tls')
    ) {
      return NetworkError.sslError(error);
    }

    return NetworkError.connectionFailed(error);
  }

  public override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      originalError: this.originalError?.message,
    };
  }
}
