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
exports.FileReader = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const helpers_1 = require("../utils/helpers");
const validation_1 = require("../utils/validation");
class FileReader {
    async readFile(filePath) {
        try {
            if (!(0, validation_1.validateFilePath)(filePath)) {
                throw new Error(`File does not exist: ${filePath}`);
            }
            const data = await fs.readFile(filePath);
            return data;
        }
        catch (error) {
            throw new Error(`Failed to read file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async readFileAsText(filePath, encoding = 'utf8') {
        try {
            const data = await this.readFile(filePath);
            return data.toString(encoding);
        }
        catch (error) {
            throw new Error(`Failed to read file as text ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getFileInfo(filePath) {
        try {
            const stats = await fs.stat(filePath);
            return (0, helpers_1.createFileInfo)(filePath, stats);
        }
        catch (error) {
            throw new Error(`Failed to get file info for ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async readFilesInDirectory(directoryPath, recursive = false) {
        try {
            const files = [];
            const items = await fs.readdir(directoryPath);
            for (const item of items) {
                const itemPath = path.join(directoryPath, item);
                const stats = await fs.stat(itemPath);
                const fileInfo = (0, helpers_1.createFileInfo)(itemPath, stats);
                if (stats.isDirectory() && recursive) {
                    files.push(fileInfo);
                    const subFiles = await this.readFilesInDirectory(itemPath, recursive);
                    files.push(...subFiles);
                }
                else if (stats.isFile()) {
                    files.push(fileInfo);
                }
            }
            return files;
        }
        catch (error) {
            throw new Error(`Failed to read directory ${directoryPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getDirectorySize(directoryPath) {
        try {
            let totalSize = 0;
            const files = await this.readFilesInDirectory(directoryPath, true);
            for (const file of files) {
                if (!file.isDirectory) {
                    totalSize += file.size;
                }
            }
            return totalSize;
        }
        catch (error) {
            throw new Error(`Failed to calculate directory size for ${directoryPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async readFileStream(filePath) {
        try {
            if (!(0, validation_1.validateFilePath)(filePath)) {
                throw new Error(`File does not exist: ${filePath}`);
            }
            return fs.createReadStream(filePath);
        }
        catch (error) {
            throw new Error(`Failed to create read stream for ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async isFile(filePath) {
        try {
            const stats = await fs.stat(filePath);
            return stats.isFile();
        }
        catch (error) {
            return false;
        }
    }
    async isDirectory(dirPath) {
        try {
            const stats = await fs.stat(dirPath);
            return stats.isDirectory();
        }
        catch (error) {
            return false;
        }
    }
    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        }
        catch (error) {
            return false;
        }
    }
}
exports.FileReader = FileReader;
//# sourceMappingURL=file-reader.js.map