# FNE SDK JavaScript/TypeScript

SDK non-officiel pour l'intégration avec l'API FNE (Facture Normalisée Électronique) de la DGI Côte d'Ivoire.

## Installation

```bash
npm install @prodestic/fne-sdk-js
```

## Prérequis

- Node.js 18+
- Une clé API FNE (obtenue auprès de la DGI après validation)

## Utilisation rapide

```typescript
import { FneClient, Invoice, InvoiceItem, Constants } from '@prodestic/fne-sdk-js';

// Initialiser le client en mode test
const client = FneClient.test('votre_cle_api');

// Créer une facture B2C
const invoice = new Invoice({
  invoiceType: Constants.INVOICE_TYPE_SALE,
  paymentMethod: Constants.PAYMENT_CASH,
  template: Constants.TEMPLATE_B2C,
  pointOfSale: 'Caisse 1',
  establishment: 'Magasin Principal',
  clientCompanyName: 'Jean Dupont',
  clientPhone: '0709123456',
  clientEmail: 'jean@email.com'
});

// Ajouter des articles
invoice.addItem(new InvoiceItem({
  description: 'Laptop HP ProBook',
  quantity: 1,
  amount: 650000,
  taxes: [Constants.TAX_TVA]
}));

// Signer la facture
try {
  const response = await client.invoices().signInvoice(invoice);

  console.log('Référence:', response.getReference());
  console.log('NCC:', response.getNcc());
  console.log('QR Code URL:', response.getQrCodeUrl());
  console.log('Solde stickers:', response.getBalanceSticker());
} catch (error) {
  console.error('Erreur:', error.message);
}
```

## Templates de facture

| Template | Description | Champs requis |
|----------|-------------|---------------|
| `B2C` | Business to Consumer | Champs de base |
| `B2B` | Business to Business | + `clientNcc` |
| `B2F` | Business to Foreign (Export) | + `foreignCurrency`, `foreignCurrencyRate` |
| `B2G` | Business to Government | Champs de base |

## Types de taxes

| Constante | Taux | Description |
|-----------|------|-------------|
| `TAX_TVA` | 18% | TVA standard |
| `TAX_TVAB` | 9% | TVA réduite |
| `TAX_TVAC` | 0% | Exonération conventionnelle |
| `TAX_TVAD` | 0% | Exonération légale |

## Méthodes de paiement

- `PAYMENT_CASH` - Espèces
- `PAYMENT_CARD` - Carte bancaire
- `PAYMENT_CHECK` - Chèque
- `PAYMENT_MOBILE_MONEY` - Mobile Money
- `PAYMENT_TRANSFER` - Virement
- `PAYMENT_DEFERRED` - Paiement différé

## Exemples

### Facture B2B (Business to Business)

```typescript
const invoice = new Invoice({
  invoiceType: Constants.INVOICE_TYPE_SALE,
  paymentMethod: Constants.PAYMENT_TRANSFER,
  template: Constants.TEMPLATE_B2B,
  pointOfSale: 'Caisse 1',
  establishment: 'Siège',
  clientCompanyName: 'Entreprise ABC',
  clientPhone: '0709123456',
  clientEmail: 'contact@abc.ci',
  clientNcc: '9500015F' // NCC obligatoire pour B2B
});

invoice.addItem(new InvoiceItem({
  description: 'Prestation de service',
  quantity: 1,
  amount: 1000000,
  taxes: [Constants.TAX_TVA]
}));
```

### Facture B2F (Export)

```typescript
const invoice = new Invoice({
  invoiceType: Constants.INVOICE_TYPE_SALE,
  paymentMethod: Constants.PAYMENT_TRANSFER,
  template: Constants.TEMPLATE_B2F,
  pointOfSale: 'Caisse 1',
  establishment: 'Export',
  clientCompanyName: 'Foreign Company Ltd',
  clientPhone: '0709123456',
  clientEmail: 'contact@foreign.com',
  foreignCurrency: Constants.CURRENCY_EUR,
  foreignCurrencyRate: 655.957
});

invoice.addItem(new InvoiceItem({
  description: 'Produit export',
  quantity: 100,
  amount: 5000,
  taxes: [Constants.TAX_TVAC] // Exonéré pour export
}));
```

### Facture d'achat (agricole)

