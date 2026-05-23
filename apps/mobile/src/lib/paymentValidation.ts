/**
 * paymentValidation.ts
 * Advanced validation engine for the OfferApp payment gateway.
 */

// Basic email regex
export const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Sri Lankan phone number validation: allows 07X, +947X, etc.
export const isValidSLPhone = (phone: string) => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('94') && cleaned.length === 11) return true;
  if (cleaned.startsWith('07') && cleaned.length === 10) return true;
  if (cleaned.startsWith('7') && cleaned.length === 9) return true;
  return false;
};

// Luhn Algorithm Check
export const luhnCheck = (cardNumber: string): boolean => {
  const digits = cardNumber.replace(/\D/g, '');
  if (!digits) return false;
  
  let sum = 0;
  let isEven = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

// Card Network Detection and Validation
export type CardNetwork = 'visa' | 'mastercard' | 'amex' | 'unknown';

export const detectCardNetwork = (cardNumber: string): CardNetwork => {
  const cleaned = cardNumber.replace(/\D/g, '');
  
  // Visa: Starts with 4
  if (/^4/.test(cleaned)) return 'visa';
  
  // Mastercard: Starts with 51-55 or 2221-2720
  if (/^5[1-5]/.test(cleaned) || /^2(?:22[1-9]|2[3-9][0-9]|[3-6][0-9]{2}|7[01][0-9]|720)/.test(cleaned)) {
    return 'mastercard';
  }
  
  // Amex: Starts with 34 or 37
  if (/^3[47]/.test(cleaned)) return 'amex';
  
  return 'unknown';
};

export const validateCardNumber = (cardNumber: string): { isValid: boolean, network: CardNetwork, error?: string } => {
  const cleaned = cardNumber.replace(/\D/g, '');
  const network = detectCardNetwork(cleaned);

  if (!cleaned) return { isValid: false, network, error: 'Card number is required' };
  
  if (network === 'visa' && cleaned.length !== 16) return { isValid: false, network, error: 'Visa must be 16 digits' };
  if (network === 'mastercard' && cleaned.length !== 16) return { isValid: false, network, error: 'Mastercard must be 16 digits' };
  if (network === 'amex' && cleaned.length !== 15) return { isValid: false, network, error: 'Amex must be 15 digits' };
  
  if (network === 'unknown') {
    if (cleaned.length < 15 || cleaned.length > 19) return { isValid: false, network, error: 'Invalid card length' };
  }

  if (!luhnCheck(cleaned)) return { isValid: false, network, error: 'Invalid card number (Failed Luhn check)' };

  return { isValid: true, network };
};

// CVV Validation
export const validateCVV = (cvv: string, network: CardNetwork): { isValid: boolean, error?: string } => {
  const cleaned = cvv.replace(/\D/g, '');
  if (!cleaned) return { isValid: false, error: 'CVV is required' };
  
  if (network === 'amex') {
    if (cleaned.length !== 4) return { isValid: false, error: 'Amex CVV must be 4 digits' };
  } else {
    if (cleaned.length !== 3) return { isValid: false, error: 'CVV must be 3 digits' };
  }
  
  return { isValid: true };
};

// Expiry Date Validation
export const validateExpiry = (expiry: string): { isValid: boolean, error?: string } => {
  if (!expiry || expiry.length < 5) return { isValid: false, error: 'Required' };
  
  const [monthStr, yearStr] = expiry.split('/');
  if (!monthStr || !yearStr) return { isValid: false, error: 'Invalid format' };
  
  const month = parseInt(monthStr, 10);
  const year = parseInt(`20${yearStr}`, 10);
  
  if (month < 1 || month > 12) return { isValid: false, error: 'Invalid month' };
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return { isValid: false, error: 'Card has expired' };
  }
  
  return { isValid: true };
};

// Wallet Validation (mCash/eZ Cash)
export const validateWallet = (walletMethod: string, phone: string, amount: number, pin?: string): { isValid: boolean, error?: string } => {
  if (!isValidSLPhone(phone)) return { isValid: false, error: 'Invalid SL Mobile Number' };
  
  // Custom logic per wallet type
  if (walletMethod === 'ezcash') {
    // eZ cash typically runs on Dialog/Hutch, but Dialog is strictly required
    const cleaned = phone.replace(/\D/g, '');
    const dialogPrefixes = ['077', '076', '074', '9477', '9476', '9474', '77', '76', '74'];
    
    if (!dialogPrefixes.some(p => cleaned.startsWith(p))) {
       return { isValid: false, error: 'eZ Cash requires a valid Dialog number (077, 076, 074)' };
    }

    // Wallet balance mockup (Fail if > 50,000 for demo)
    if (amount > 50000) {
      return { isValid: false, error: 'Insufficient wallet balance for this transaction' };
    }
  } else if (walletMethod === 'mcash') {
    // mCash requires any valid SL number and a Wallet PIN
    if (!pin || pin.trim().length < 4) {
      return { isValid: false, error: 'mCash Wallet PIN is required (min 4 digits)' };
    }
  }

  return { isValid: true };
};
