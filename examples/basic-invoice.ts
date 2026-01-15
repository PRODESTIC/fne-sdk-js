/**
 * Exemple: Facture B2C basique
 *
 * Cet exemple montre comment créer et signer une facture B2C simple.
 */

import { FneClient, Invoice, InvoiceItem, Constants } from '../src/index.js';

async function main() {
  // Initialiser le client en mode test
  const client = FneClient.test('votre_cle_api_ici');

  // Créer une facture B2C
  const invoice = new Invoice({
    invoiceType: Constants.INVOICE_TYPE_SALE,
    paymentMethod: Constants.PAYMENT_CASH,
    template: Constants.TEMPLATE_B2C,
    pointOfSale: 'Caisse 1',
    establishment: 'Magasin Principal',
    clientCompanyName: 'Jean Dupont',
    clientPhone: '0709123456',
    clientEmail: 'jean.dupont@email.com',
  });

  // Ajouter des articles
  invoice.addItem(
    new InvoiceItem({
      description: 'Laptop HP ProBook 450 G8',
      quantity: 1,
      amount: 650000,
      taxes: [Constants.TAX_TVA],
    })
  );

  invoice.addItem(
    new InvoiceItem({
      description: 'Souris sans fil Logitech',
      quantity: 2,
      amount: 15000,
      taxes: [Constants.TAX_TVA],
    })
  );

  invoice.addItem(
    new InvoiceItem({
      description: 'Clavier USB',
      quantity: 1,
      amount: 25000,
      taxes: [Constants.TAX_TVA],
    })
  );

  try {
    // Signer la facture
    const response = await client.invoices().signInvoice(invoice);

    console.log('=== Facture signée avec succès ===');
    console.log('Référence:', response.getReference());
    console.log('NCC:', response.getNcc());
    console.log('QR Code URL:', response.getQrCodeUrl());
    console.log('Solde stickers:', response.getBalanceSticker());

    if (response.hasWarning()) {
      console.warn('⚠️ Attention: Solde de stickers faible!');
    }
  } catch (error) {
    console.error('Erreur:', (error as Error).message);
  }
}

main();
