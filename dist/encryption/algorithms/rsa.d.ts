import { EncryptionResult, EncryptionOptions } from '../../types';
export declare class RSAEncryption {
    private static readonly KEY_SIZE;
    static generateKeyPair(): {
        publicKey: string;
        privateKey: string;
    };
    static encrypt(data: Buffer, options: EncryptionOptions): EncryptionResult;
    static decrypt(encryptedData: Buffer, options: EncryptionOptions): EncryptionResult;
    static encryptText(text: string): EncryptionResult;
    static decryptText(encryptedData: Buffer): EncryptionResult;
}
declare class RsaEncryption {
    private publicKey;
    private privateKey;
    constructor();
    encrypt(data: string): Promise<string>;
    decrypt(encryptedData: string): Promise<string>;
}
export default RsaEncryption;
//# sourceMappingURL=rsa.d.ts.map