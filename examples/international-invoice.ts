/**
 * Exemple: Facture B2F (Export / International)
 *
 * Les factures B2F nécessitent une devise étrangère et un taux de change.
 */

import { FneClient, Invoice, InvoiceItem, Constants } from '../src/index.js';

async function main() {
  const client = FneClient.test('votre_cle_api_ici');

  // Créer une facture d'exportation
  const invoice = new Invoice({
    invoiceType: Constants.INVOICE_TYPE_SALE,
    paymentMethod: Constants.PAYMENT_TRANSFER,
    template: Constants.TEMPLATE_B2F,
    pointOfSale: 'Export',
    establishment: 'Siège',
    clientCompanyName: 'European Trading GmbH',
    clientPhone: '+49123456789',
    clientEmail: 'import@eurotrading.de',
    foreignCurrency: Constants.CURRENCY_EUR,
    foreignCurrencyRate: 655.957, // Taux de change XOF/EUR
  });

  // Les exports sont généralement exonérés de TVA
  invoice.addItem(
    new InvoiceItem({
      description: 'Cacao brut - Grade Premium',
      quantity: 5000,
      amount: 2500, // Prix unitaire en XOF
      taxes: [Constants.TAX_TVAC], // Exonération conventionnelle
    }).setMeasurementUnit('kg')
  );

  invoice.addItem(
    new InvoiceItem({
      description: 'Beurre de karité bio',
      quantity: 1000,
      amount: 5000,
      taxes: [Constants.TAX_TVAC],
    }).setMeasurementUnit('kg')
  );

  try {
    const response = await client.invoices().signInvoice(invoice);

    console.log('=== Facture Export signée ===');
    console.log('Référence:', response.getReference());
    console.log('Devise:', Constants.CURRENCY_EUR);
    console.log('Taux de change:', 655.957);
    console.log('URL Vérification:', response.getQrCodeUrl());
  } catch (error) {
    console.error('Erreur:', (error as Error).message);
  }
}

main();
