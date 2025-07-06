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
exports.validateFilePath = validateFilePath;
exports.validateAlgorithm = validateAlgorithm;
exports.validatePassword = validatePassword;
exports.validateOutputPath = validateOutputPath;
exports.validateDirectoryPath = validateDirectoryPath;
exports.isValidEncryptionAlgorithm = isValidEncryptionAlgorithm;
exports.validateFileSize = validateFileSize;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function validateFilePath(filePath) {
    try {
        const resolvedPath = path.resolve(filePath);
        return fs.existsSync(resolvedPath);
    }
    catch (error) {
        return false;
    }
}
function validateAlgorithm(algorithm) {
    const validAlgorithms = ['aes', 'rsa', 'chacha20'];
    return validAlgorithms.includes(algorithm);
}
function validatePassword(password) {
    if (!password || password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters long' };
    }
    // Check for at least one uppercase, one lowercase, one digit, and one special character
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    if (!hasUppercase || !hasLowercase || !hasDigit || !hasSpecialChar) {
        return {
            valid: false,
            message: 'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character'
        };
    }
    return { valid: true };
}
function validateOutputPath(outputPath) {
    try {
        const dir = path.dirname(outputPath);
        return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
    }
    catch (error) {
        return false;
    }
}
function validateDirectoryPath(dirPath) {
    try {
        const stats = fs.statSync(dirPath);
        return stats.isDirectory();
    }
    catch (error) {
        return false;
    }
}
function isValidEncryptionAlgorithm(algorithm) {
    return ['aes', 'rsa', 'chacha20'].includes(algorithm);
}
function validateFileSize(filePath, maxSize = 1024 * 1024 * 1024) {
    try {
        const stats = fs.statSync(filePath);
        return stats.size <= maxSize;
    }
    catch (error) {
        return false;
    }
}
//# sourceMappingURL=validation.js.map