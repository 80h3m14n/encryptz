import { createCipher, createDecipher, createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { EncryptionResult, EncryptionOptions } from '../../types';

export class AESEncryption {
    private static readonly ALGORITHM = 'aes-256-gcm';
    private static readonly KEY_LENGTH = 32;
    private static readonly IV_LENGTH = 16;
    private static readonly TAG_LENGTH = 16;

    static encrypt(data: Buffer, options: EncryptionOptions): EncryptionResult {
        try {
            const key = options.password ? 
                this.deriveKeyFromPassword(options.password) : 
                randomBytes(this.KEY_LENGTH);
            
            const iv = randomBytes(this.IV_LENGTH);
            const cipher = createCipheriv(this.ALGORITHM, key, iv);
            
            let encrypted = cipher.update(data);
            cipher.final();
            
            const tag = cipher.getAuthTag();
            
            // Combine IV, tag, and encrypted data
            const result = Buffer.concat([iv, tag, encrypted]);
            
            return {
                success: true,
                data: result,
                metadata: {
                    algorithm: 'aes',
                    originalSize: data.length,
                    encryptedSize: result.length,
                    timestamp: Date.now()
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'AES encryption failed'
            };
        }
    }

    static decrypt(encryptedData: Buffer, options: EncryptionOptions): EncryptionResult {
        try {
            if (!options.password) {
                throw new Error('Password is required for AES decryption');
            }

            const key = this.deriveKeyFromPassword(options.password);
            
            // Extract IV, tag, and encrypted data
            const iv = encryptedData.slice(0, this.IV_LENGTH);
            const tag = encryptedData.slice(this.IV_LENGTH, this.IV_LENGTH + this.TAG_LENGTH);
            const encrypted = encryptedData.slice(this.IV_LENGTH + this.TAG_LENGTH);
            
            const decipher = createDecipheriv(this.ALGORITHM, key, iv);
            decipher.setAuthTag(tag);
            
            let decrypted = decipher.update(encrypted);
            decipher.final();
            
            return {
                success: true,
                data: decrypted,
                metadata: {
                    algorithm: 'aes',
                    originalSize: encryptedData.length,
                    encryptedSize: decrypted.length,
                    timestamp: Date.now()
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'AES decryption failed'
            };
        }
    }

    static encryptText(text: string, password: string): EncryptionResult {
        const data = Buffer.from(text, 'utf8');
        return this.encrypt(data, { algorithm: 'aes', password });
    }

    static decryptText(encryptedData: Buffer, password: string): EncryptionResult {
        const result = this.decrypt(encryptedData, { algorithm: 'aes', password });
        if (result.success && result.data) {
            return {
                ...result,
                data: result.data.toString('utf8')
            };
        }
        return result;
    }

    private static deriveKeyFromPassword(password: string): Buffer {
        const { pbkdf2Sync } = require('crypto');
        const salt = Buffer.from('encryptz-aes-salt', 'utf8');
        return pbkdf2Sync(password, salt, 100000, this.KEY_LENGTH, 'sha512');
    }
}

// Instance-based wrapper for test compatibility
export class AesEncryption {
    private defaultPassword: string = 'default-test-password-123!';

    encrypt(text: string, password?: string): string {
        const pwd = password || this.defaultPassword;
        const result = AESEncryption.encryptText(text, pwd);
        if (result.success && result.data) {
            return (result.data as Buffer).toString('base64');
        }
        throw new Error(result.error || 'Encryption failed');
    }

    decrypt(encryptedText: string, password?: string): string {
        const pwd = password || this.defaultPassword;
        const buffer = Buffer.from(encryptedText, 'base64');
        const result = AESEncryption.decryptText(buffer, pwd);
        if (result.success && result.data) {
            return result.data as string;
        }
        throw new Error(result.error || 'Decryption failed');
    }
}