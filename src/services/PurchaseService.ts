import { HttpClient } from '../http/HttpClient.js';
import { Invoice } from '../models/Invoice.js';
import { InvoiceItem } from '../models/InvoiceItem.js';
import { ApiResponse } from '../models/ApiResponse.js';
import { InvoiceValidator } from '../validators/InvoiceValidator.js';
import { ValidationError } from '../exceptions/ValidationError.js';
import { ENDPOINT_SIGN_INVOICE } from '../utils/constants.js';
import type { PaymentMethod, Template } from '../types/index.js';
import {
  INVOICE_TYPE_PURCHASE,
  PAYMENT_CASH,
  PAYMENT_MOBILE_MONEY,
  TEMPLATE_B2C,
  TEMPLATE_B2B,
} from '../utils/constants.js';

/**
 * Service pour la gestion des factures d'achat (achats agricoles)
 */
export class PurchaseService {
  private readonly httpClient: HttpClient;
  private readonly validator: InvoiceValidator;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
    this.validator = new InvoiceValidator();
  }

  /**
   * Signer une facture d'achat
   */
  public async signPurchaseInvoice(invoice: Invoice): Promise<ApiResponse> {
    // Vérifier que c'est bien une facture d'achat
    if (!invoice.isPurchase()) {
      throw ValidationError.forField(
        'invoiceType',
        "Cette méthode est réservée aux factures d'achat (type: purchase)"
      );
    }

    // Valider la facture
    this.validator.validate(invoice);

    // Envoyer à l'API
    const response = await this.httpClient.post(
      ENDPOINT_SIGN_INVOICE,
      invoice.toArray() as unknown as Record<string, unknown>
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
   * Créer une facture d'achat de base
   */
  public createPurchaseInvoice(
    pointOfSale: string,
    establishment: string,
    supplierName: string,
    supplierPhone: string,
    supplierEmail: string,
    paymentMethod: PaymentMethod = PAYMENT_CASH,
    template: Template = TEMPLATE_B2C
  ): Invoice {
    return new Invoice({
      invoiceType: INVOICE_TYPE_PURCHASE,
      paymentMethod,
      template,
      pointOfSale,
      establishment,
      clientCompanyName: supplierName,
      clientPhone: supplierPhone,
      clientEmail: supplierEmail,
    });
  }

  /**
   * Créer une facture d'achat B2B (avec NCC fournisseur)
   */
  public createB2BPurchaseInvoice(
    pointOfSale: string,
    establishment: string,
    supplierName: string,
    supplierPhone: string,
    supplierEmail: string,
    supplierNcc: string,
    paymentMethod: PaymentMethod = PAYMENT_CASH
  ): Invoice {
    return new Invoice({
      invoiceType: INVOICE_TYPE_PURCHASE,
      paymentMethod,
      template: TEMPLATE_B2B,
      pointOfSale,
      establishment,
      clientCompanyName: supplierName,
      clientPhone: supplierPhone,
      clientEmail: supplierEmail,
      clientNcc: supplierNcc,
    });
  }

  /**
   * Créer une facture d'achat coopérative (achat agricole)
   */
  public createCooperativePurchase(
    pointOfSale: string,
    establishment: string,
    cooperativeName: string,
    cooperativePhone: string,
    cooperativeEmail: string,
    paymentMethod: PaymentMethod = PAYMENT_MOBILE_MONEY
  ): Invoice {
    return new Invoice({
      invoiceType: INVOICE_TYPE_PURCHASE,
      paymentMethod,
      template: TEMPLATE_B2C,
      pointOfSale,
      establishment,
      clientCompanyName: cooperativeName,
      clientPhone: cooperativePhone,
      clientEmail: cooperativeEmail,
    });
  }

  /**
   * Créer un article d'achat (sans taxes, avec unité de mesure optionnelle)
   */
  public createPurchaseItem(
    description: string,
    quantity: number,
    amount: number,
    measurementUnit?: string
  ): InvoiceItem {
    const item = new InvoiceItem({
      description,
      quantity,
      amount,
      taxes: [], // Pas de taxes pour les achats
    });

    if (measurementUnit) {
      item.setMeasurementUnit(measurementUnit);
    }

    return item;
  }
}
