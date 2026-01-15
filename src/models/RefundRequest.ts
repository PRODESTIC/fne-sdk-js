import type { RefundItemData } from '../types/index.js';

/**
 * Demande de remboursement / avoir
 */
export class RefundRequest {
  private readonly _items: RefundItemData[] = [];

  /**
   * Ajouter un article à rembourser
   * @param itemId - ID de l'article original
   * @param quantity - Quantité à rembourser
   */
  public addItem(itemId: string, quantity: number): this {
    if (!itemId || itemId.trim().length === 0) {
      throw new Error("L'ID de l'article est requis");
    }
    if (quantity <= 0) {
      throw new Error('La quantité doit être supérieure à 0');
    }

    this._items.push({
      id: itemId.trim(),
      quantity,
    });

    return this;
  }

  /**
   * Obtenir les articles à rembourser
   */
  public getItems(): RefundItemData[] {
    return [...this._items];
  }

  /**
   * Vérifier si la demande contient des articles
   */
  public hasItems(): boolean {
    return this._items.length > 0;
  }

  /**
   * Obtenir le nombre d'articles
   */
  public getItemCount(): number {
    return this._items.length;
  }

  /**
   * Convertir en objet pour l'envoi à l'API
   */
  public toArray(): { items: RefundItemData[] } {
    return {
      items: this._items.map((item) => ({
        id: item.id,
        quantity: item.quantity,
      })),
    };
  }

  /**
   * Alias pour toArray
   */
  public toJSON(): { items: RefundItemData[] } {
    return this.toArray();
  }
}
