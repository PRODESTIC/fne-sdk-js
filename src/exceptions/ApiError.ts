import type { ErrorContext } from '../types/index.js';
import { FneError } from './FneError.js';

/**
 * Erreur retournée par l'API FNE
 */
export class ApiError extends FneError {
  public readonly statusCode: number;
  public readonly response?: Record<string, unknown>;

  constructor(
    message: string,
    statusCode: number,
    response?: Record<string, unknown>,
    context: ErrorContext = {}
  ) {
    super(message, { ...context, statusCode, response });
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.response = response;
  }

  /**
   * Créer une erreur 400 Bad Request
   */
  public static badRequest(
    message: string,
    response?: Record<string, unknown>
  ): ApiError {
    return new ApiError(message, 400, response);
  }

  /**
   * Créer une erreur 401 Unauthorized
   */
  public static unauthorized(message = 'Non autorisé'): ApiError {
    return new ApiError(message, 401);
  }

  /**
   * Créer une erreur 403 Forbidden
   */
  public static forbidden(message = 'Accès interdit'): ApiError {
    return new ApiError(message, 403);
  }

  /**
   * Créer une erreur 404 Not Found
   */
  public static notFound(message = 'Ressource non trouvée'): ApiError {
    return new ApiError(message, 404);
  }

  /**
   * Créer une erreur 422 Unprocessable Entity
   */
  public static unprocessableEntity(
    message: string,
    response?: Record<string, unknown>
  ): ApiError {
    return new ApiError(message, 422, response);
  }

  /**
   * Créer une erreur 500 Internal Server Error
   */
  public static internalServerError(
    message = 'Erreur interne du serveur'
  ): ApiError {
    return new ApiError(message, 500);
  }

  /**
   * Créer une erreur 503 Service Unavailable
   */
  public static serviceUnavailable(
    message = 'Service temporairement indisponible'
  ): ApiError {
    return new ApiError(message, 503);
  }

  /**
   * Créer une erreur pour un endpoint non disponible
   */
  public static endpointNotAvailable(): ApiError {
    return new ApiError("L'endpoint n'est pas disponible", 503);
  }

  /**
   * Créer une erreur à partir d'une réponse HTTP
   */
  public static fromResponse(
    statusCode: number,
    response?: Record<string, unknown>
  ): ApiError {
    const message =
      (response?.['message'] as string) ||
      (response?.['error'] as string) ||
      `Erreur API: ${statusCode}`;
    return new ApiError(message, statusCode, response);
  }

  /**
   * Vérifier si c'est une erreur client (4xx)
   */
  public isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  /**
   * Vérifier si c'est une erreur serveur (5xx)
   */
  public isServerError(): boolean {
    return this.statusCode >= 500;
  }

  public override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      statusCode: this.statusCode,
      response: this.response,
    };
  }
}
