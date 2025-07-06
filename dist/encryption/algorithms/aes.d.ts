import { EncryptionResult, EncryptionOptions } from '../../types';
export declare class AESEncryption {
    private static readonly ALGORITHM;
    private static readonly KEY_LENGTH;
    private static readonly IV_LENGTH;
    private static readonly TAG_LENGTH;
    static encrypt(data: Buffer, options: EncryptionOptions): EncryptionResult;
    static decrypt(encryptedData: Buffer, options: EncryptionOptions): EncryptionResult;
    static encryptText(text: string, password: string): EncryptionResult;
    static decryptText(encryptedData: Buffer, password: string): EncryptionResult;
    private static deriveKeyFromPassword;
}
export declare class AesEncryption {
    private defaultPassword;
    encrypt(text: string, password?: string): string;
    decrypt(encryptedText: string, password?: string): string;
}
//# sourceMappingURL=aes.d.ts.map