"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AesEncryption = exports.AESEncryption = void 0;
const crypto_1 = require("crypto");
class AESEncryption {
    static encrypt(data, options) {
        try {
            const key = options.password ?
                this.deriveKeyFromPassword(options.password) :
                (0, crypto_1.randomBytes)(this.KEY_LENGTH);
            const iv = (0, crypto_1.randomBytes)(this.IV_LENGTH);
            const cipher = (0, crypto_1.createCipheriv)(this.ALGORITHM, key, iv);
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
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'AES encryption failed'
            };
        }
    }
    static decrypt(encryptedData, options) {
        try {
            if (!options.password) {
                throw new Error('Password is required for AES decryption');
            }
            const key = this.deriveKeyFromPassword(options.password);
            // Extract IV, tag, and encrypted data
            const iv = encryptedData.slice(0, this.IV_LENGTH);
            const tag = encryptedData.slice(this.IV_LENGTH, this.IV_LENGTH + this.TAG_LENGTH);
            const encrypted = encryptedData.slice(this.IV_LENGTH + this.TAG_LENGTH);
            const decipher = (0, crypto_1.createDecipheriv)(this.ALGORITHM, key, iv);
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
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'AES decryption failed'
            };
        }
    }
    static encryptText(text, password) {
        const data = Buffer.from(text, 'utf8');
        return this.encrypt(data, { algorithm: 'aes', password });
    }
    static decryptText(encryptedData, password) {
        const result = this.decrypt(encryptedData, { algorithm: 'aes', password });
        if (result.success && result.data) {
            return {
                ...result,
                data: result.data.toString('utf8')
            };
        }
        return result;
    }
    static deriveKeyFromPassword(password) {
        const { pbkdf2Sync } = require('crypto');
        const salt = Buffer.from('encryptz-aes-salt', 'utf8');
        return pbkdf2Sync(password, salt, 100000, this.KEY_LENGTH, 'sha512');
    }
}
exports.AESEncryption = AESEncryption;
AESEncryption.ALGORITHM = 'aes-256-gcm';
AESEncryption.KEY_LENGTH = 32;
AESEncryption.IV_LENGTH = 16;
AESEncryption.TAG_LENGTH = 16;
// Instance-based wrapper for test compatibility
class AesEncryption {
    constructor() {
        this.defaultPassword = 'default-test-password-123!';
    }
    encrypt(text, password) {
        const pwd = password || this.defaultPassword;
        const result = AESEncryption.encryptText(text, pwd);
        if (result.success && result.data) {
            return result.data.toString('base64');
        }
        throw new Error(result.error || 'Encryption failed');
    }
    decrypt(encryptedText, password) {
        const pwd = password || this.defaultPassword;
        const buffer = Buffer.from(encryptedText, 'base64');
        const result = AESEncryption.decryptText(buffer, pwd);
        if (result.success && result.data) {
            return result.data;
        }
        throw new Error(result.error || 'Decryption failed');
    }
}
exports.AesEncryption = AesEncryption;
//# sourceMappingURL=aes.js.map