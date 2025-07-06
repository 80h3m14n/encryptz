"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Decryptor = void 0;
const path = __importStar(require("path"));
const aes_1 = require("./algorithms/aes");
const rsa_1 = require("./algorithms/rsa");
const chacha20_1 = require("./algorithms/chacha20");
const file_reader_1 = require("../file-handlers/file-reader");
const file_writer_1 = require("../file-handlers/file-writer");
const directory_scanner_1 = require("../file-handlers/directory-scanner");
const helpers_1 = require("../utils/helpers");
const validation_1 = require("../utils/validation");
class Decryptor {
    constructor() {
        this.fileReader = new file_reader_1.FileReader();
        this.fileWriter = new file_writer_1.FileWriter();
        this.scanner = new directory_scanner_1.DirectoryScanner();
    }
    async decryptText(encryptedText, algorithm, password) {
        try {
            const encryptedBuffer = Buffer.from(encryptedText, 'base64');
            switch (algorithm) {
                case 'aes':
                    if (!password)
                        throw new Error('Password is required for AES decryption');
                    return aes_1.AESEncryption.decryptText(encryptedBuffer, password);
                case 'rsa':
                    return rsa_1.RSAEncryption.decryptText(encryptedBuffer);
                case 'chacha20':
                    if (!password)
                        throw new Error('Password is required for ChaCha20 decryption');
                    return chacha20_1.ChaCha20EncryptionStatic.decryptText(encryptedBuffer, password);
                default:
                    return { success: false, error: 'Unsupported decryption algorithm' };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Text decryption failed'
            };
        }
    }
    async decryptFile(filePath, options, progressCallback) {
        var _a;
        try {
            if (!(0, validation_1.validateFilePath)(filePath)) {
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
                }
                else {
                    outputPath = (0, helpers_1.generateOutputPath)(filePath, '.decrypted');
                }
            }
            // Write decrypted data
            await this.fileWriter.writeFile(outputPath, decryptionResult.data);
            if (progressCallback) {
                progressCallback(100, 100, fileInfo.name);
            }
            return {
                success: true,
                data: outputPath,
                metadata: {
                    algorithm: options.algorithm,
                    originalSize: fileInfo.size,
                    encryptedSize: decryptionResult.data.length,
                    timestamp: ((_a = decryptionResult.metadata) === null || _a === void 0 ? void 0 : _a.timestamp) || Date.now()
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'File decryption failed'
            };
        }
    }
    async decryptDirectory(directoryPath, options, progressCallback) {
        try {
            if (!(0, validation_1.validateDirectoryPath)(directoryPath)) {
                return { success: false, error: `Directory does not exist: ${directoryPath}` };
            }
            const files = await this.scanner.scanDirectory(directoryPath, true);
            const encryptedFiles = files.filter(f => !f.isDirectory && f.name.endsWith('.encrypted'));
            const outputDir = options.outputPath || `${directoryPath}_decrypted`;
            await this.fileWriter.createDirectory(outputDir);
            const results = [];
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
            const totalSize = results.reduce((sum, r) => { var _a; return sum + (((_a = r.metadata) === null || _a === void 0 ? void 0 : _a.originalSize) || 0); }, 0);
            const decryptedSize = results.reduce((sum, r) => { var _a; return sum + (((_a = r.metadata) === null || _a === void 0 ? void 0 : _a.encryptedSize) || 0); }, 0);
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
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Directory decryption failed'
            };
        }
    }
    async decryptData(data, options) {
        switch (options.algorithm) {
            case 'aes':
                return aes_1.AESEncryption.decrypt(data, options);
            case 'rsa':
                return rsa_1.RSAEncryption.decrypt(data, options);
            case 'chacha20':
                return chacha20_1.ChaCha20EncryptionStatic.decrypt(data, options);
            default:
                return { success: false, error: 'Unsupported decryption algorithm' };
        }
    }
    async decryptMultipleFiles(filePaths, options, progressCallback) {
        const results = [];
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
exports.Decryptor = Decryptor;
exports.default = Decryptor;
//# sourceMappingURL=decryptor.js.map