"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChaCha20Encryption = exports.ChaCha20EncryptionInstance = exports.ChaCha20EncryptionStatic = void 0;
const crypto = __importStar(require("crypto"));
class ChaCha20EncryptionStatic {
    static encrypt(data, options) {
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
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'ChaCha20 encryption failed'
            };
        }
    }
    static decrypt(encryptedData, options) {
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
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'ChaCha20 decryption failed'
            };
        }
    }
    static encryptText(text, password) {
        const data = Buffer.from(text, 'utf8');
        return this.encrypt(data, { algorithm: 'chacha20', password });
    }
    static decryptText(encryptedData, password) {
        const result = this.decrypt(encryptedData, { algorithm: 'chacha20', password });
        if (result.success && result.data) {
            return {
                ...result,
                data: result.data.toString('utf8')
            };
        }
        return result;
    }
    static deriveKeyFromPassword(password) {
        const salt = Buffer.from('encryptz-chacha20-salt', 'utf8');
        return crypto.pbkdf2Sync(password, salt, 100000, this.KEY_LENGTH, 'sha512');
    }
}
exports.ChaCha20EncryptionStatic = ChaCha20EncryptionStatic;
ChaCha20EncryptionStatic.ALGORITHM = 'chacha20-poly1305';
ChaCha20EncryptionStatic.KEY_LENGTH = 32;
ChaCha20EncryptionStatic.NONCE_LENGTH = 12;
ChaCha20EncryptionStatic.TAG_LENGTH = 16;
// Instance-based wrapper for test compatibility
class ChaCha20EncryptionInstance {
    constructor() {
        this.defaultPassword = 'default-test-password-123!';
    }
    encrypt(text, password) {
        const pwd = password || this.defaultPassword;
        const result = ChaCha20EncryptionStatic.encryptText(text, pwd);
        if (result.success && result.data) {
            return result.data.toString('base64');
        }
        throw new Error(result.error || 'Encryption failed');
    }
    decrypt(encryptedText, password) {
        const pwd = password || this.defaultPassword;
        const buffer = Buffer.from(encryptedText, 'base64');
        const result = ChaCha20EncryptionStatic.decryptText(buffer, pwd);
        if (result.success && result.data) {
            return result.data;
        }
        throw new Error(result.error || 'Decryption failed');
    }
}
exports.ChaCha20EncryptionInstance = ChaCha20EncryptionInstance;
exports.ChaCha20Encryption = ChaCha20EncryptionInstance;
// Legacy class for backward compatibility
class ChaCha20EncryptionLegacy {
    constructor(key, nonce) {
        this.key = key;
        this.nonce = nonce;
    }
    encrypt(data) {
        const password = Buffer.from(this.key).toString('base64');
        const result = ChaCha20EncryptionStatic.encryptText(data, password);
        if (result.success && result.data) {
            return result.data.toString('base64');
        }
        throw new Error(result.error || 'Encryption failed');
    }
    decrypt(encryptedData) {
        const password = Buffer.from(this.key).toString('base64');
        const buffer = Buffer.from(encryptedData, 'base64');
        const result = ChaCha20EncryptionStatic.decryptText(buffer, password);
        if (result.success && result.data) {
            return result.data;
        }
        throw new Error(result.error || 'Decryption failed');
    }
}
exports.default = ChaCha20EncryptionLegacy;
//# sourceMappingURL=chacha20.js.map