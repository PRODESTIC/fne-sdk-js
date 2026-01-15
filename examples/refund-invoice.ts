/**
 * Exemple: Avoir / Remboursement
 *
 * Comment créer un avoir sur une facture existante.
 */

import { FneClient } from '../src/index.js';

async function main() {
  const client = FneClient.test('votre_cle_api_ici');

  // ID de la facture originale (obtenu lors de la signature)
  const originalInvoiceId = 'uuid-de-la-facture-originale';

  // Créer une demande de remboursement
  const refundRequest = client.refunds().createRefundRequest();

  // Ajouter les articles à rembourser avec leurs quantités
  // Les IDs correspondent aux articles de la facture originale
  refundRequest.addItem('uuid-article-1', 2); // Rembourser 2 unités
  refundRequest.addItem('uuid-article-2', 1); // Rembourser 1 unité

  try {
    const response = await client.refunds().createRefund(
      originalInvoiceId,
      refundRequest
    );

    console.log('=== Avoir créé avec succès ===');
    console.log('Référence avoir:', response.getReference());
    console.log('URL Vérification:', response.getQrCodeUrl());
  } catch (error) {
    console.error('Erreur:', (error as Error).message);
  }
}

// Exemple de remboursement complet
async function fullRefundExample() {
  const client = FneClient.test('votre_cle_api_ici');

  // Articles de la facture originale
  const originalItems = [
    { id: 'uuid-article-1', quantity: 5 },
    { id: 'uuid-article-2', quantity: 10 },
    { id: 'uuid-article-3', quantity: 3 },
  ];

  try {
    // Remboursement complet de tous les articles
    const response = await client.refunds().createFullRefund(
      'uuid-facture-originale',
      originalItems
    );

    console.log('=== Remboursement complet ===');
    console.log('Référence:', response.getReference());
  } catch (error) {
    console.error('Erreur:', (error as Error).message);
  }
}

// Exemple de remboursement partiel
async function partialRefundExample() {
  const client = FneClient.test('votre_cle_api_ici');

  // Seulement certains articles à rembourser
  const itemsToRefund = [
    { id: 'uuid-article-1', quantity: 2 }, // Rembourser seulement 2 sur 5
  ];

  try {
    const response = await client.refunds().createPartialRefund(
      'uuid-facture-originale',
      itemsToRefund
    );

    console.log('=== Remboursement partiel ===');
    console.log('Référence:', response.getReference());
  } catch (error) {
    console.error('Erreur:', (error as Error).message);
  }
}

main();
