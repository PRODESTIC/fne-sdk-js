import type { ErrorContext } from '../types/index.js';

/**
 * Classe de base pour toutes les erreurs du SDK FNE
 */
export class FneError extends Error {
  public readonly context: ErrorContext;

  constructor(message: string, context: ErrorContext = {}) {
    super(message);
    this.name = 'FneError';
    this.context = context;

    // Maintenir la stack trace correcte en TypeScript
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Obtenir le contexte de l'erreur
   */
  public getContext(): ErrorContext {
    return this.context;
  }

  /**
   * Ajouter des informations au contexte
   */
  public withContext(additionalContext: ErrorContext): this {
    Object.assign(this.context, additionalContext);
    return this;
  }

  /**
   * Convertir en objet pour la sérialisation
   */
  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      context: this.context,
      stack: this.stack,
    };
  }
}
