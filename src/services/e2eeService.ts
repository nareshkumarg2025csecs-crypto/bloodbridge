import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64, encodeUTF8, decodeUTF8 } from 'tweetnacl-util';
import { apiClient } from './apiClient';

const E2EE_STORAGE_KEY_PREFIX = 'bloodbridge_e2ee_keypair_';

export interface KeyPair {
  publicKey: string; // Base64
  secretKey: string; // Base64
}

export class E2EEService {
  /**
   * Generates or loads persistent Curve25519 (X25519) keypair on client device.
   * Private keys NEVER leave the device localStorage.
   */
  public async getOrCreateUserKeyPair(userId: string, institutionId: string): Promise<KeyPair> {
    const key = `${E2EE_STORAGE_KEY_PREFIX}${userId}`;
    const stored = localStorage.getItem(key);

    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // regenerate if corrupted
      }
    }

    // Generate Curve25519 Box Keypair
    const pair = nacl.box.keyPair();
    const keyPair: KeyPair = {
      publicKey: encodeBase64(pair.publicKey),
      secretKey: encodeBase64(pair.secretKey),
    };

    localStorage.setItem(key, JSON.stringify(keyPair));

    // Register Public Key with Backend for peer discovery
    try {
      await apiClient.post('/chat/e2ee/register-key', {
        publicKey: keyPair.publicKey,
        algorithm: 'Curve25519-X25519',
      });
      console.log('[E2EE] Registered user device public key with backend');
    } catch (err) {
      console.warn('[E2EE] Notice registering public key:', err);
    }

    return keyPair;
  }

  /**
   * Encrypts plaintext on the client using recipient's Curve25519 public key
   * and sender's private key via nacl.box.
   */
  public encryptMessage(
    plaintext: string,
    recipientPublicKeyBase64: string,
    senderSecretKeyBase64: string
  ): { ciphertext: string; nonce: string } {
    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const messageUint8 = decodeUTF8(plaintext);
    const recipientPubUint8 = decodeBase64(recipientPublicKeyBase64);
    const senderSecUint8 = decodeBase64(senderSecretKeyBase64);

    const encrypted = nacl.box(messageUint8, nonce, recipientPubUint8, senderSecUint8);

    return {
      ciphertext: encodeBase64(encrypted),
      nonce: encodeBase64(nonce),
    };
  }

  /**
   * Decrypts ciphertext on the client using sender's Curve25519 public key
   * and recipient's private key via nacl.box.open.
   */
  public decryptMessage(
    ciphertextBase64: string,
    nonceBase64: string,
    senderPublicKeyBase64: string,
    recipientSecretKeyBase64: string
  ): string | null {
    try {
      const ciphertext = decodeBase64(ciphertextBase64);
      const nonce = decodeBase64(nonceBase64);
      const senderPub = decodeBase64(senderPublicKeyBase64);
      const recipientSec = decodeBase64(recipientSecretKeyBase64);

      const decrypted = nacl.box.open(ciphertext, nonce, senderPub, recipientSec);
      if (!decrypted) return null;

      return encodeUTF8(decrypted);
    } catch (e) {
      console.error('[E2EE] Decryption error:', e);
      return null;
    }
  }
}

export const e2eeService = new E2EEService();
