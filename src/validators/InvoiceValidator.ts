import { BaseValidator } from './BaseValidator.js';
import { Invoice } from '../models/Invoice.js';
import { InvoiceItem } from '../models/InvoiceItem.js';
import {
  ALLOWED_INVOICE_TYPES,
  ALLOWED_PAYMENT_METHODS,
  ALLOWED_TEMPLATES,
  ALLOWED_TAX_TYPES,
  ALLOWED_CURRENCIES,
  INVOICE_TYPE_SALE,
} from '../utils/constants.js';

/**
 * Validateur pour les factures FNE
 */
export class InvoiceValidator extends BaseValidator {
  /**
   * Valider une facture complète
   * @throws ValidationError si la validation échoue
   */
  public validate(invoice: Invoice): void {
    this.resetErrors();

    // Valider les champs de base
    this.validateBaseFields(invoice);

    // Valider les champs client
    this.validateClientFields(invoice);

    // Valider les règles métier selon le template
    this.validateTemplateRules(invoice);

    // Valider les articles
    this.validateItems(invoice);

    // Valider les champs optionnels
    this.validateOptionalFields(invoice);

    // Lancer l'exception si des erreurs existent
    this.throwIfErrors();
  }

  /**
   * Valider les champs de base de la facture
   */
  private validateBaseFields(invoice: Invoice): void {
    // Type de facture
    this.validateRequired('invoiceType', invoice.getInvoiceType());
    this.validateInArray(
      'invoiceType',
      invoice.getInvoiceType(),
      ALLOWED_INVOICE_TYPES,
      'type de facture'
    );

    // Méthode de paiement
    this.validateRequired('paymentMethod', invoice.getPaymentMethod());
    this.validateInArray(
      'paymentMethod',
      invoice.getPaymentMethod(),
      ALLOWED_PAYMENT_METHODS,
      'méthode de paiement'
    );

    // Template
    this.validateRequired('template', invoice.getTemplate());
    this.validateInArray(
      'template',
      invoice.getTemplate(),
      ALLOWED_TEMPLATES,
      'template'
    );

    // Point de vente
    this.validateRequired('pointOfSale', invoice.getPointOfSale(), 'point de vente');

    // Établissement
    this.validateRequired('establishment', invoice.getEstablishment(), 'établissement');
  }

  /**
   * Valider les champs client
   */
  private validateClientFields(invoice: Invoice): void {
    // Nom du client
    this.validateRequired(
      'clientCompanyName',
      invoice.getClientCompanyName(),
      'nom du client'
    );

    // Téléphone
    if (this.validateRequired('clientPhone', invoice.getClientPhone(), 'téléphone')) {
      this.validatePhone('clientPhone', invoice.getClientPhone());
    }

    // Email
    if (this.validateRequired('clientEmail', invoice.getClientEmail(), 'email')) {
      this.validateEmail('clientEmail', invoice.getClientEmail());
    }
  }

  /**
   * Valider les règles métier selon le template
   */
  private validateTemplateRules(invoice: Invoice): void {
    const template = invoice.getTemplate();

    // B2B requiert un NCC
    if (template === 'B2B') {
      const ncc = invoice.getClientNcc();
      if (!ncc || ncc.trim().length === 0) {
        this.addError('clientNcc', 'Le NCC client est requis pour les factures B2B');
      } else {
        this.validateNcc('clientNcc', ncc);
      }
    }

    // B2F requiert une devise étrangère et un taux de change
    if (template === 'B2F') {
      const currency = invoice.getForeignCurrency();
      const rate = invoice.getForeignCurrencyRate();

      if (!currency) {
        this.addError(
          'foreignCurrency',
          'La devise étrangère est requise pour les factures B2F'
        );
      } else {
        this.validateInArray(
          'foreignCurrency',
          currency,
          ALLOWED_CURRENCIES,
          'devise étrangère'
        );
      }

      if (currency && (rate === undefined || rate <= 0)) {
        this.addError(
          'foreignCurrencyRate',
          'Le taux de change doit être supérieur à 0 pour les factures B2F'
        );
      }
    }
  }

