import { HttpClient } from '../http/HttpClient.js';
import { RefundRequest } from '../models/RefundRequest.js';
import { ApiResponse } from '../models/ApiResponse.js';
import { ValidationError } from '../exceptions/ValidationError.js';
import { ENDPOINT_REFUND_INVOICE } from '../utils/constants.js';

/**
 * Interface pour les articles de la facture originale
 */
interface OriginalInvoiceItem {
  id: string;
  quantity: number;
}

/**
 * Service pour la gestion des avoirs/remboursements
 */
export class RefundService {
  private readonly httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  /**
   * Créer un avoir/remboursement
   * @param originalInvoiceId - ID de la facture originale
   * @param refundRequest - Demande de remboursement
   */
  public async createRefund(
    originalInvoiceId: string,
    refundRequest: RefundRequest
  ): Promise<ApiResponse> {
    // Valider la demande
    this.validateRefundRequest(refundRequest);

    // Construire l'endpoint
    const endpoint = ENDPOINT_REFUND_INVOICE.replace('{id}', originalInvoiceId);

    // Envoyer à l'API
    const response = await this.httpClient.post(
      endpoint,
      refundRequest.toArray() as unknown as Record<string, unknown>
    );

    // Parser la réponse
    const json = response.json();
    if (!json) {
      throw new Error('Réponse API invalide');
    }

    return ApiResponse.fromJSON({
      ...json,
      statusCode: response.getStatusCode(),
    });
  }

  /**
   * Créer une nouvelle demande de remboursement
   */
  public createRefundRequest(): RefundRequest {
    return new RefundRequest();
  }

  /**
   * Créer un remboursement complet (tous les articles)
   * @param originalInvoiceId - ID de la facture originale
   * @param originalInvoiceItems - Articles de la facture originale avec leurs quantités
   */
  public async createFullRefund(
    originalInvoiceId: string,
    originalInvoiceItems: OriginalInvoiceItem[]
  ): Promise<ApiResponse> {
    const refundRequest = new RefundRequest();

    for (const item of originalInvoiceItems) {
      refundRequest.addItem(item.id, item.quantity);
    }

    return this.createRefund(originalInvoiceId, refundRequest);
  }

  /**
   * Créer un remboursement partiel
   * @param originalInvoiceId - ID de la facture originale
   * @param itemsToRefund - Articles à rembourser (id et quantité)
   */
  public async createPartialRefund(
    originalInvoiceId: string,
    itemsToRefund: OriginalInvoiceItem[]
  ): Promise<ApiResponse> {
    const refundRequest = new RefundRequest();

    for (const item of itemsToRefund) {
      refundRequest.addItem(item.id, item.quantity);
    }

    return this.createRefund(originalInvoiceId, refundRequest);
  }

  /**
   * Valider une demande de remboursement
   */
  private validateRefundRequest(refundRequest: RefundRequest): void {
    if (!refundRequest.hasItems()) {
      throw ValidationError.forField(
        'items',
        'La demande de remboursement doit contenir au moins un article'
      );
    }

    // Valider chaque article
    const items = refundRequest.getItems();
    const errors: Record<string, string> = {};

    items.forEach((item, index) => {
      if (!item.id || item.id.trim().length === 0) {
        errors[`items[${index}].id`] = "L'ID de l'article est requis";
      }

      if (item.quantity <= 0) {
        errors[`items[${index}].quantity`] =
          'La quantité doit être supérieure à 0';
      }
    });

    if (Object.keys(errors).length > 0) {
      throw ValidationError.withErrors(errors);
    }
  }
}
