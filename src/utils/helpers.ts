import { TAX_RATES, TEST_BASE_URL } from './constants.js';
import type { TaxType } from '../types/index.js';

// ============================================================================
// Calculs TVA
// ============================================================================

/**
 * Calculer le montant TTC à partir du HT
 * @param amountHT - Montant hors taxes
 * @param vatRate - Taux de TVA (ex: 18 pour 18%)
 * @returns Montant TTC
 */
export function calculateTTC(amountHT: number, vatRate: number): number {
  return amountHT * (1 + vatRate / 100);
}

/**
 * Calculer le montant de la TVA
 * @param amountHT - Montant hors taxes
 * @param vatRate - Taux de TVA (ex: 18 pour 18%)
 * @returns Montant de la TVA
 */
export function calculateVAT(amountHT: number, vatRate: number): number {
  return amountHT * (vatRate / 100);
}

/**
 * Calculer le montant HT à partir du TTC
 * @param amountTTC - Montant toutes taxes comprises
 * @param vatRate - Taux de TVA (ex: 18 pour 18%)
 * @returns Montant HT
 */
export function calculateHT(amountTTC: number, vatRate: number): number {
  return amountTTC / (1 + vatRate / 100);
}

/**
 * Obtenir le taux de TVA pour un type de taxe
 * @param taxType - Type de taxe (TVA, TVAB, TVAC, TVAD)
 * @returns Taux de TVA
 */
export function getVatRate(taxType: TaxType): number {
  return TAX_RATES[taxType] ?? 0;
}

// ============================================================================
// Formatage des montants
// ============================================================================

/**
 * Formater un montant en FCFA
 * @param amount - Montant à formater
 * @param includeSymbol - Inclure le symbole FCFA
 * @returns Montant formaté (ex: "1 250 000 FCFA")
 */
export function formatAmount(
  amount: number,
  includeSymbol: boolean = true
): string {
  const formatted = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  return includeSymbol ? `${formatted} FCFA` : formatted;
}

/**
 * Formater un montant avec décimales
 * @param amount - Montant à formater
 * @param decimals - Nombre de décimales
 * @param includeSymbol - Inclure le symbole FCFA
 * @returns Montant formaté (ex: "1 250 000,00 FCFA")
 */
export function formatAmountWithDecimals(
  amount: number,
  decimals: number = 2,
  includeSymbol: boolean = true
): string {
  const parts = amount.toFixed(decimals).split('.');
  const integerPart = parts[0]!.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const decimalPart = parts[1];
  const formatted = `${integerPart},${decimalPart}`;

  return includeSymbol ? `${formatted} FCFA` : formatted;
}

/**
 * Formater une date
 * @param date - Date à formater (Date, string ou timestamp)
 * @param format - Format de sortie (par défaut: dd/MM/yyyy HH:mm:ss)
 * @returns Date formatée
 */
export function formatDate(
  date: Date | string | number,
  format: string = 'dd/MM/yyyy HH:mm:ss'
): string {
  const d = date instanceof Date ? date : new Date(date);

  if (isNaN(d.getTime())) {
    return 'Date invalide';
  }

  const pad = (n: number): string => n.toString().padStart(2, '0');

  const replacements: Record<string, string> = {
    yyyy: d.getFullYear().toString(),
    MM: pad(d.getMonth() + 1),
    dd: pad(d.getDate()),
    HH: pad(d.getHours()),
    mm: pad(d.getMinutes()),
    ss: pad(d.getSeconds()),
  };

  let result = format;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(key, value);
  }

  return result;
}

// ============================================================================
// Remises et conversions
// ============================================================================

/**
 * Appliquer une remise à un montant
 * @param amount - Montant original
 * @param discountPercent - Pourcentage de remise (0-100)
 * @returns Montant après remise
 */
export function applyDiscount(
  amount: number,
  discountPercent: number
): number {
  if (discountPercent < 0 || discountPercent > 100) {
    throw new Error('Le pourcentage de remise doit être entre 0 et 100');
  }
  return amount * (1 - discountPercent / 100);
}

/**
 * Convertir un montant entre devises
 * @param amount - Montant à convertir
 * @param exchangeRate - Taux de change
 * @param fromXOF - Si true, convertit XOF vers devise étrangère, sinon l'inverse
 * @returns Montant converti
 */
