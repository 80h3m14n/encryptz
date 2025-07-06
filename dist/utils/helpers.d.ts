import { FileInfo } from '../types';
export declare function generateRandomKey(length: number): string;
export declare function formatOutput(data: string): string;
export declare function generateSecureKey(length?: number): Buffer;
export declare function deriveKeyFromPassword(password: string, salt: Buffer): Buffer;
export declare function formatFileSize(bytes: number): string;
export declare function getFileExtension(filePath: string): string;
export declare function generateOutputPath(inputPath: string, suffix: string): string;
export declare function createFileInfo(filePath: string, stats: any): FileInfo;
export declare function isTextFile(filePath: string): boolean;
export declare function createProgressBar(current: number, total: number, fileName?: string): string;
//# sourceMappingURL=helpers.d.ts.map