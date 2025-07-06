import * as crypto from 'crypto';
import * as path from 'path';
import { FileInfo } from '../types';

export function generateRandomKey(length: number): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        key += charset[randomIndex];
    }
    return key;
}

export function formatOutput(data: string): string {
    return `Output: ${data}`;
}

export function generateSecureKey(length: number = 32): Buffer {
    return crypto.randomBytes(length);
}

export function deriveKeyFromPassword(password: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha512');
}

export function formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
}

export function getFileExtension(filePath: string): string {
    return path.extname(filePath).toLowerCase();
}

export function generateOutputPath(inputPath: string, suffix: string): string {
    const ext = path.extname(inputPath);
    const baseName = path.basename(inputPath, ext);
    const dir = path.dirname(inputPath);
    return path.join(dir, `${baseName}${suffix}${ext}`);
}

export function createFileInfo(filePath: string, stats: any): FileInfo {
    return {
        path: filePath,
        name: path.basename(filePath),
        size: stats.size,
        extension: getFileExtension(filePath),
        isDirectory: stats.isDirectory()
    };
}

export function isTextFile(filePath: string): boolean {
    const textExtensions = ['.txt', '.md', '.json', '.js', '.ts', '.html', '.css', '.py', '.java', '.cpp', '.c'];
    return textExtensions.includes(getFileExtension(filePath));
}

export function createProgressBar(current: number, total: number, fileName?: string): string {
    const percentage = Math.round((current / total) * 100);
    const barLength = 30;
    const filledLength = Math.round((percentage / 100) * barLength);
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
    const file = fileName ? ` - ${path.basename(fileName)}` : '';
    return `Progress: [${bar}] ${percentage}%${file}`;
}