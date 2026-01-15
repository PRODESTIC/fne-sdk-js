import type { ValidationErrors } from '../types/index.js';
import { FneError } from './FneError.js';

/**
 * Erreur de validation des données
 * Contient les erreurs par champ pour faciliter l'affichage
 */
export class ValidationError extends FneError {
  private readonly errors: ValidationErrors;

  constructor(message: string, errors: ValidationErrors = {}) {
    super(message, { errors });
    this.name = 'ValidationError';
    this.errors = errors;
  }

  /**
   * Créer une erreur de validation à partir d'un objet d'erreurs
   */
  public static withErrors(errors: ValidationErrors): ValidationError {
    const count = Object.keys(errors).length;
    const message = `Validation échouée: ${count} erreur(s) trouvée(s)`;
    return new ValidationError(message, errors);
  }

  /**
   * Créer une erreur pour un champ spécifique
   */
  public static forField(field: string, message: string): ValidationError {
    return new ValidationError(`Validation échouée pour ${field}: ${message}`, {
      [field]: message,
    });
  }

  /**
   * Obtenir toutes les erreurs
   */
  public getErrors(): ValidationErrors {
    return { ...this.errors };
  }

  /**
   * Vérifier si un champ a une erreur
   */
  public hasError(field: string): boolean {
    return field in this.errors;
  }

  /**
   * Obtenir l'erreur d'un champ spécifique
   */
  public getError(field: string): string | undefined {
    return this.errors[field];
  }

  /**
   * Obtenir la liste des champs en erreur
   */
  public getFieldNames(): string[] {
    return Object.keys(this.errors);
  }

  /**
   * Vérifier s'il y a des erreurs
   */
  public hasErrors(): boolean {
    return Object.keys(this.errors).length > 0;
  }

  /**
   * Obtenir le nombre d'erreurs
   */
  public getErrorCount(): number {
    return Object.keys(this.errors).length;
  }

  public override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      errors: this.errors,
    };
  }
}