  /**
   * Valider les articles de la facture
   */
  private validateItems(invoice: Invoice): void {
    const items = invoice.getItems();

    // Au moins un article requis
    if (items.length === 0) {
      this.addError('items', 'La facture doit contenir au moins un article');
      return;
    }

    // Valider chaque article
    items.forEach((item, index) => {
      this.validateItem(item, index, invoice.getInvoiceType());
    });
  }

  /**
   * Valider un article individuel
   */
  private validateItem(
    item: InvoiceItem,
    index: number,
    invoiceType: string
  ): void {
    const prefix = `items[${index}]`;

    // Description
    if (!item.getDescription() || item.getDescription().trim().length === 0) {
      this.addError(`${prefix}.description`, 'La description est requise');
    }

    // Quantité
    if (item.getQuantity() <= 0) {
      this.addError(`${prefix}.quantity`, 'La quantité doit être supérieure à 0');
    }

    // Montant
    if (item.getAmount() <= 0) {
      this.addError(`${prefix}.amount`, 'Le montant doit être supérieur à 0');
    }

    // Taxes (requises uniquement pour les factures de vente)
    if (invoiceType === INVOICE_TYPE_SALE) {
      const taxes = item.getTaxes();

      if (taxes.length === 0) {
        this.addError(
          `${prefix}.taxes`,
          'Au moins un type de taxe est requis pour les factures de vente'
        );
      } else {
        // Valider chaque type de taxe
        taxes.forEach((tax, taxIndex) => {
          if (!ALLOWED_TAX_TYPES.includes(tax)) {
            this.addError(
              `${prefix}.taxes[${taxIndex}]`,
              `Type de taxe invalide: ${tax}. Valeurs acceptées: ${ALLOWED_TAX_TYPES.join(', ')}`
            );
          }
        });
      }
    }

    // Remise
    const discount = item.getDiscount();
    if (discount < 0 || discount > 100) {
      this.addError(`${prefix}.discount`, 'La remise doit être entre 0 et 100');
    }

    // Taxes personnalisées
    item.getCustomTaxes().forEach((customTax, taxIndex) => {
      if (!customTax.getName() || customTax.getName().trim().length === 0) {
        this.addError(
          `${prefix}.customTaxes[${taxIndex}].name`,
          'Le nom de la taxe personnalisée est requis'
        );
      }
      if (customTax.getAmount() < 0) {
        this.addError(
          `${prefix}.customTaxes[${taxIndex}].amount`,
          'Le montant de la taxe personnalisée doit être positif'
        );
      }
    });
  }

  /**
   * Valider les champs optionnels
   */
  private validateOptionalFields(invoice: Invoice): void {
    // Devise étrangère (si définie, doit être valide)
    const currency = invoice.getForeignCurrency();
    if (currency && !ALLOWED_CURRENCIES.includes(currency)) {
      this.addError(
        'foreignCurrency',
        `Devise invalide: ${currency}. Valeurs acceptées: ${ALLOWED_CURRENCIES.join(', ')}`
      );
    }

    // Remise globale
    const discount = invoice.getDiscount();
    if (discount < 0 || discount > 100) {
      this.addError('discount', 'La remise globale doit être entre 0 et 100');
    }

    // RNE
    if (invoice.getIsRne() && !invoice.getRne()) {
      this.addError('rne', 'Le numéro RNE est requis si isRne est true');
    }

    // Taxes personnalisées au niveau de la facture
    invoice.getCustomTaxes().forEach((customTax, index) => {
      if (!customTax.getName() || customTax.getName().trim().length === 0) {
        this.addError(
          `customTaxes[${index}].name`,
          'Le nom de la taxe personnalisée est requis'
        );
      }
      if (customTax.getAmount() < 0) {
        this.addError(
          `customTaxes[${index}].amount`,
          'Le montant de la taxe personnalisée doit être positif'
        );
      }
    });
  }
}
