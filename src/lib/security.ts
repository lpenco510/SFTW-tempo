/**
 * Utilidades de seguridad para el sistema de comercio exterior
 */

/**
 * Genera una contraseña segura con:
 * - Al menos 16 caracteres
 * - Mayúsculas, minúsculas, números y símbolos
 * - Suficiente entropía para resistir ataques de fuerza bruta
 */
export function generateSecurePassword(length = 20): string {
  const upperChars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowerChars = 'abcdefghijkmnopqrstuvwxyz';
  const numbers = '23456789';
  const symbols = '!@#$%^&*()_+-={}[]|:;<>,.?';
  
  // Excluimos caracteres similares: 0/O, 1/l/I
  const allChars = upperChars + lowerChars + numbers + symbols;
  
  // Aseguramos al menos un carácter de cada tipo
  let password = '';
  password += upperChars.charAt(Math.floor(Math.random() * upperChars.length));
  password += lowerChars.charAt(Math.floor(Math.random() * lowerChars.length));
  password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  password += symbols.charAt(Math.floor(Math.random() * symbols.length));
  
  // Completamos el resto
  for (let i = 4; i < length; i++) {
    password += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  // Mezclamos los caracteres
  return shuffleString(password);
}

/**
 * Mezcla aleatoriamente los caracteres de una cadena
 */
function shuffleString(str: string): string {
  const array = str.split('');
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array.join('');
}

/**
 * Verifica la fortaleza de una contraseña
 * Devuelve un valor entre 0 (débil) y 100 (muy fuerte)
 */
export function checkPasswordStrength(password: string): number {
  if (!password) return 0;
  
  let strength = 0;
  
  // Longitud (hasta 40 puntos)
  strength += Math.min(40, password.length * 2);
  
  // Complejidad (hasta 60 puntos)
  if (/[A-Z]/.test(password)) strength += 10; // Mayúsculas
  if (/[a-z]/.test(password)) strength += 10; // Minúsculas
  if (/[0-9]/.test(password)) strength += 10; // Números
  if (/[^A-Za-z0-9]/.test(password)) strength += 15; // Símbolos
  
  // Variedad de caracteres (hasta 15 puntos adicionales)
  const uniqueChars = new Set(password.split('')).size;
  strength += Math.min(15, uniqueChars * 0.5);
  
  return Math.min(100, Math.floor(strength));
}

/**
 * Función auxiliar para ofuscar datos sensibles en logs o auditoría
 */
export function maskSensitiveData(data: string, showFirstChars = 2, showLastChars = 2): string {
  if (!data) return '';
  if (data.length <= showFirstChars + showLastChars) return '*'.repeat(data.length);
  
  const firstPart = data.substring(0, showFirstChars);
  const lastPart = data.substring(data.length - showLastChars);
  const middlePart = '*'.repeat(Math.min(10, data.length - (showFirstChars + showLastChars)));
  
  return `${firstPart}${middlePart}${lastPart}`;
}

/**
 * Valida un formato de identificador fiscal argentino (CUIT/CUIL/CDI)
 */
export function isValidArgentineTaxId(taxId: string): boolean {
  // Eliminar guiones y espacios
  const cleanId = taxId.replace(/[-\s]/g, '');
  
  // Verificar longitud y formato numérico
  if (!/^\d{11}$/.test(cleanId)) {
    return false;
  }
  
  // Validar dígito verificador
  const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanId.charAt(i)) * multipliers[i];
  }
  
  const remainder = sum % 11;
  const verificationDigit = remainder === 0 ? 0 : remainder === 1 ? 9 : 11 - remainder;
  
  return verificationDigit === parseInt(cleanId.charAt(10));
}

/**
 * Formatea un CUIT/CUIL con guiones (XX-XXXXXXXX-X)
 */
export function formatArgentineTaxId(taxId: string): string {
  const cleanId = taxId.replace(/[-\s]/g, '');
  if (cleanId.length !== 11) return taxId;
  
  return `${cleanId.substring(0, 2)}-${cleanId.substring(2, 10)}-${cleanId.substring(10)}`;
} 