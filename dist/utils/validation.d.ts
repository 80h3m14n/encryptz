import { EncryptionAlgorithm } from '../types';
export declare function validateFilePath(filePath: string): boolean;
export declare function validateAlgorithm(algorithm: string): boolean;
export declare function validatePassword(password: string): {
    valid: boolean;
    message?: string;
};
export declare function validateOutputPath(outputPath: string): boolean;
export declare function validateDirectoryPath(dirPath: string): boolean;
export declare function isValidEncryptionAlgorithm(algorithm: string): algorithm is EncryptionAlgorithm;
export declare function validateFileSize(filePath: string, maxSize?: number): boolean;
//# sourceMappingURL=validation.d.ts.map