/**
 * Wrapper pour les réponses HTTP
 */
export class Response {
  private readonly _statusCode: number;
  private readonly _headers: Map<string, string>;
  private readonly _body: string;
  private _parsedJson: unknown | null = null;
  private _jsonParsed = false;

  constructor(statusCode: number, headers: Headers | Map<string, string>, body: string) {
    this._statusCode = statusCode;
    this._body = body;

    // Convertir les headers en Map
    if (headers instanceof Headers) {
      this._headers = new Map();
      headers.forEach((value, key) => {
        this._headers.set(key.toLowerCase(), value);
      });
    } else {
      this._headers = new Map(
        Array.from(headers.entries()).map(([k, v]) => [k.toLowerCase(), v])
      );
    }
  }

  /**
   * Créer une Response à partir d'une fetch Response
   */
  public static async fromFetchResponse(
    fetchResponse: globalThis.Response
  ): Promise<Response> {
    const body = await fetchResponse.text();
    return new Response(fetchResponse.status, fetchResponse.headers, body);
  }

  /**
   * Obtenir le code de statut HTTP
   */
  public getStatusCode(): number {
    return this._statusCode;
  }

  /**
   * Obtenir tous les headers
   */
  public getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {};
    this._headers.forEach((value, key) => {
      headers[key] = value;
    });
    return headers;
  }

  /**
   * Obtenir un header spécifique
   */
  public getHeader(name: string): string | undefined {
    return this._headers.get(name.toLowerCase());
  }

  /**
   * Obtenir le corps brut de la réponse
   */
  public getBody(): string {
    return this._body;
  }

  /**
   * Parser et obtenir le corps JSON
   * @returns Le corps parsé en JSON ou null si le parsing échoue
   */
  public json<T = Record<string, unknown>>(): T | null {
    if (!this._jsonParsed) {
      try {
        this._parsedJson = JSON.parse(this._body);
      } catch {
        this._parsedJson = null;
      }
      this._jsonParsed = true;
    }
    return this._parsedJson as T | null;
  }

  /**
   * Vérifier si la réponse est un succès (2xx)
   */
  public isSuccess(): boolean {
    return this._statusCode >= 200 && this._statusCode < 300;
  }

  /**
   * Vérifier si c'est une erreur client (4xx)
   */
  public isClientError(): boolean {
    return this._statusCode >= 400 && this._statusCode < 500;
  }

  /**
   * Vérifier si c'est une erreur serveur (5xx)
   */
  public isServerError(): boolean {
    return this._statusCode >= 500;
  }

  /**
   * Vérifier si la réponse est une redirection (3xx)
   */
  public isRedirect(): boolean {
    return this._statusCode >= 300 && this._statusCode < 400;
  }

  /**
   * Obtenir le Content-Type de la réponse
   */
  public getContentType(): string | undefined {
    return this.getHeader('content-type');
  }

  /**
   * Vérifier si la réponse est du JSON
   */
  public isJson(): boolean {
    const contentType = this.getContentType();
    return contentType?.includes('application/json') ?? false;
  }
}
