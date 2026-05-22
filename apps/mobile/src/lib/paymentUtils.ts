export const luhnCheck = (num: string): boolean => {
  // Remove spaces and dashes
  const sanitized = num.replace(/[^0-9]/g, '');
  if (sanitized.length !== 16) return false;
  let sum = 0;
  for (let i = 0; i < sanitized.length; i++) {
    let digit = parseInt(sanitized.charAt(sanitized.length - 1 - i), 10);
    if (i % 2 === 1) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return sum % 10 === 0;
};
