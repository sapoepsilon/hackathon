import { AES, enc } from 'crypto-js';

interface StoredApiKey {
  value: string;
  expiresAt: number;
}

const STORAGE_KEY = 'encrypted_api_key';
const ENCRYPTION_KEY = 'your-encryption-key'; // TODO: Move to environment variable

export const apiKeyStorage = {
  /**
   * Store API key with encryption and expiration
   * @param apiKey - The API key to store
   * @param expirationHours - Number of hours until the key expires (default: 24)
   */
  store: (apiKey: string, expirationHours: number = 24): void => {
    try {
      const expiresAt = Date.now() + expirationHours * 60 * 60 * 1000;
      const data: StoredApiKey = { value: apiKey, expiresAt };
      
      // Encrypt the data
      const encrypted = AES.encrypt(
        JSON.stringify(data),
        ENCRYPTION_KEY
      ).toString();
      
      // Store in localStorage
      localStorage.setItem(STORAGE_KEY, encrypted);
    } catch (error) {
      console.error('Error storing API key:', error);
      throw new Error('Failed to store API key');
    }
  },

  /**
   * Retrieve the stored API key if it hasn't expired
   * @returns The API key if valid, null if expired or not found
   */
  retrieve: (): string | null => {
    try {
      const encrypted = localStorage.getItem(STORAGE_KEY);
      if (!encrypted) return null;

      // Decrypt the data
      const decrypted = AES.decrypt(encrypted, ENCRYPTION_KEY).toString(enc.Utf8);
      const data: StoredApiKey = JSON.parse(decrypted);

      // Check if expired
      if (Date.now() > data.expiresAt) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return data.value;
    } catch (error) {
      console.error('Error retrieving API key:', error);
      return null;
    }
  },

  /**
   * Remove the stored API key
   */
  remove: (): void => {
    localStorage.removeItem(STORAGE_KEY);
  },

  /**
   * Check if an API key is stored and valid
   */
  isValid: (): boolean => {
    return apiKeyStorage.retrieve() !== null;
  },

  /**
   * Get the expiration time of the stored API key
   * @returns Expiration time in milliseconds since epoch, or null if no valid key
   */
  getExpiration: (): number | null => {
    try {
      const encrypted = localStorage.getItem(STORAGE_KEY);
      if (!encrypted) return null;

      const decrypted = AES.decrypt(encrypted, ENCRYPTION_KEY).toString(enc.Utf8);
      const data: StoredApiKey = JSON.parse(decrypted);

      return data.expiresAt;
    } catch {
      return null;
    }
  }
};
