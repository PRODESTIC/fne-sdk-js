import type {
  TaxType,
  InvoiceItemOptions,
  InvoiceItemSerialized,
  CustomTaxData,
} from '../types/index.js';
import { CustomTax } from './CustomTax.js';

/**
 * Ligne de facture
 */
export class InvoiceItem {
  private readonly _description: string;
  private readonly _quantity: number;
  private readonly _amount: number;
  private readonly _taxes: TaxType[];
  private _reference?: string | null;
  private _discount: number = 0;
  private _measurementUnit?: string | null;
  private readonly _customTaxes: CustomTax[] = [];

  constructor(options: InvoiceItemOptions) {
    this._description = options.description;
    this._quantity = options.quantity;
    this._amount = options.amount;
    this._taxes = [...options.taxes];
    this._reference = options.reference ?? null;
    this._discount = options.discount ?? 0;
    this._measurementUnit = options.measurementUnit ?? null;
  }

  // ============================================================================
  // Setters avec fluent interface
  // ============================================================================

  /**
   * Définir la référence de l'article
   */
  public setReference(reference: string | null): this {
    this._reference = reference;
    return this;
  }

  /**
   * Définir la remise sur l'article (0-100%)
   */
  public setDiscount(discount: number): this {
    if (discount < 0 || discount > 100) {
      throw new Error('La remise doit être entre 0 et 100');
    }
    this._discount = discount;
    return this;
  }

  /**
   * Définir l'unité de mesure
   */
  public setMeasurementUnit(unit: string | null): this {
    this._measurementUnit = unit;
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

  public getDescription(): string {
    return this._description;
  }

  public getQuantity(): number {
    return this._quantity;
  }

  public getAmount(): number {
    return this._amount;
  }

  public getTaxes(): TaxType[] {
    return [...this._taxes];
  }

  public getReference(): string | null {
    return this._reference ?? null;
  }

  public getDiscount(): number {
    return this._discount;
  }

  public getMeasurementUnit(): string | null {
    return this._measurementUnit ?? null;
  }

  public getCustomTaxes(): CustomTax[] {
    return [...this._customTaxes];
  }

  // ============================================================================
  // Calculs
  // ============================================================================

  /**
   * Calculer le montant total HT de la ligne (quantité × prix unitaire)
   */
  public getTotalHT(): number {
    return this._quantity * this._amount;
  }

  /**
   * Calculer le montant total HT après remise
   */
  public getTotalHTAfterDiscount(): number {
    const total = this.getTotalHT();
    return total * (1 - this._discount / 100);
  }

  // ============================================================================
  // Sérialisation
  // ============================================================================

  /**
   * Convertir en objet pour la sérialisation
   */
  public toArray(): InvoiceItemSerialized {
    const result: InvoiceItemSerialized = {
      description: this._description,
      quantity: this._quantity,
      amount: this._amount,
      taxes: [...this._taxes],
    };

    // Ajouter les champs optionnels seulement s'ils sont définis
    if (this._reference) {
      result.reference = this._reference;
    }

    if (this._discount > 0) {
      result.discount = this._discount;
    }

    if (this._measurementUnit) {
      result.measurementUnit = this._measurementUnit;
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
  public toJSON(): InvoiceItemSerialized {
    return this.toArray();
  }
}
