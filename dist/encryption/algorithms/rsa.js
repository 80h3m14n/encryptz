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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RSAEncryption = void 0;
const crypto = __importStar(require("crypto"));
const node_rsa_1 = __importDefault(require("node-rsa"));
class RSAEncryption {
    static generateKeyPair() {
        const key = new node_rsa_1.default({ b: this.KEY_SIZE });
        return {
            publicKey: key.exportKey('public'),
            privateKey: key.exportKey('private')
        };
    }
    static encrypt(data, options) {
        try {
            // For RSA, we'll use hybrid encryption for large files
            // Generate AES key for data encryption
            const aesKey = crypto.randomBytes(32);
            const iv = crypto.randomBytes(16);
            // Encrypt data with AES
            const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv);
            let encryptedData = cipher.update(data);
            encryptedData = Buffer.concat([encryptedData, cipher.final()]);
            // Generate RSA key pair if not provided
            const keyPair = this.generateKeyPair();
            const rsaKey = new node_rsa_1.default(keyPair.publicKey);
            // Encrypt AES key with RSA
            const encryptedAESKey = rsaKey.encrypt(aesKey);
            // Combine encrypted AES key, IV, and encrypted data
            const result = Buffer.concat([
                Buffer.from(JSON.stringify({
                    encryptedKey: encryptedAESKey.toString('base64'),
                    iv: iv.toString('base64'),
                    privateKey: keyPair.privateKey
                }), 'utf8'),
                Buffer.from(':::SEPARATOR:::', 'utf8'),
                encryptedData
            ]);
            return {
                success: true,
                data: result,
                metadata: {
                    algorithm: 'rsa',
                    originalSize: data.length,
                    encryptedSize: result.length,
                    timestamp: Date.now()
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'RSA encryption failed'
            };
        }
    }
    static decrypt(encryptedData, options) {
        try {
            const separator = Buffer.from(':::SEPARATOR:::', 'utf8');
            const separatorIndex = encryptedData.indexOf(separator);
            if (separatorIndex === -1) {
                throw new Error('Invalid encrypted data format');
            }
            const metadataBuffer = encryptedData.slice(0, separatorIndex);
            const encryptedContent = encryptedData.slice(separatorIndex + separator.length);
            const metadata = JSON.parse(metadataBuffer.toString('utf8'));
            // Decrypt AES key with RSA
            const rsaKey = new node_rsa_1.default(metadata.privateKey);
            const aesKey = rsaKey.decrypt(Buffer.from(metadata.encryptedKey, 'base64'));
            const iv = Buffer.from(metadata.iv, 'base64');
            // Decrypt data with AES
            const decipher = crypto.createDecipheriv('aes-256-cbc', aesKey, iv);
            let decryptedData = decipher.update(encryptedContent);
            decryptedData = Buffer.concat([decryptedData, decipher.final()]);
            return {
                success: true,
                data: decryptedData,
                metadata: {
                    algorithm: 'rsa',
                    originalSize: encryptedData.length,
                    encryptedSize: decryptedData.length,
                    timestamp: Date.now()
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'RSA decryption failed'
            };
        }
    }
    static encryptText(text) {
        const data = Buffer.from(text, 'utf8');
        return this.encrypt(data, { algorithm: 'rsa' });
    }
    static decryptText(encryptedData) {
        const result = this.decrypt(encryptedData, { algorithm: 'rsa' });
        if (result.success && result.data) {
            return {
                ...result,
                data: result.data.toString('utf8')
            };
        }
        return result;
    }
}
exports.RSAEncryption = RSAEncryption;
RSAEncryption.KEY_SIZE = 2048;
// Legacy class for backward compatibility
class RsaEncryption {
    constructor() {
        const keyPair = RSAEncryption.generateKeyPair();
        this.publicKey = keyPair.publicKey;
        this.privateKey = keyPair.privateKey;
    }
    async encrypt(data) {
        const result = RSAEncryption.encryptText(data);
        if (result.success && result.data) {
            return result.data.toString('base64');
        }
        throw new Error(result.error || 'Encryption failed');
    }
    async decrypt(encryptedData) {
        const buffer = Buffer.from(encryptedData, 'base64');
        const result = RSAEncryption.decryptText(buffer);
        if (result.success && result.data) {
            return result.data;
        }
        throw new Error(result.error || 'Decryption failed');
    }
}
exports.default = RsaEncryption;
//# sourceMappingURL=rsa.js.map