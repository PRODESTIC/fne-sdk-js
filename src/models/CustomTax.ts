import type { CustomTaxData } from '../types/index.js';

/**
 * Taxe personnalisée (ex: DTD, AIRSI, retenues à la source)
 */
export class CustomTax {
  private readonly _name: string;
  private readonly _amount: number;

  constructor(name: string, amount: number) {
    if (!name || name.trim().length === 0) {
      throw new Error('Le nom de la taxe est requis');
    }
    if (amount < 0) {
      throw new Error('Le montant de la taxe doit être positif');
    }

    this._name = name.trim();
    this._amount = amount;
  }

  /**
   * Obtenir le nom de la taxe
   */
  public getName(): string {
    return this._name;
  }

  /**
   * Obtenir le montant de la taxe
   */
  public getAmount(): number {
    return this._amount;
  }

  /**
   * Convertir en objet pour la sérialisation
   */
  public toArray(): CustomTaxData {
    return {
      name: this._name,
      amount: this._amount,
    };
  }

  /**
   * Alias pour toArray (compatibilité avec le nom PHP)
   */
  public toJSON(): CustomTaxData {
    return this.toArray();
  }
}
