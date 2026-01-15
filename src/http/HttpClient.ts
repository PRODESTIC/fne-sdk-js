import { Response } from './Response.js';
import { ApiError } from '../exceptions/ApiError.js';
import { AuthenticationError } from '../exceptions/AuthenticationError.js';
import { NetworkError } from '../exceptions/NetworkError.js';
import {
  DEFAULT_TIMEOUT,
  DEFAULT_RETRY_ATTEMPTS,
  SDK_USER_AGENT,
} from '../utils/constants.js';
import { sleep } from '../utils/helpers.js';
import type { HttpClientConfig } from '../types/index.js';

/**
 * Client HTTP avec retry automatique pour les requêtes FNE
 */
export class HttpClient {
  private readonly baseUrl: string;
  private apiKey?: string;
  private readonly timeout: number;
  private readonly retryAttempts: number;

  constructor(config: HttpClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Supprimer le slash final
    this.apiKey = config.apiKey;
    this.timeout = config.timeout ?? DEFAULT_TIMEOUT;
    this.retryAttempts = config.retryAttempts ?? DEFAULT_RETRY_ATTEMPTS;
  }

  /**
   * Définir la clé API
   */
  public setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Effectuer une requête POST
   */
  public async post(
    endpoint: string,
    data: Record<string, unknown> = {}
  ): Promise<Response> {
    return this.request('POST', endpoint, data);
  }

  /**
   * Effectuer une requête GET
   */
  public async get(
    endpoint: string,
    params: Record<string, string> = {}
  ): Promise<Response> {
    let url = endpoint;
    const queryParams = new URLSearchParams(params).toString();
    if (queryParams) {
      url += `?${queryParams}`;
    }
    return this.request('GET', url);
  }

  /**
   * Effectuer une requête HTTP avec retry
   */
  private async request(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    data?: Record<string, unknown>
  ): Promise<Response> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.buildHeaders();

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await this.executeRequest(url, method, headers, data);
        return this.handleResponse(response);
      } catch (error) {
        lastError = error as Error;

        // Ne pas retry si c'est une erreur d'authentification ou une erreur client
        if (
          error instanceof AuthenticationError ||
          (error instanceof ApiError && error.isClientError())
        ) {
          throw error;
        }

        // Retry uniquement pour les erreurs réseau ou serveur
        if (attempt < this.retryAttempts) {
          const delay = Math.pow(2, attempt - 1) * 1000; // Backoff exponentiel
          await sleep(delay);
        }
      }
    }

    // Toutes les tentatives ont échoué
    if (lastError instanceof NetworkError || lastError instanceof ApiError) {
      throw lastError;
    }

    throw NetworkError.connectionFailed(lastError ?? undefined);
  }

  /**
   * Exécuter la requête HTTP
   */
  private async executeRequest(
    url: string,
    method: string,
    headers: Record<string, string>,
    data?: Record<string, unknown>
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const fetchOptions: RequestInit = {
        method,
        headers,
        signal: controller.signal,
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        fetchOptions.body = JSON.stringify(data);
      }

      const fetchResponse = await fetch(url, fetchOptions);
      return await Response.fromFetchResponse(fetchResponse);
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw NetworkError.timeout(this.timeout);
      }
      throw NetworkError.fromError(error as Error);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Construire les headers de la requête
   */
  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'User-Agent': SDK_USER_AGENT,
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }

  /**
   * Gérer la réponse HTTP
   */
  private handleResponse(response: Response): Response {
    // Succès
    if (response.isSuccess()) {
      return response;
    }

    // Erreur d'authentification
    if (response.getStatusCode() === 401) {
      throw AuthenticationError.unauthorized();
    }

    // Erreur client ou serveur
    const jsonBody = response.json();
    throw ApiError.fromResponse(response.getStatusCode(), jsonBody ?? undefined);
  }
}
