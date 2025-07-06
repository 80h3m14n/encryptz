import { EncryptionResult, EncryptionOptions } from '../../types';
export declare class ChaCha20EncryptionStatic {
    private static readonly ALGORITHM;
    private static readonly KEY_LENGTH;
    private static readonly NONCE_LENGTH;
    private static readonly TAG_LENGTH;
    static encrypt(data: Buffer, options: EncryptionOptions): EncryptionResult;
    static decrypt(encryptedData: Buffer, options: EncryptionOptions): EncryptionResult;
    static encryptText(text: string, password: string): EncryptionResult;
    static decryptText(encryptedData: Buffer, password: string): EncryptionResult;
    private static deriveKeyFromPassword;
}
export declare class ChaCha20EncryptionInstance {
    private defaultPassword;
    encrypt(text: string, password?: string): string;
    decrypt(encryptedText: string, password?: string): string;
}
export { ChaCha20EncryptionInstance as ChaCha20Encryption };
declare class ChaCha20EncryptionLegacy {
    private key;
    private nonce;
    constructor(key: Uint8Array, nonce: Uint8Array);
    encrypt(data: string): string;
    decrypt(encryptedData: string): string;
}
export default ChaCha20EncryptionLegacy;
//# sourceMappingURL=chacha20.d.ts.map