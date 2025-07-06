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
exports.generateRandomKey = generateRandomKey;
exports.formatOutput = formatOutput;
exports.generateSecureKey = generateSecureKey;
exports.deriveKeyFromPassword = deriveKeyFromPassword;
exports.formatFileSize = formatFileSize;
exports.getFileExtension = getFileExtension;
exports.generateOutputPath = generateOutputPath;
exports.createFileInfo = createFileInfo;
exports.isTextFile = isTextFile;
exports.createProgressBar = createProgressBar;
const crypto = __importStar(require("crypto"));
const path = __importStar(require("path"));
function generateRandomKey(length) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        key += charset[randomIndex];
    }
    return key;
}
function formatOutput(data) {
    return `Output: ${data}`;
}
function generateSecureKey(length = 32) {
    return crypto.randomBytes(length);
}
function deriveKeyFromPassword(password, salt) {
    return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha512');
}
function formatFileSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0)
        return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
}
function getFileExtension(filePath) {
    return path.extname(filePath).toLowerCase();
}
function generateOutputPath(inputPath, suffix) {
    const ext = path.extname(inputPath);
    const baseName = path.basename(inputPath, ext);
    const dir = path.dirname(inputPath);
    return path.join(dir, `${baseName}${suffix}${ext}`);
}
function createFileInfo(filePath, stats) {
    return {
        path: filePath,
        name: path.basename(filePath),
        size: stats.size,
        extension: getFileExtension(filePath),
        isDirectory: stats.isDirectory()
    };
}
function isTextFile(filePath) {
    const textExtensions = ['.txt', '.md', '.json', '.js', '.ts', '.html', '.css', '.py', '.java', '.cpp', '.c'];
    return textExtensions.includes(getFileExtension(filePath));
}
function createProgressBar(current, total, fileName) {
    const percentage = Math.round((current / total) * 100);
    const barLength = 30;
    const filledLength = Math.round((percentage / 100) * barLength);
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
    const file = fileName ? ` - ${path.basename(fileName)}` : '';
    return `Progress: [${bar}] ${percentage}%${file}`;
}
//# sourceMappingURL=helpers.js.map