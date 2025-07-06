import { EncryptionAlgorithm, EncryptionOptions, EncryptionResult, ProgressCallback } from '../types';
export declare class Encryptor {
    private fileReader;
    private fileWriter;
    private scanner;
    constructor();
    encryptText(text: string, algorithm: EncryptionAlgorithm, password?: string): Promise<EncryptionResult>;
    encryptFile(filePath: string, options: EncryptionOptions, progressCallback?: ProgressCallback): Promise<EncryptionResult>;
    encryptDirectory(directoryPath: string, options: EncryptionOptions, progressCallback?: ProgressCallback): Promise<EncryptionResult>;
    private encryptData;
    encryptMultipleFiles(filePaths: string[], options: EncryptionOptions, progressCallback?: ProgressCallback): Promise<EncryptionResult[]>;
}
export default Encryptor;
//# sourceMappingURL=encryptor.d.ts.map