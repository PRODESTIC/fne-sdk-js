/**
 * Exemple: Facture B2B (Business to Business)
 *
 * Les factures B2B nécessitent le NCC (Numéro de Compte Contribuable) du client.
 */

import { FneClient, Invoice, InvoiceItem, Constants } from '../src/index.js';

async function main() {
  const client = FneClient.test('votre_cle_api_ici');

  // Créer une facture B2B
  // Le NCC du client est OBLIGATOIRE pour ce type de facture
  const invoice = new Invoice({
    invoiceType: Constants.INVOICE_TYPE_SALE,
    paymentMethod: Constants.PAYMENT_TRANSFER, // Virement bancaire
    template: Constants.TEMPLATE_B2B,
    pointOfSale: 'Siège Social',
    establishment: 'Prodestic SARL',
    clientCompanyName: 'Entreprise ABC SARL',
    clientPhone: '0709123456',
    clientEmail: 'comptabilite@abc.ci',
    clientNcc: '9500015F', // NCC obligatoire pour B2B
  });

  // Ajouter un message commercial
  invoice.setCommercialMessage('Merci pour votre confiance!');

  // Ajouter un pied de page
  invoice.setFooter('Conditions: Paiement à 30 jours. Pénalités de retard: 1.5%/mois.');

  // Ajouter les prestations
  invoice.addItem(
    new InvoiceItem({
      description: 'Développement application web - Phase 1',
      quantity: 1,
      amount: 2500000,
      taxes: [Constants.TAX_TVA],
    }).setReference('DEV-2024-001')
  );

  invoice.addItem(
    new InvoiceItem({
      description: 'Hébergement serveur (12 mois)',
      quantity: 12,
      amount: 50000,
      taxes: [Constants.TAX_TVA],
    }).setReference('HOST-2024-001')
  );

  // Appliquer une remise globale de 5%
  invoice.setDiscount(5);

  try {
    const response = await client.invoices().signInvoice(invoice);

    console.log('=== Facture B2B signée ===');
    console.log('Référence:', response.getReference());
    console.log('NCC Émetteur:', response.getNcc());
    console.log('URL Vérification:', response.getQrCodeUrl());
  } catch (error) {
    console.error('Erreur:', (error as Error).message);
  }
}

main();
