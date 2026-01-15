/**
 * Exemple: Facture d'achat (achats agricoles)
 *
 * Les factures d'achat sont utilisées pour les achats auprès de producteurs.
 */

import { FneClient, Constants } from '../src/index.js';

async function main() {
  const client = FneClient.test('votre_cle_api_ici');

  // Créer une facture d'achat auprès d'un producteur
  const purchaseInvoice = client.purchases().createPurchaseInvoice(
    'Point de collecte Daloa',
    'Coopérative Cacao Excellence',
    'Konan Yao Jean',
    '0709123456',
    'konan.yao@email.com',
    Constants.PAYMENT_MOBILE_MONEY
  );

  // Ajouter les produits achetés
  // Note: Les factures d'achat n'ont pas de taxes
  purchaseInvoice.addItem(
    client.purchases().createPurchaseItem(
      'Cacao en fèves - Grade A',
      500,
      1500, // Prix par kg
      'kg'
    )
  );

  purchaseInvoice.addItem(
    client.purchases().createPurchaseItem(
      'Cacao en fèves - Grade B',
      300,
      1200,
      'kg'
    )
  );

  try {
    const response = await client.purchases().signPurchaseInvoice(purchaseInvoice);

    console.log('=== Facture d\'achat signée ===');
    console.log('Référence:', response.getReference());
    console.log('Fournisseur: Konan Yao Jean');
    console.log('URL Vérification:', response.getQrCodeUrl());
  } catch (error) {
    console.error('Erreur:', (error as Error).message);
  }
}

// Exemple d'achat B2B (avec NCC fournisseur)
async function b2bPurchaseExample() {
  const client = FneClient.test('votre_cle_api_ici');

  // Achat auprès d'un fournisseur avec NCC
  const purchaseInvoice = client.purchases().createB2BPurchaseInvoice(
    'Entrepôt Principal',
    'Magasin Central',
    'Fournisseur Équipements SARL',
    '0709123456',
    'ventes@equipements.ci',
    '9500015F', // NCC du fournisseur
    Constants.PAYMENT_TRANSFER
  );

  purchaseInvoice.addItem(
    client.purchases().createPurchaseItem(
      'Ordinateurs Dell Latitude',
      10,
      450000,
      'pcs'
    )
  );

  try {
    const response = await client.purchases().signPurchaseInvoice(purchaseInvoice);
    console.log('Facture B2B créée:', response.getReference());
  } catch (error) {
    console.error('Erreur:', (error as Error).message);
  }
}

// Exemple d'achat coopérative
async function cooperativePurchaseExample() {
  const client = FneClient.test('votre_cle_api_ici');

  // Achat auprès d'une coopérative agricole
  const purchaseInvoice = client.purchases().createCooperativePurchase(
    'Centre de collecte',
    'Zone Agricole Nord',
    'Coopérative des Producteurs de Café',
    '0709123456',
    'coop.cafe@email.com',
    Constants.PAYMENT_MOBILE_MONEY
  );

  purchaseInvoice.addItem(
    client.purchases().createPurchaseItem(
      'Café robusta - Récolte 2024',
      2000,
      2500,
      'kg'
    )
  );

  try {
    const response = await client.purchases().signPurchaseInvoice(purchaseInvoice);
    console.log('Achat coopérative enregistré:', response.getReference());
  } catch (error) {
    console.error('Erreur:', (error as Error).message);
  }
}

main();
