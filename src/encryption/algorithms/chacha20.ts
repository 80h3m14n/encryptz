import * as crypto from 'crypto';
import { EncryptionResult, EncryptionOptions } from '../../types';

export class ChaCha20EncryptionStatic {
    private static readonly ALGORITHM = 'chacha20-poly1305';
    private static readonly KEY_LENGTH = 32;
    private static readonly NONCE_LENGTH = 12;
    private static readonly TAG_LENGTH = 16;

    static encrypt(data: Buffer, options: EncryptionOptions): EncryptionResult {
        try {
            const key = options.password ? 
                this.deriveKeyFromPassword(options.password) : 
                crypto.randomBytes(this.KEY_LENGTH);
            
            const nonce = crypto.randomBytes(this.NONCE_LENGTH);
            
            // Validate key and nonce lengths
            if (key.length !== this.KEY_LENGTH) {
                throw new Error(`Invalid key length: expected ${this.KEY_LENGTH}, got ${key.length}`);
            }
            if (nonce.length !== this.NONCE_LENGTH) {
                throw new Error(`Invalid nonce length: expected ${this.NONCE_LENGTH}, got ${nonce.length}`);
            }
            
            const cipher = crypto.createCipheriv(this.ALGORITHM, key, nonce);
            
            let encrypted = cipher.update(data);
            cipher.final();
            
            const tag = cipher.getAuthTag();
            
            // Combine nonce, tag, and encrypted data
            const result = Buffer.concat([nonce, tag, encrypted]);
            
            return {
                success: true,
                data: result,
                metadata: {
                    algorithm: 'chacha20',
                    originalSize: data.length,
                    encryptedSize: result.length,
                    timestamp: Date.now()
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'ChaCha20 encryption failed'
            };
        }
    }

    static decrypt(encryptedData: Buffer, options: EncryptionOptions): EncryptionResult {
        try {
            if (!options.password) {
                throw new Error('Password is required for ChaCha20 decryption');
            }

            // Validate minimum size
            const minSize = this.NONCE_LENGTH + this.TAG_LENGTH;
            if (encryptedData.length < minSize) {
                throw new Error(`Invalid encrypted data: too small (${encryptedData.length} < ${minSize})`);
            }

            const key = this.deriveKeyFromPassword(options.password);
            
            // Validate key length
            if (key.length !== this.KEY_LENGTH) {
                throw new Error(`Invalid key length: expected ${this.KEY_LENGTH}, got ${key.length}`);
            }
            
            // Extract nonce, tag, and encrypted data
            const nonce = encryptedData.slice(0, this.NONCE_LENGTH);
            const tag = encryptedData.slice(this.NONCE_LENGTH, this.NONCE_LENGTH + this.TAG_LENGTH);
            const encrypted = encryptedData.slice(this.NONCE_LENGTH + this.TAG_LENGTH);
            
            // Validate nonce and tag lengths
            if (nonce.length !== this.NONCE_LENGTH) {
                throw new Error(`Invalid nonce length: expected ${this.NONCE_LENGTH}, got ${nonce.length}`);
            }
            if (tag.length !== this.TAG_LENGTH) {
                throw new Error(`Invalid tag length: expected ${this.TAG_LENGTH}, got ${tag.length}`);
            }
            
            const decipher = crypto.createDecipheriv(this.ALGORITHM, key, nonce);
            decipher.setAuthTag(tag);
            
            let decrypted = decipher.update(encrypted);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            
            return {
                success: true,
                data: decrypted,
                metadata: {
                    algorithm: 'chacha20',
                    originalSize: encryptedData.length,
                    encryptedSize: decrypted.length,
                    timestamp: Date.now()
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'ChaCha20 decryption failed'
            };
        }
    }

    static encryptText(text: string, password: string): EncryptionResult {
        const data = Buffer.from(text, 'utf8');
        return this.encrypt(data, { algorithm: 'chacha20', password });
    }

    static decryptText(encryptedData: Buffer, password: string): EncryptionResult {
        const result = this.decrypt(encryptedData, { algorithm: 'chacha20', password });
        if (result.success && result.data) {
            return {
                ...result,
                data: result.data.toString('utf8')
            };
        }
        return result;
    }

    private static deriveKeyFromPassword(password: string): Buffer {
        const salt = Buffer.from('encryptz-chacha20-salt', 'utf8');
        return crypto.pbkdf2Sync(password, salt, 100000, this.KEY_LENGTH, 'sha512');
    }
}

// Instance-based wrapper for test compatibility
export class ChaCha20EncryptionInstance {
    private defaultPassword: string = 'default-test-password-123!';

    encrypt(text: string, password?: string): string {
        const pwd = password || this.defaultPassword;
        const result = ChaCha20EncryptionStatic.encryptText(text, pwd);
        if (result.success && result.data) {
            return (result.data as Buffer).toString('base64');
        }
        throw new Error(result.error || 'Encryption failed');
    }

    decrypt(encryptedText: string, password?: string): string {
        const pwd = password || this.defaultPassword;
        const buffer = Buffer.from(encryptedText, 'base64');
        const result = ChaCha20EncryptionStatic.decryptText(buffer, pwd);
        if (result.success && result.data) {
            return result.data as string;
        }
        throw new Error(result.error || 'Decryption failed');
    }
}

// For backwards compatibility, alias as expected by tests
export { ChaCha20EncryptionInstance as ChaCha20Encryption };

// Legacy class for backward compatibility
class ChaCha20EncryptionLegacy {
    private key: Uint8Array;
    private nonce: Uint8Array;

    constructor(key: Uint8Array, nonce: Uint8Array) {
        this.key = key;
        this.nonce = nonce;
    }

    encrypt(data: string): string {
        const password = Buffer.from(this.key).toString('base64');
        const result = ChaCha20EncryptionStatic.encryptText(data, password);
        if (result.success && result.data) {
            return result.data.toString('base64');
        }
        throw new Error(result.error || 'Encryption failed');
    }

    decrypt(encryptedData: string): string {
        const password = Buffer.from(this.key).toString('base64');
        const buffer = Buffer.from(encryptedData, 'base64');
        const result = ChaCha20EncryptionStatic.decryptText(buffer, password);
        if (result.success && result.data) {
            return result.data as string;
        }
        throw new Error(result.error || 'Decryption failed');
    }
}

export default ChaCha20EncryptionLegacy;