/**
 * Exemple: Gestion des erreurs
 *
 * Comment gérer les différents types d'erreurs du SDK.
 */

import {
  FneClient,
  Invoice,
  InvoiceItem,
  Constants,
  ValidationError,
  ApiError,
  AuthenticationError,
  NetworkError,
  FneError,
} from '../src/index.js';

async function main() {
  const client = FneClient.test('votre_cle_api_ici');

  // Créer une facture (volontairement incomplète pour démonstration)
  const invoice = new Invoice({
    invoiceType: Constants.INVOICE_TYPE_SALE,
    paymentMethod: Constants.PAYMENT_CASH,
    template: Constants.TEMPLATE_B2C,
    pointOfSale: 'Caisse 1',
    establishment: 'Magasin',
    clientCompanyName: 'Jean Dupont',
    clientPhone: '0709123456',
    clientEmail: 'jean@email.com',
  });

  invoice.addItem(
    new InvoiceItem({
      description: 'Produit test',
      quantity: 1,
      amount: 10000,
      taxes: [Constants.TAX_TVA],
    })
  );

  try {
    const response = await client.invoices().signInvoice(invoice);
    console.log('Succès:', response.getReference());
  } catch (error) {
    handleError(error);
  }
}

function handleError(error: unknown): void {
  // Erreur de validation (données invalides)
  if (error instanceof ValidationError) {
    console.error('=== Erreur de validation ===');
    console.error('Message:', error.message);
    console.error('Nombre d\'erreurs:', error.getErrorCount());

    // Afficher chaque erreur de champ
    const errors = error.getErrors();
    for (const [field, message] of Object.entries(errors)) {
      console.error(`  - ${field}: ${message}`);
    }

    // Vérifier une erreur spécifique
    if (error.hasError('clientEmail')) {
      console.error('L\'email est invalide!');
    }

    return;
  }

  // Erreur d'authentification (clé API invalide)
  if (error instanceof AuthenticationError) {
    console.error('=== Erreur d\'authentification ===');
    console.error('Message:', error.message);
    console.error('Vérifiez votre clé API.');
    return;
  }

  // Erreur de l'API (réponse d'erreur du serveur)
  if (error instanceof ApiError) {
    console.error('=== Erreur API ===');
    console.error('Code HTTP:', error.statusCode);
    console.error('Message:', error.message);

    if (error.isClientError()) {
      console.error('Erreur côté client (4xx) - Vérifiez vos données');
    } else if (error.isServerError()) {
      console.error('Erreur côté serveur (5xx) - Réessayez plus tard');
    }

    // Afficher la réponse brute si disponible
    if (error.response) {
      console.error('Réponse:', JSON.stringify(error.response, null, 2));
    }

    return;
  }

  // Erreur réseau (connexion, timeout, etc.)
  if (error instanceof NetworkError) {
    console.error('=== Erreur réseau ===');
    console.error('Message:', error.message);

    if (error.originalError) {
      console.error('Erreur originale:', error.originalError.message);
    }

    console.error('Vérifiez votre connexion internet.');
    return;
  }

  // Erreur FNE générique
  if (error instanceof FneError) {
    console.error('=== Erreur FNE ===');
    console.error('Message:', error.message);
    console.error('Contexte:', JSON.stringify(error.getContext(), null, 2));
    return;
  }

  // Erreur inconnue
  console.error('=== Erreur inattendue ===');
  console.error(error);
}

// Exemple de validation préventive
function validateInvoiceBeforeSending(invoice: Invoice): boolean {
  // Vérifications manuelles
  if (invoice.getItems().length === 0) {
    console.error('La facture doit contenir au moins un article');
    return false;
  }

  if (invoice.isB2B() && !invoice.getClientNcc()) {
    console.error('Le NCC est requis pour les factures B2B');
    return false;
  }

  if (invoice.isB2F()) {
    if (!invoice.getForeignCurrency()) {
      console.error('La devise étrangère est requise pour les factures B2F');
      return false;
    }
    if (invoice.getForeignCurrencyRate() <= 0) {
      console.error('Le taux de change doit être positif');
      return false;
    }
  }

  return true;
}

// Exemple avec retry personnalisé
async function signWithRetry(
  client: FneClient,
  invoice: Invoice,
  maxRetries: number = 3
): Promise<void> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Tentative ${attempt}/${maxRetries}...`);
      const response = await client.invoices().signInvoice(invoice);
      console.log('Succès!', response.getReference());
      return;
    } catch (error) {
      lastError = error as Error;

      // Ne pas retenter pour les erreurs de validation ou d'authentification
      if (error instanceof ValidationError || error instanceof AuthenticationError) {
        throw error;
      }

      // Ne pas retenter pour les erreurs client (4xx)
      if (error instanceof ApiError && error.isClientError()) {
        throw error;
      }

      // Attendre avant de réessayer
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Attente de ${delay}ms avant nouvelle tentative...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

main();