```typescript
const purchaseInvoice = client.purchases().createPurchaseInvoice(
  'Point de collecte',
  'Coopérative',
  'Producteur Konan',
  '0709123456',
  'konan@email.com',
  Constants.PAYMENT_MOBILE_MONEY
);

purchaseInvoice.addItem(
  client.purchases().createPurchaseItem(
    'Cacao grade A',
    1000,
    1500,
    'kg'
  )
);

const response = await client.purchases().signPurchaseInvoice(purchaseInvoice);
```

### Avoir / Remboursement

```typescript
const refundRequest = client.refunds().createRefundRequest();
refundRequest.addItem('item-uuid-1', 5); // Rembourser 5 unités
refundRequest.addItem('item-uuid-2', 10);

const response = await client.refunds().createRefund(
  'original-invoice-id',
  refundRequest
);
```

### Gestion des erreurs

```typescript
import {
  ValidationError,
  ApiError,
  AuthenticationError,
  NetworkError
} from '@prodestic/fne-sdk-js';

try {
  const response = await client.invoices().signInvoice(invoice);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Erreurs de validation:', error.getErrors());
    // { clientEmail: "L'adresse email n'est pas valide", ... }
  } else if (error instanceof AuthenticationError) {
    console.error('Erreur d\'authentification:', error.message);
  } else if (error instanceof ApiError) {
    console.error('Erreur API:', error.statusCode, error.message);
  } else if (error instanceof NetworkError) {
    console.error('Erreur réseau:', error.message);
  }
}
```

## Utilitaires

```typescript
import {
  calculateTTC,
  calculateVAT,
  formatAmount,
  generateQrCodeBase64,
  isValidNcc
} from '@prodestic/fne-sdk-js';

// Calculs TVA
const ttc = calculateTTC(100000, 18); // 118000
const vat = calculateVAT(100000, 18); // 18000

// Formatage
const formatted = formatAmount(1250000); // "1 250 000 FCFA"

// Validation
const isValid = isValidNcc('9500015F'); // true

// QR Code
const qrBase64 = await generateQrCodeBase64(response.getQrCodeUrl());
```

## Configuration

### Mode Test vs Production

```typescript
// Mode test (environnement de test DGI)
const testClient = FneClient.test('votre_cle_api');

// Mode production
const prodClient = FneClient.production(
  'votre_cle_api',
  'https://url-production-dgi.ci/ws'
);

// Basculer entre les modes
testClient.enableProductionMode('https://url-production.ci/ws');
prodClient.enableTestMode();
```

### Options avancées

Le SDK inclut automatiquement :
- Retry automatique (3 tentatives avec backoff exponentiel)
- Timeout de 30 secondes
- Gestion des erreurs réseau

## API Reference

### FneClient

| Méthode | Description |
|---------|-------------|
| `FneClient.test(apiKey)` | Créer un client en mode test |
| `FneClient.production(apiKey, baseUrl)` | Créer un client en mode production |
| `invoices()` | Accéder au service de facturation |
| `refunds()` | Accéder au service d'avoirs |
| `purchases()` | Accéder au service d'achats |

### Invoice

| Méthode | Description |
|---------|-------------|
| `addItem(item)` | Ajouter un article |
| `setClientNcc(ncc)` | Définir le NCC client (B2B) |
| `setForeignCurrency(currency, rate)` | Définir la devise étrangère (B2F) |
| `setDiscount(percent)` | Définir la remise globale |
| `addCustomTax(name, amount)` | Ajouter une taxe personnalisée |

### ApiResponse

| Méthode | Description |
|---------|-------------|
| `getReference()` | Référence de la facture |
| `getNcc()` | Numéro de compte contribuable |
| `getQrCodeUrl()` | URL du QR code de vérification |
| `getBalanceSticker()` | Solde de stickers restant |
| `hasWarning()` | Alerte solde faible |

## Support

- **Issues**: [GitHub Issues](https://github.com/prodestic/fne-sdk-js/issues)
- **Email**: a.niando@prodestic.net

## Licence

MIT License - voir [LICENSE](LICENSE)

---

**Note**: Ce SDK est non-officiel et n'est pas affilié à la DGI Côte d'Ivoire. Pour obtenir une clé API, vous devez vous inscrire auprès de la DGI.
