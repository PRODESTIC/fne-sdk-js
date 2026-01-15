import type {
  InvoiceType,
  PaymentMethod,
  Template,
  Currency,
  InvoiceOptions,
  InvoiceSerialized,
  CustomTaxData,
} from '../types/index.js';
import { InvoiceItem } from './InvoiceItem.js';
import { CustomTax } from './CustomTax.js';

/**
 * Modèle de facture FNE
 */
export class Invoice {
  // Champs requis
  private readonly _invoiceType: InvoiceType;
  private readonly _paymentMethod: PaymentMethod;
  private readonly _template: Template;
  private readonly _pointOfSale: string;
  private readonly _establishment: string;
  private readonly _clientCompanyName: string;
  private readonly _clientPhone: string;
  private readonly _clientEmail: string;

  // Champs optionnels
  private _clientNcc?: string | null;
  private _clientSellerName?: string | null;
  private _commercialMessage?: string | null;
  private _footer?: string | null;
  private _foreignCurrency?: Currency | null;
  private _foreignCurrencyRate: number = 0;
  private _isRne: boolean = false;
  private _rne?: string | null;
  private _discount: number = 0;

  // Collections
  private readonly _items: InvoiceItem[] = [];
  private readonly _customTaxes: CustomTax[] = [];

  constructor(options: InvoiceOptions) {
    // Champs requis
    this._invoiceType = options.invoiceType;
    this._paymentMethod = options.paymentMethod;
    this._template = options.template;
    this._pointOfSale = options.pointOfSale;
    this._establishment = options.establishment;
    this._clientCompanyName = options.clientCompanyName;
    this._clientPhone = options.clientPhone;
    this._clientEmail = options.clientEmail;

    // Champs optionnels
    this._clientNcc = options.clientNcc ?? null;
    this._clientSellerName = options.clientSellerName ?? null;
    this._commercialMessage = options.commercialMessage ?? null;
    this._footer = options.footer ?? null;
    this._foreignCurrency = options.foreignCurrency ?? null;
    this._foreignCurrencyRate = options.foreignCurrencyRate ?? 0;
    this._isRne = options.isRne ?? false;
    this._rne = options.rne ?? null;
    this._discount = options.discount ?? 0;
  }

  // ============================================================================
  // Setters avec fluent interface
  // ============================================================================

  /**
   * Définir le NCC du client (requis pour B2B)
   */
  public setClientNcc(ncc: string | null): this {
    this._clientNcc = ncc;
    return this;
  }

  /**
   * Définir le nom du vendeur/contact client
   */
  public setClientSellerName(name: string | null): this {
    this._clientSellerName = name;
    return this;
  }

  /**
   * Définir le message commercial
   */
  public setCommercialMessage(message: string | null): this {
    this._commercialMessage = message;
    return this;
  }

  /**
   * Définir le pied de page
   */
  public setFooter(footer: string | null): this {
    this._footer = footer;
    return this;
  }

  /**
   * Définir la devise étrangère et le taux de change (pour B2F)
   */
  public setForeignCurrency(currency: Currency | null, rate: number = 0): this {
    this._foreignCurrency = currency;
    this._foreignCurrencyRate = rate;
    return this;
  }

  /**
   * Définir si c'est un RNE (Reçu Normalisé Électronique)
   */
  public setRne(isRne: boolean, rne: string | null = null): this {
    this._isRne = isRne;
    this._rne = rne;
    return this;
  }

  /**
   * Définir la remise globale (0-100%)
   */
  public setDiscount(discount: number): this {
    if (discount < 0 || discount > 100) {
      throw new Error('La remise doit être entre 0 et 100');
    }
    this._discount = discount;
    return this;
  }

  /**
   * Ajouter un article à la facture
   */
  public addItem(item: InvoiceItem): this {
    this._items.push(item);
    return this;
  }

  /**
   * Ajouter une taxe personnalisée
   */
  public addCustomTax(name: string, amount: number): this {
    this._customTaxes.push(new CustomTax(name, amount));
    return this;
  }

