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
exports.DirectoryScanner = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const helpers_1 = require("../utils/helpers");
const validation_1 = require("../utils/validation");
class DirectoryScanner {
    async scanDirectory(directoryPath, recursive = false) {
        try {
            if (!(0, validation_1.validateDirectoryPath)(directoryPath)) {
                throw new Error(`Directory does not exist: ${directoryPath}`);
            }
            const files = [];
            const items = await fs.readdir(directoryPath);
            for (const item of items) {
                const itemPath = path.join(directoryPath, item);
                const stats = await fs.stat(itemPath);
                const fileInfo = (0, helpers_1.createFileInfo)(itemPath, stats);
                if (stats.isDirectory() && recursive) {
                    const subFiles = await this.scanDirectory(itemPath, recursive);
                    files.push(...subFiles);
                }
                else if (stats.isFile()) {
                    files.push(fileInfo);
                }
            }
            return files;
        }
        catch (error) {
            throw new Error(`Failed to scan directory ${directoryPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async scanSubdirectories(directoryPath, progressCallback) {
        try {
            const allFiles = [];
            const directories = [directoryPath];
            let processedDirs = 0;
            while (directories.length > 0) {
                const currentDir = directories.shift();
                const items = await fs.readdir(currentDir);
                for (const item of items) {
                    const itemPath = path.join(currentDir, item);
                    const stats = await fs.stat(itemPath);
                    const fileInfo = (0, helpers_1.createFileInfo)(itemPath, stats);
                    if (stats.isDirectory()) {
                        directories.push(itemPath);
                    }
                    else {
                        allFiles.push(fileInfo);
                    }
                }
                processedDirs++;
                if (progressCallback) {
                    progressCallback(processedDirs, directories.length + processedDirs, currentDir);
                }
            }
            return allFiles;
        }
        catch (error) {
            throw new Error(`Failed to scan subdirectories of ${directoryPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getFilesByExtension(directoryPath, extensions, recursive = true) {
        try {
            const allFiles = await this.scanDirectory(directoryPath, recursive);
            const normalizedExtensions = extensions.map(ext => ext.toLowerCase().startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`);
            return allFiles.filter(file => !file.isDirectory &&
                normalizedExtensions.includes(file.extension.toLowerCase()));
        }
        catch (error) {
            throw new Error(`Failed to get files by extension in ${directoryPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getFilesByPattern(directoryPath, pattern, recursive = true) {
        try {
            const allFiles = await this.scanDirectory(directoryPath, recursive);
            return allFiles.filter(file => !file.isDirectory &&
                pattern.test(file.name));
        }
        catch (error) {
            throw new Error(`Failed to get files by pattern in ${directoryPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getDirectoryStructure(directoryPath, maxDepth = Infinity) {
        try {
            const structure = [];
            const scan = async (currentPath, currentDepth) => {
                if (currentDepth > maxDepth)
                    return;
                const items = await fs.readdir(currentPath);
                for (const item of items) {
                    const itemPath = path.join(currentPath, item);
                    const stats = await fs.stat(itemPath);
                    const fileInfo = (0, helpers_1.createFileInfo)(itemPath, stats);
                    structure.push(fileInfo);
                    if (stats.isDirectory() && currentDepth < maxDepth) {
                        await scan(itemPath, currentDepth + 1);
                    }
                }
            };
            await scan(directoryPath, 0);
            return structure;
        }
        catch (error) {
            throw new Error(`Failed to get directory structure for ${directoryPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async filterFilesBySize(files, minSize, maxSize) {
        return files.filter(file => {
            if (file.isDirectory)
                return false;
            if (minSize !== undefined && file.size < minSize)
                return false;
            if (maxSize !== undefined && file.size > maxSize)
                return false;
            return true;
        });
    }
    async getTotalSize(files) {
        return files.reduce((total, file) => total + (file.isDirectory ? 0 : file.size), 0);
    }
    async groupFilesByExtension(files) {
        const grouped = new Map();
        files.forEach(file => {
            if (!file.isDirectory) {
                const ext = file.extension || '.no-extension';
                if (!grouped.has(ext)) {
                    grouped.set(ext, []);
                }
                grouped.get(ext).push(file);
            }
        });
        return grouped;
    }
}
exports.DirectoryScanner = DirectoryScanner;
//# sourceMappingURL=directory-scanner.js.map