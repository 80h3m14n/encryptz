import * as path from 'path';
import { AESEncryption } from './algorithms/aes';
import { RSAEncryption } from './algorithms/rsa';
import { ChaCha20EncryptionStatic } from './algorithms/chacha20';
import { FileReader } from '../file-handlers/file-reader';
import { FileWriter } from '../file-handlers/file-writer';
import { DirectoryScanner } from '../file-handlers/directory-scanner';
import { EncryptionAlgorithm, EncryptionOptions, EncryptionResult, FileInfo, ProgressCallback } from '../types';
import { generateOutputPath, createProgressBar } from '../utils/helpers';
import { validateFilePath, validateDirectoryPath, validatePassword } from '../utils/validation';

export class Encryptor {
    private fileReader: FileReader;
    private fileWriter: FileWriter;
    private scanner: DirectoryScanner;

    constructor() {
        this.fileReader = new FileReader();
        this.fileWriter = new FileWriter();
        this.scanner = new DirectoryScanner();
    }

    async encryptText(text: string, algorithm: EncryptionAlgorithm, password?: string): Promise<EncryptionResult> {
        try {
            switch (algorithm) {
                case 'aes':
                    if (!password) throw new Error('Password is required for AES encryption');
                    return AESEncryption.encryptText(text, password);
                case 'rsa':
                    return RSAEncryption.encryptText(text);
                case 'chacha20':
                    if (!password) throw new Error('Password is required for ChaCha20 encryption');
                    return ChaCha20EncryptionStatic.encryptText(text, password);
                default:
                    return { success: false, error: 'Unsupported encryption algorithm' };
            }
        } catch (error) {
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'Text encryption failed' 
            };
        }
    }

    async encryptFile(filePath: string, options: EncryptionOptions, progressCallback?: ProgressCallback): Promise<EncryptionResult> {
        try {
            if (!validateFilePath(filePath)) {
                return { success: false, error: `File does not exist: ${filePath}` };
            }

            if (options.password) {
                const passwordValidation = validatePassword(options.password);
                if (!passwordValidation.valid) {
                    return { success: false, error: passwordValidation.message };
                }
            }

            // Read file data
            const fileData = await this.fileReader.readFile(filePath);
            const fileInfo = await this.fileReader.getFileInfo(filePath);

            if (progressCallback) {
                progressCallback(0, 100, fileInfo.name);
            }

            // Encrypt data
            const encryptionResult = await this.encryptData(fileData, options);
            
            if (!encryptionResult.success) {
                return encryptionResult;
            }

            if (progressCallback) {
                progressCallback(50, 100, fileInfo.name);
            }

            // Determine output path
            const outputPath = options.outputPath || generateOutputPath(filePath, '.encrypted');
            
            // Write encrypted data
            await this.fileWriter.writeFile(outputPath, encryptionResult.data as Buffer);

            if (progressCallback) {
                progressCallback(100, 100, fileInfo.name);
            }

            return {
                success: true,
                data: outputPath,
                metadata: {
                    algorithm: options.algorithm,
                    originalSize: fileInfo.size,
                    encryptedSize: (encryptionResult.data as Buffer).length,
                    timestamp: encryptionResult.metadata?.timestamp || Date.now()
                }
            };
        } catch (error) {
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'File encryption failed' 
            };
        }
    }


    async encryptDirectory(directoryPath: string, options: EncryptionOptions, progressCallback?: ProgressCallback): Promise<EncryptionResult> {
        try {
            if (!validateDirectoryPath(directoryPath)) {
                return { success: false, error: `Directory does not exist: ${directoryPath}` };
            }

            const files = await this.scanner.scanDirectory(directoryPath, true);
            const fileFiles = files.filter(f => !f.isDirectory);
            
            const outputDir = options.outputPath || `${directoryPath}_encrypted`;
            await this.fileWriter.createDirectory(outputDir);

            const results: EncryptionResult[] = [];
            let processed = 0;

            for (const file of fileFiles) {
                const relativePath = path.relative(directoryPath, file.path);
                const outputPath = path.join(outputDir, relativePath + '.encrypted');
                
                const fileOptions = { ...options, outputPath };
                const result = await this.encryptFile(file.path, fileOptions, (current, total, fileName) => {
                    if (progressCallback) {
                        const overallProgress = Math.round(((processed + current / total) / fileFiles.length) * 100);
                        progressCallback(overallProgress, 100, fileName);
                    }
                });

                results.push(result);
                processed++;
            }

            const successCount = results.filter(r => r.success).length;
            const totalSize = results.reduce((sum, r) => sum + (r.metadata?.originalSize || 0), 0);
            const encryptedSize = results.reduce((sum, r) => sum + (r.metadata?.encryptedSize || 0), 0);

            return {
                success: successCount === fileFiles.length,
                data: outputDir,
                metadata: {
                    algorithm: options.algorithm,
                    originalSize: totalSize,
                    encryptedSize: encryptedSize,
                    timestamp: Date.now()
                }
            };
        } catch (error) {
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'Directory encryption failed' 
            };
        }
    }

    private async encryptData(data: Buffer, options: EncryptionOptions): Promise<EncryptionResult> {
        switch (options.algorithm) {
            case 'aes':
                return AESEncryption.encrypt(data, options);
            case 'rsa':
                return RSAEncryption.encrypt(data, options);
            case 'chacha20':
                return ChaCha20EncryptionStatic.encrypt(data, options);
            default:
                return { success: false, error: 'Unsupported encryption algorithm' };
        }
    }

    async encryptMultipleFiles(filePaths: string[], options: EncryptionOptions, progressCallback?: ProgressCallback): Promise<EncryptionResult[]> {
        const results: EncryptionResult[] = [];
        
        for (let i = 0; i < filePaths.length; i++) {
            const filePath = filePaths[i];
            const result = await this.encryptFile(filePath, options, (current, total, fileName) => {
                if (progressCallback) {
                    const overallProgress = Math.round(((i + current / total) / filePaths.length) * 100);
                    progressCallback(overallProgress, 100, fileName);
                }
            });
            results.push(result);
        }

        return results;
    }
}

export default Encryptor;