import * as crypto from 'crypto';
import NodeRSA from 'node-rsa';
import { EncryptionResult, EncryptionOptions } from '../../types';


export class RSAEncryption {
    private static readonly KEY_SIZE = 2048;

    static generateKeyPair(): { publicKey: string; privateKey: string } {
        const key = new NodeRSA({ b: this.KEY_SIZE });
        return {
            publicKey: key.exportKey('public'),
            privateKey: key.exportKey('private')
        };
    }

    static encrypt(data: Buffer, options: EncryptionOptions): EncryptionResult {
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
            const rsaKey = new NodeRSA(keyPair.publicKey);
            
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
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'RSA encryption failed'
            };
        }
    }

    static decrypt(encryptedData: Buffer, options: EncryptionOptions): EncryptionResult {
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
            const rsaKey = new NodeRSA(metadata.privateKey);
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
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'RSA decryption failed'
            };
        }
    }

    static encryptText(text: string): EncryptionResult {
        const data = Buffer.from(text, 'utf8');
        return this.encrypt(data, { algorithm: 'rsa' });
    }

    static decryptText(encryptedData: Buffer): EncryptionResult {
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

// Legacy class for backward compatibility
class RsaEncryption {
    private publicKey: string;
    private privateKey: string;

    constructor() {
        const keyPair = RSAEncryption.generateKeyPair();
        this.publicKey = keyPair.publicKey;
        this.privateKey = keyPair.privateKey;
    }

    async encrypt(data: string): Promise<string> {
        const result = RSAEncryption.encryptText(data);
        if (result.success && result.data) {
            return result.data.toString('base64');
        }
        throw new Error(result.error || 'Encryption failed');
    }

    async decrypt(encryptedData: string): Promise<string> {
        const buffer = Buffer.from(encryptedData, 'base64');
        const result = RSAEncryption.decryptText(buffer);
        if (result.success && result.data) {
            return result.data as string;
        }
        throw new Error(result.error || 'Decryption failed');
    }
}

export default RsaEncryption;