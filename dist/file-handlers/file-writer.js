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
exports.FileWriter = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
class FileWriter {
    async writeFile(filePath, data) {
        try {
            const dir = path.dirname(filePath);
            await fs.ensureDir(dir);
            if (Buffer.isBuffer(data)) {
                await fs.writeFile(filePath, data);
            }
            else {
                await fs.writeFile(filePath, data, { encoding: 'utf8' });
            }
        }
        catch (error) {
            throw new Error(`Failed to write file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async writeFileStream(filePath, data, progressCallback) {
        try {
            const dir = path.dirname(filePath);
            await fs.ensureDir(dir);
            const writeStream = fs.createWriteStream(filePath);
            return new Promise((resolve, reject) => {
                writeStream.on('error', reject);
                writeStream.on('finish', resolve);
                if (progressCallback) {
                    let written = 0;
                    const chunkSize = 64 * 1024; // 64KB chunks
                    const writeChunk = () => {
                        if (written >= data.length) {
                            writeStream.end();
                            return;
                        }
                        const chunk = data.slice(written, Math.min(written + chunkSize, data.length));
                        writeStream.write(chunk);
                        written += chunk.length;
                        progressCallback(written, data.length, filePath);
                        setImmediate(writeChunk);
                    };
                    writeChunk();
                }
                else {
                    writeStream.write(data);
                    writeStream.end();
                }
            });
        }
        catch (error) {
            throw new Error(`Failed to write file stream ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async appendToFile(filePath, data) {
        try {
            const dir = path.dirname(filePath);
            await fs.ensureDir(dir);
            if (Buffer.isBuffer(data)) {
                await fs.appendFile(filePath, data);
            }
            else {
                await fs.appendFile(filePath, data, { encoding: 'utf8' });
            }
        }
        catch (error) {
            throw new Error(`Failed to append to file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async createDirectory(dirPath) {
        try {
            await fs.ensureDir(dirPath);
        }
        catch (error) {
            throw new Error(`Failed to create directory ${dirPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async copyFile(sourcePath, destPath) {
        try {
            const dir = path.dirname(destPath);
            await fs.ensureDir(dir);
            await fs.copy(sourcePath, destPath);
        }
        catch (error) {
            throw new Error(`Failed to copy file from ${sourcePath} to ${destPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async moveFile(sourcePath, destPath) {
        try {
            const dir = path.dirname(destPath);
            await fs.ensureDir(dir);
            await fs.move(sourcePath, destPath);
        }
        catch (error) {
            throw new Error(`Failed to move file from ${sourcePath} to ${destPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async deleteFile(filePath) {
        try {
            await fs.remove(filePath);
        }
        catch (error) {
            throw new Error(`Failed to delete file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async createBackup(filePath, backupSuffix = '.backup') {
        try {
            const backupPath = `${filePath}${backupSuffix}`;
            await this.copyFile(filePath, backupPath);
            return backupPath;
        }
        catch (error) {
            throw new Error(`Failed to create backup for ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async writeFilesInDirectory(directoryPath, filesData, progressCallback) {
        try {
            const totalFiles = filesData.size;
            let processed = 0;
            for (const [relativePath, data] of filesData) {
                const fullPath = path.join(directoryPath, relativePath);
                await this.writeFile(fullPath, data);
                processed++;
                if (progressCallback) {
                    progressCallback(processed, totalFiles, relativePath);
                }
            }
        }
        catch (error) {
            throw new Error(`Failed to write files in directory ${directoryPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
exports.FileWriter = FileWriter;
//# sourceMappingURL=file-writer.js.map