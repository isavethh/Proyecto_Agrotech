import CryptoJS from 'crypto-js';
import { config } from '../config/index.js';

/**
 * Módulo de encriptación AES-256
 * Para proteger datos sensibles en la base de datos
 */

const ENCRYPTION_KEY = config.encryption.key;

/**
 * Encripta un texto usando AES-256
 * @param text Texto a encriptar
 * @returns Texto encriptado en base64
 */
export function encrypt(text: string): string {
  if (!text) return '';
  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY no está configurada');
  }
  
  const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY);
  return encrypted.toString();
}

/**
 * Desencripta un texto encriptado con AES-256
 * @param encryptedText Texto encriptado en base64
 * @returns Texto original
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText) return '';
  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY no está configurada');
  }
  
  const decrypted = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
  return decrypted.toString(CryptoJS.enc.Utf8);
}

/**
 * Encripta un objeto JSON
 * @param obj Objeto a encriptar
 * @returns String encriptado
 */
export function encryptObject(obj: object): string {
  const jsonString = JSON.stringify(obj);
  return encrypt(jsonString);
}

/**
 * Desencripta un objeto JSON
 * @param encryptedText Texto encriptado
 * @returns Objeto original
 */
export function decryptObject<T>(encryptedText: string): T {
  const jsonString = decrypt(encryptedText);
  return JSON.parse(jsonString) as T;
}

/**
 * Genera un hash SHA-256 de un texto
 * @param text Texto a hashear
 * @returns Hash en hexadecimal
 */
export function hash(text: string): string {
  return CryptoJS.SHA256(text).toString();
}

/**
 * Genera un token aleatorio seguro
 * @param length Longitud del token en bytes
 * @returns Token en hexadecimal
 */
export function generateSecureToken(length: number = 32): string {
  const randomWords = CryptoJS.lib.WordArray.random(length);
  return randomWords.toString();
}

/**
 * Enmascara datos sensibles (para logs)
 * @param text Texto a enmascarar
 * @param visibleChars Número de caracteres visibles al inicio y final
 * @returns Texto enmascarado
 */
export function maskSensitiveData(text: string, visibleChars: number = 4): string {
  if (!text || text.length <= visibleChars * 2) {
    return '*'.repeat(text?.length || 0);
  }
  
  const start = text.substring(0, visibleChars);
  const end = text.substring(text.length - visibleChars);
  const masked = '*'.repeat(text.length - visibleChars * 2);
  
  return `${start}${masked}${end}`;
}

/**
 * Valida que un texto encriptado sea válido
 * @param encryptedText Texto encriptado
 * @returns true si es válido
 */
export function isValidEncryption(encryptedText: string): boolean {
  try {
    const decrypted = decrypt(encryptedText);
    return decrypted.length > 0;
  } catch {
    return false;
  }
}

export default {
  encrypt,
  decrypt,
  encryptObject,
  decryptObject,
  hash,
  generateSecureToken,
  maskSensitiveData,
  isValidEncryption,
};
