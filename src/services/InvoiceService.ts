import { HttpClient } from '../http/HttpClient.js';
import { Invoice } from '../models/Invoice.js';
import { InvoiceItem } from '../models/InvoiceItem.js';
import { ApiResponse } from '../models/ApiResponse.js';
import { InvoiceValidator } from '../validators/InvoiceValidator.js';
import { ENDPOINT_SIGN_INVOICE } from '../utils/constants.js';
import type { PaymentMethod, Template, Currency, TaxType } from '../types/index.js';
import {
  INVOICE_TYPE_SALE,
  PAYMENT_CASH,
  PAYMENT_TRANSFER,
  TEMPLATE_B2C,
  TEMPLATE_B2B,
  TEMPLATE_B2F,
  TAX_TVA,
} from '../utils/constants.js';

/**
 * Service pour la gestion des factures de vente
 */
export class InvoiceService {
  private readonly httpClient: HttpClient;
  private readonly validator: InvoiceValidator;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
    this.validator = new InvoiceValidator();
  }

  /**
   * Signer une facture (l'envoyer à l'API FNE)
   */
  public async signInvoice(invoice: Invoice): Promise<ApiResponse> {
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
   * Créer une facture de vente de base
   */
  public createSaleInvoice(
    pointOfSale: string,
    establishment: string,
    clientName: string,
    clientPhone: string,
    clientEmail: string,
    paymentMethod: PaymentMethod = PAYMENT_CASH,
    template: Template = TEMPLATE_B2C
  ): Invoice {
    return new Invoice({
      invoiceType: INVOICE_TYPE_SALE,
      paymentMethod,
      template,
      pointOfSale,
      establishment,
      clientCompanyName: clientName,
      clientPhone,
      clientEmail,
    });
  }

  /**
   * Créer une facture B2B (Business to Business)
   */
  public createB2BInvoice(
    pointOfSale: string,
    establishment: string,
    clientName: string,
    clientPhone: string,
    clientEmail: string,
    clientNcc: string,
    paymentMethod: PaymentMethod = PAYMENT_TRANSFER
  ): Invoice {
    return new Invoice({
      invoiceType: INVOICE_TYPE_SALE,
      paymentMethod,
      template: TEMPLATE_B2B,
      pointOfSale,
      establishment,
      clientCompanyName: clientName,
      clientPhone,
      clientEmail,
      clientNcc,
    });
  }

  /**
   * Créer une facture B2F (Business to Foreign - Export)
   */
  public createB2FInvoice(
    pointOfSale: string,
    establishment: string,
    clientName: string,
    clientPhone: string,
    clientEmail: string,
    foreignCurrency: Currency,
    exchangeRate: number,
    paymentMethod: PaymentMethod = PAYMENT_TRANSFER
  ): Invoice {
    return new Invoice({
      invoiceType: INVOICE_TYPE_SALE,
      paymentMethod,
      template: TEMPLATE_B2F,
      pointOfSale,
      establishment,
      clientCompanyName: clientName,
      clientPhone,
      clientEmail,
      foreignCurrency,
      foreignCurrencyRate: exchangeRate,
    });
  }

  /**
   * Créer une facture à partir d'un RNE (Reçu Normalisé Électronique)
   */
  public createFromRne(
    rneNumber: string,
    pointOfSale: string,
    establishment: string,
    clientName: string,
    clientPhone: string,
    clientEmail: string,
    paymentMethod: PaymentMethod = PAYMENT_CASH
  ): Invoice {
    const invoice = new Invoice({
      invoiceType: INVOICE_TYPE_SALE,
      paymentMethod,
      template: TEMPLATE_B2C,
      pointOfSale,
      establishment,
      clientCompanyName: clientName,
      clientPhone,
      clientEmail,
      isRne: true,
      rne: rneNumber,
    });

    return invoice;
  }

  /**
   * Créer un article simple
   */
  public createItem(
    description: string,
    quantity: number,
    amount: number,
    taxes: TaxType[] = [TAX_TVA]
  ): InvoiceItem {
    return new InvoiceItem({
      description,
      quantity,
      amount,
      taxes,
    });
  }
}
