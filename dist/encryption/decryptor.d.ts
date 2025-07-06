import { EncryptionAlgorithm, EncryptionOptions, EncryptionResult, ProgressCallback } from '../types';
export declare class Decryptor {
    private fileReader;
    private fileWriter;
    private scanner;
    constructor();
    decryptText(encryptedText: string, algorithm: EncryptionAlgorithm, password?: string): Promise<EncryptionResult>;
    decryptFile(filePath: string, options: EncryptionOptions, progressCallback?: ProgressCallback): Promise<EncryptionResult>;
    decryptDirectory(directoryPath: string, options: EncryptionOptions, progressCallback?: ProgressCallback): Promise<EncryptionResult>;
    private decryptData;
    decryptMultipleFiles(filePaths: string[], options: EncryptionOptions, progressCallback?: ProgressCallback): Promise<EncryptionResult[]>;
}
export default Decryptor;
//# sourceMappingURL=decryptor.d.ts.map