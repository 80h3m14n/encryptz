import { ProgressCallback } from '../types';
export interface CommandLineOptions {
    inputFile: string;
    outputFile: string;
    algorithm: string;
    action: 'encrypt' | 'decrypt';
}
export declare class CLIInterface {
    private static spinner;
    static showWelcome(): void;
    static showHelp(): void;
    static showError(message: string): void;
    static showSuccess(message: string): void;
    static showWarning(message: string): void;
    static showInfo(message: string): void;
    static startSpinner(text: string): void;
    static updateSpinner(text: string): void;
    static stopSpinner(): void;
    static createProgressCallback(): ProgressCallback;
    static showFileInfo(filePath: string, size: number, algorithm: string): void;
    static showEncryptionResult(originalPath: string, outputPath: string, originalSize: number, encryptedSize: number): void;
    static showDecryptionResult(originalPath: string, outputPath: string, encryptedSize: number, decryptedSize: number): void;
    static showDirectoryResult(action: string, inputPath: string, outputPath: string, processedFiles: number, totalSize: number): void;
    static promptPassword(): Promise<string>;
    static clearScreen(): void;
    static showBanner(): void;
}
//# sourceMappingURL=interface.d.ts.map