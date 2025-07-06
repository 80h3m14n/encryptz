import * as fs from 'fs';
import * as path from 'path';
import { EncryptionAlgorithm } from '../types';

export function validateFilePath(filePath: string): boolean {
    try {
        const resolvedPath = path.resolve(filePath);
        return fs.existsSync(resolvedPath);
    } catch (error) {
        return false;
    }
}

export function validateAlgorithm(algorithm: string): boolean {
    const validAlgorithms = ['aes', 'rsa', 'chacha20'];
    return validAlgorithms.includes(algorithm);
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
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

export function validateOutputPath(outputPath: string): boolean {
    try {
        const dir = path.dirname(outputPath);
        return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
    } catch (error) {
        return false;
    }
}

export function validateDirectoryPath(dirPath: string): boolean {
    try {
        const stats = fs.statSync(dirPath);
        return stats.isDirectory();
    } catch (error) {
        return false;
    }
}

export function isValidEncryptionAlgorithm(algorithm: string): algorithm is EncryptionAlgorithm {
    return ['aes', 'rsa', 'chacha20'].includes(algorithm);
}

export function validateFileSize(filePath: string, maxSize: number = 1024 * 1024 * 1024): boolean {
    try {
        const stats = fs.statSync(filePath);
        return stats.size <= maxSize;
    } catch (error) {
        return false;
    }
}