import type { ValidationErrors } from '../types/index.js';
import { ValidationError } from '../exceptions/ValidationError.js';
import { isValidEmail, isValidPhone, isValidNcc } from '../utils/helpers.js';

/**
 * Classe de base pour les validateurs
 */
export abstract class BaseValidator {
  protected errors: ValidationErrors = {};

  /**
   * Ajouter une erreur
   */
  protected addError(field: string, message: string): void {
    this.errors[field] = message;
  }

  /**
   * Valider qu'un champ est requis
   */
  protected validateRequired(
    field: string,
    value: unknown,
    fieldName?: string
  ): boolean {
    const displayName = fieldName ?? field;

    if (value === null || value === undefined) {
      this.addError(field, `Le champ ${displayName} est requis`);
      return false;
    }

    if (typeof value === 'string' && value.trim().length === 0) {
      this.addError(field, `Le champ ${displayName} est requis`);
      return false;
    }

    return true;
  }

  /**
   * Valider un email
   */
  protected validateEmail(field: string, email: string): boolean {
    if (!isValidEmail(email)) {
      this.addError(field, "L'adresse email n'est pas valide");
      return false;
    }
    return true;
  }

  /**
   * Valider un numéro de téléphone
   */
  protected validatePhone(field: string, phone: string): boolean {
    if (!isValidPhone(phone)) {
      this.addError(
        field,
        "Le numéro de téléphone n'est pas valide (format: 8-10 chiffres)"
      );
      return false;
    }
    return true;
  }

  /**
   * Valider un NCC
   */
  protected validateNcc(field: string, ncc: string): boolean {
    if (!isValidNcc(ncc)) {
      this.addError(
        field,
        "Le NCC n'est pas valide (format: 7 chiffres + 1 lettre majuscule)"
      );
      return false;
    }
    return true;
  }

  /**
   * Valider qu'une valeur est dans un tableau de valeurs autorisées
   */
  protected validateInArray<T>(
    field: string,
    value: T,
    allowedValues: readonly T[],
    fieldName?: string
  ): boolean {
    const displayName = fieldName ?? field;

    if (!allowedValues.includes(value)) {
      const allowed = allowedValues.join(', ');
      this.addError(
        field,
        `La valeur de ${displayName} doit être parmi: ${allowed}`
      );
      return false;
    }
    return true;
  }

  /**
   * Valider qu'un nombre est positif
   */
  protected validatePositiveNumber(
    field: string,
    value: number,
    fieldName?: string
  ): boolean {
    const displayName = fieldName ?? field;

    if (typeof value !== 'number' || isNaN(value) || value <= 0) {
      this.addError(field, `Le champ ${displayName} doit être un nombre positif`);
      return false;
    }
    return true;
  }

  /**
   * Valider qu'un pourcentage est entre 0 et 100
   */
  protected validatePercentage(
    field: string,
    value: number,
    fieldName?: string
  ): boolean {
    const displayName = fieldName ?? field;

    if (typeof value !== 'number' || isNaN(value) || value < 0 || value > 100) {
      this.addError(field, `Le champ ${displayName} doit être entre 0 et 100`);
      return false;
    }
    return true;
  }

  /**
   * Lancer une exception si des erreurs existent
   */
  protected throwIfErrors(): void {
    if (this.hasErrors()) {
      throw ValidationError.withErrors(this.errors);
    }
  }

  /**
   * Obtenir toutes les erreurs
   */
  public getErrors(): ValidationErrors {
    return { ...this.errors };
  }

  /**
   * Vérifier s'il y a des erreurs
   */
  public hasErrors(): boolean {
    return Object.keys(this.errors).length > 0;
  }

  /**
   * Réinitialiser les erreurs
   */
  protected resetErrors(): void {
    this.errors = {};
  }
}
