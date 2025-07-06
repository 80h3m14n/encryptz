import * as path from 'path';
import { AESEncryption } from './algorithms/aes';
import { RSAEncryption } from './algorithms/rsa';
import { ChaCha20EncryptionStatic } from './algorithms/chacha20';
import { FileReader } from '../file-handlers/file-reader';
import { FileWriter } from '../file-handlers/file-writer';
import { DirectoryScanner } from '../file-handlers/directory-scanner';
import { EncryptionAlgorithm, EncryptionOptions, EncryptionResult, FileInfo, ProgressCallback } from '../types';
import { generateOutputPath } from '../utils/helpers';
import { validateFilePath, validateDirectoryPath } from '../utils/validation';

export class Decryptor {
    private fileReader: FileReader;
    private fileWriter: FileWriter;
    private scanner: DirectoryScanner;

    constructor() {
        this.fileReader = new FileReader();
        this.fileWriter = new FileWriter();
        this.scanner = new DirectoryScanner();
    }

    async decryptText(encryptedText: string, algorithm: EncryptionAlgorithm, password?: string): Promise<EncryptionResult> {
        try {
            const encryptedBuffer = Buffer.from(encryptedText, 'base64');
            
            switch (algorithm) {
                case 'aes':
                    if (!password) throw new Error('Password is required for AES decryption');
                    return AESEncryption.decryptText(encryptedBuffer, password);
                case 'rsa':
                    return RSAEncryption.decryptText(encryptedBuffer);
                case 'chacha20':
                    if (!password) throw new Error('Password is required for ChaCha20 decryption');
                    return ChaCha20EncryptionStatic.decryptText(encryptedBuffer, password);
                default:
                    return { success: false, error: 'Unsupported decryption algorithm' };
            }
        } catch (error) {
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'Text decryption failed' 
            };
        }
    }

    async decryptFile(filePath: string, options: EncryptionOptions, progressCallback?: ProgressCallback): Promise<EncryptionResult> {
        try {
            if (!validateFilePath(filePath)) {
                return { success: false, error: `File does not exist: ${filePath}` };
            }

            // Read encrypted file data
            const encryptedData = await this.fileReader.readFile(filePath);
            const fileInfo = await this.fileReader.getFileInfo(filePath);

            if (progressCallback) {
                progressCallback(0, 100, fileInfo.name);
            }

            // Decrypt data
            const decryptionResult = await this.decryptData(encryptedData, options);
            
            if (!decryptionResult.success) {
                return decryptionResult;
            }

            if (progressCallback) {
                progressCallback(50, 100, fileInfo.name);
            }

            // Determine output path
            let outputPath = options.outputPath;
            if (!outputPath) {
                // Remove .encrypted extension if present
                if (filePath.endsWith('.encrypted')) {
                    outputPath = filePath.replace('.encrypted', '');
                } else {
                    outputPath = generateOutputPath(filePath, '.decrypted');
                }
            }
            
            // Write decrypted data
            await this.fileWriter.writeFile(outputPath, decryptionResult.data as Buffer);

            if (progressCallback) {
                progressCallback(100, 100, fileInfo.name);
            }

            return {
                success: true,
                data: outputPath,
                metadata: {
                    algorithm: options.algorithm,
                    originalSize: fileInfo.size,
                    encryptedSize: (decryptionResult.data as Buffer).length,
                    timestamp: decryptionResult.metadata?.timestamp || Date.now()
                }
            };
        } catch (error) {
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'File decryption failed' 
            };
        }
    }

    async decryptDirectory(directoryPath: string, options: EncryptionOptions, progressCallback?: ProgressCallback): Promise<EncryptionResult> {
        try {
            if (!validateDirectoryPath(directoryPath)) {
                return { success: false, error: `Directory does not exist: ${directoryPath}` };
            }

            const files = await this.scanner.scanDirectory(directoryPath, true);
            const encryptedFiles = files.filter(f => !f.isDirectory && f.name.endsWith('.encrypted'));
            
            const outputDir = options.outputPath || `${directoryPath}_decrypted`;
            await this.fileWriter.createDirectory(outputDir);

            const results: EncryptionResult[] = [];
            let processed = 0;

            for (const file of encryptedFiles) {
                const relativePath = path.relative(directoryPath, file.path);
                const outputPath = path.join(outputDir, relativePath.replace('.encrypted', ''));
                
                const fileOptions = { ...options, outputPath };
                const result = await this.decryptFile(file.path, fileOptions, (current, total, fileName) => {
                    if (progressCallback) {
                        const overallProgress = Math.round(((processed + current / total) / encryptedFiles.length) * 100);
                        progressCallback(overallProgress, 100, fileName);
                    }
                });

                results.push(result);
                processed++;
            }

            const successCount = results.filter(r => r.success).length;
            const totalSize = results.reduce((sum, r) => sum + (r.metadata?.originalSize || 0), 0);
            const decryptedSize = results.reduce((sum, r) => sum + (r.metadata?.encryptedSize || 0), 0);

            return {
                success: successCount === encryptedFiles.length,
                data: outputDir,
                metadata: {
                    algorithm: options.algorithm,
                    originalSize: totalSize,
                    encryptedSize: decryptedSize,
                    timestamp: Date.now()
                }
            };
        } catch (error) {
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'Directory decryption failed' 
            };
        }
    }

    private async decryptData(data: Buffer, options: EncryptionOptions): Promise<EncryptionResult> {
        switch (options.algorithm) {
            case 'aes':
                return AESEncryption.decrypt(data, options);
            case 'rsa':
                return RSAEncryption.decrypt(data, options);
            case 'chacha20':
                return ChaCha20EncryptionStatic.decrypt(data, options);
            default:
                return { success: false, error: 'Unsupported decryption algorithm' };
        }
    }

    async decryptMultipleFiles(filePaths: string[], options: EncryptionOptions, progressCallback?: ProgressCallback): Promise<EncryptionResult[]> {
        const results: EncryptionResult[] = [];
        
        for (let i = 0; i < filePaths.length; i++) {
            const filePath = filePaths[i];
            const result = await this.decryptFile(filePath, options, (current, total, fileName) => {
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

export default Decryptor;