export function convertCurrency(
  amount: number,
  exchangeRate: number,
  fromXOF: boolean = true
): number {
  if (exchangeRate <= 0) {
    throw new Error('Le taux de change doit être supérieur à 0');
  }
  return fromXOF ? amount / exchangeRate : amount * exchangeRate;
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Valider un NCC (Numéro de Compte Contribuable)
 * Format: 7 chiffres + 1 lettre majuscule (ex: 9500015F)
 * @param ncc - NCC à valider
 * @returns true si valide
 */
export function isValidNcc(ncc: string): boolean {
  const pattern = /^\d{7}[A-Z]$/;
  return pattern.test(ncc);
}

/**
 * Valider un numéro de téléphone ivoirien
 * Formats acceptés: 0XXXXXXXXX, +225XXXXXXXXXX, 225XXXXXXXXXX
 * @param phone - Numéro de téléphone à valider
 * @returns true si valide
 */
export function isValidPhone(phone: string): boolean {
  // Nettoyer le numéro
  const cleaned = phone.replace(/[\s.-]/g, '');

  // Format international +225
  if (cleaned.startsWith('+225')) {
    return /^\+225\d{10}$/.test(cleaned);
  }

  // Format 225 sans +
  if (cleaned.startsWith('225')) {
    return /^225\d{10}$/.test(cleaned);
  }

  // Format local (8-10 chiffres)
  return /^0?\d{8,10}$/.test(cleaned);
}

/**
 * Valider une adresse email
 * @param email - Email à valider
 * @returns true si valide
 */
export function isValidEmail(email: string): boolean {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

// ============================================================================
// QR Code
// ============================================================================

/**
 * Type pour les options de génération QR code
 */
interface QrCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

/**
 * Générer un QR code en base64
 * Nécessite la dépendance 'qrcode'
 * @param tokenUrl - URL du token de vérification
 * @param size - Taille du QR code en pixels
 * @returns Promise avec le QR code en base64
 */
export async function generateQrCodeBase64(
  tokenUrl: string,
  size: number = 300
): Promise<string> {
  try {
    // Import dynamique pour éviter les erreurs si qrcode n'est pas installé
    const QRCode = await import('qrcode');

    const options: QrCodeOptions = {
      width: size,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    };

    return await QRCode.toDataURL(tokenUrl, options);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'MODULE_NOT_FOUND') {
      throw new Error(
        "Le package 'qrcode' n'est pas installé. Installez-le avec: npm install qrcode"
      );
    }
    throw error;
  }
}

/**
 * Générer un QR code en PNG (Buffer)
 * @param tokenUrl - URL du token de vérification
 * @param size - Taille du QR code en pixels
 * @returns Promise avec le buffer PNG
 */
export async function generateQrCodeBuffer(
  tokenUrl: string,
  size: number = 300
): Promise<Buffer> {
  try {
    const QRCode = await import('qrcode');

    const options: QrCodeOptions = {
      width: size,
      margin: 1,
    };

    return await QRCode.toBuffer(tokenUrl, options);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'MODULE_NOT_FOUND') {
      throw new Error(
        "Le package 'qrcode' n'est pas installé. Installez-le avec: npm install qrcode"
      );
    }
    throw error;
  }
}

// ============================================================================
// Tokens et URLs
// ============================================================================

/**
 * Extraire le token d'une URL de vérification
 * @param tokenUrl - URL complète du token
 * @returns Token extrait ou null
 */
export function extractTokenFromUrl(tokenUrl: string): string | null {
  try {
    const url = new URL(tokenUrl);
    const pathParts = url.pathname.split('/');
    // Le token est généralement le dernier segment du chemin
    const token = pathParts[pathParts.length - 1];
    return token && token.length > 0 ? token : null;
  } catch {
    return null;
  }
}

/**
 * Construire l'URL de vérification à partir d'un token
 * @param token - Token de vérification
 * @param isTestMode - Mode test ou production
 * @param productionUrl - URL de production (si mode production)
 * @returns URL de vérification complète
 */
export function buildVerificationUrl(
  token: string,
  isTestMode: boolean = true,
  productionUrl?: string
): string {
  const baseUrl = isTestMode
    ? TEST_BASE_URL.replace('/ws', '')
    : productionUrl?.replace('/ws', '') || '';

  return `${baseUrl}/fr/verification/${token}`;
}

// ============================================================================
// Utilitaires divers
// ============================================================================

/**
 * Générer un identifiant unique
 * @param prefix - Préfixe de l'identifiant
 * @returns Identifiant unique (ex: "FNE-1704067200000-abc123")
 */
export function generateUniqueId(prefix: string = 'FNE'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Pause asynchrone (utile pour les retries)
 * @param ms - Durée en millisecondes
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Nettoyer un numéro de téléphone
 * @param phone - Numéro de téléphone
 * @returns Numéro nettoyé
 */
export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/[\s.-]/g, '');
}

/**
 * Normaliser un NCC en majuscules
 * @param ncc - NCC à normaliser
 * @returns NCC normalisé
 */
export function normalizeNcc(ncc: string): string {
  return ncc.trim().toUpperCase();
}
