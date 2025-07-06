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
exports.Encryptor = void 0;
const path = __importStar(require("path"));
const aes_1 = require("./algorithms/aes");
const rsa_1 = require("./algorithms/rsa");
const chacha20_1 = require("./algorithms/chacha20");
const file_reader_1 = require("../file-handlers/file-reader");
const file_writer_1 = require("../file-handlers/file-writer");
const directory_scanner_1 = require("../file-handlers/directory-scanner");
const helpers_1 = require("../utils/helpers");
const validation_1 = require("../utils/validation");
class Encryptor {
    constructor() {
        this.fileReader = new file_reader_1.FileReader();
        this.fileWriter = new file_writer_1.FileWriter();
        this.scanner = new directory_scanner_1.DirectoryScanner();
    }
    async encryptText(text, algorithm, password) {
        try {
            switch (algorithm) {
                case 'aes':
                    if (!password)
                        throw new Error('Password is required for AES encryption');
                    return aes_1.AESEncryption.encryptText(text, password);
                case 'rsa':
                    return rsa_1.RSAEncryption.encryptText(text);
                case 'chacha20':
                    if (!password)
                        throw new Error('Password is required for ChaCha20 encryption');
                    return chacha20_1.ChaCha20EncryptionStatic.encryptText(text, password);
                default:
                    return { success: false, error: 'Unsupported encryption algorithm' };
            }
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Text encryption failed'
            };
        }
    }
    async encryptFile(filePath, options, progressCallback) {
        var _a;
        try {
            if (!(0, validation_1.validateFilePath)(filePath)) {
                return { success: false, error: `File does not exist: ${filePath}` };
            }
            if (options.password) {
                const passwordValidation = (0, validation_1.validatePassword)(options.password);
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
            const outputPath = options.outputPath || (0, helpers_1.generateOutputPath)(filePath, '.encrypted');
            // Write encrypted data
            await this.fileWriter.writeFile(outputPath, encryptionResult.data);
            if (progressCallback) {
                progressCallback(100, 100, fileInfo.name);
            }
            return {
                success: true,
                data: outputPath,
                metadata: {
                    algorithm: options.algorithm,
                    originalSize: fileInfo.size,
                    encryptedSize: encryptionResult.data.length,
                    timestamp: ((_a = encryptionResult.metadata) === null || _a === void 0 ? void 0 : _a.timestamp) || Date.now()
                }
            };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'File encryption failed'
            };
        }
    }
    async encryptDirectory(directoryPath, options, progressCallback) {
        try {
            if (!(0, validation_1.validateDirectoryPath)(directoryPath)) {
                return { success: false, error: `Directory does not exist: ${directoryPath}` };
            }
            const files = await this.scanner.scanDirectory(directoryPath, true);
            const fileFiles = files.filter(f => !f.isDirectory);
            const outputDir = options.outputPath || `${directoryPath}_encrypted`;
            await this.fileWriter.createDirectory(outputDir);
            const results = [];
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
            const totalSize = results.reduce((sum, r) => { var _a; return sum + (((_a = r.metadata) === null || _a === void 0 ? void 0 : _a.originalSize) || 0); }, 0);
            const encryptedSize = results.reduce((sum, r) => { var _a; return sum + (((_a = r.metadata) === null || _a === void 0 ? void 0 : _a.encryptedSize) || 0); }, 0);
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
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Directory encryption failed'
            };
        }
    }
    async encryptData(data, options) {
        switch (options.algorithm) {
            case 'aes':
                return aes_1.AESEncryption.encrypt(data, options);
            case 'rsa':
                return rsa_1.RSAEncryption.encrypt(data, options);
            case 'chacha20':
                return chacha20_1.ChaCha20EncryptionStatic.encrypt(data, options);
            default:
                return { success: false, error: 'Unsupported encryption algorithm' };
        }
    }
    async encryptMultipleFiles(filePaths, options, progressCallback) {
        const results = [];
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
exports.Encryptor = Encryptor;
exports.default = Encryptor;
//# sourceMappingURL=encryptor.js.map