  // ============================================================================
  // Getters
  // ============================================================================

  public getInvoiceType(): InvoiceType {
    return this._invoiceType;
  }

  public getPaymentMethod(): PaymentMethod {
    return this._paymentMethod;
  }

  public getTemplate(): Template {
    return this._template;
  }

  public getPointOfSale(): string {
    return this._pointOfSale;
  }

  public getEstablishment(): string {
    return this._establishment;
  }

  public getClientCompanyName(): string {
    return this._clientCompanyName;
  }

  public getClientPhone(): string {
    return this._clientPhone;
  }

  public getClientEmail(): string {
    return this._clientEmail;
  }

  public getClientNcc(): string | null {
    return this._clientNcc ?? null;
  }

  public getClientSellerName(): string | null {
    return this._clientSellerName ?? null;
  }

  public getCommercialMessage(): string | null {
    return this._commercialMessage ?? null;
  }

  public getFooter(): string | null {
    return this._footer ?? null;
  }

  public getForeignCurrency(): Currency | null {
    return this._foreignCurrency ?? null;
  }

  public getForeignCurrencyRate(): number {
    return this._foreignCurrencyRate;
  }

  public getIsRne(): boolean {
    return this._isRne;
  }

  public getRne(): string | null {
    return this._rne ?? null;
  }

  public getDiscount(): number {
    return this._discount;
  }

  public getItems(): InvoiceItem[] {
    return [...this._items];
  }

  public getCustomTaxes(): CustomTax[] {
    return [...this._customTaxes];
  }

  // ============================================================================
  // Méthodes utilitaires
  // ============================================================================

  /**
   * Vérifier si c'est une facture B2B
   */
  public isB2B(): boolean {
    return this._template === 'B2B';
  }

  /**
   * Vérifier si c'est une facture B2F (export)
   */
  public isB2F(): boolean {
    return this._template === 'B2F';
  }

  /**
   * Vérifier si c'est une facture d'achat
   */
  public isPurchase(): boolean {
    return this._invoiceType === 'purchase';
  }

  /**
   * Obtenir le nombre d'articles
   */
  public getItemCount(): number {
    return this._items.length;
  }

  // ============================================================================
  // Sérialisation
  // ============================================================================

  /**
   * Convertir en objet pour l'envoi à l'API
   */
  public toArray(): InvoiceSerialized {
    const result: InvoiceSerialized = {
      invoiceType: this._invoiceType,
      paymentMethod: this._paymentMethod,
      template: this._template,
      pointOfSale: this._pointOfSale,
      establishment: this._establishment,
      clientCompanyName: this._clientCompanyName,
      clientPhone: this._clientPhone,
      clientEmail: this._clientEmail,
      isRne: this._isRne,
      items: this._items.map((item) => item.toArray()),
    };

    // Ajouter les champs optionnels seulement s'ils sont définis
    if (this._clientNcc) {
      result.clientNcc = this._clientNcc;
    }

    if (this._clientSellerName) {
      result.clientSellerName = this._clientSellerName;
    }

    if (this._commercialMessage) {
      result.commercialMessage = this._commercialMessage;
    }

    if (this._footer) {
      result.footer = this._footer;
    }

    if (this._foreignCurrency) {
      result.foreignCurrency = this._foreignCurrency;
      result.foreignCurrencyRate = this._foreignCurrencyRate;
    } else {
      result.foreignCurrency = '';
      result.foreignCurrencyRate = 0;
    }

    if (this._rne) {
      result.rne = this._rne;
    }

    if (this._discount > 0) {
      result.discount = this._discount;
    }

    if (this._customTaxes.length > 0) {
      result.customTaxes = this._customTaxes.map(
        (tax) => tax.toArray() as CustomTaxData
      );
    }

    return result;
  }

  /**
   * Alias pour toArray
   */
  public toJSON(): InvoiceSerialized {
    return this.toArray();
  }
}
