export type EncryptionAlgorithm = 'aes' | 'rsa' | 'chacha20';

export interface EncryptionOptions {
  algorithm: EncryptionAlgorithm;
  keySize?: number;
  password?: string;
  outputPath?: string;
}

export interface EncryptionResult {
  success: boolean;
  data?: string | Buffer;
  error?: string;
  metadata?: {
    algorithm: EncryptionAlgorithm;
    originalSize?: number;
    encryptedSize?: number;
    timestamp: number;
  };
}

export interface FileInfo {
  path: string;
  name: string;
  size: number;
  extension: string;
  isDirectory: boolean;
}

export interface CommandOptions {
  action: 'encrypt' | 'decrypt';
  input?: string;
  output?: string;
  algorithm: EncryptionAlgorithm;
  password?: string;
  recursive?: boolean;
  text?: string;
  preserveStructure?: boolean;
}

export interface ProgressCallback {
  (current: number, total: number, fileName?: string): void;
}

export interface CommandLineOptions {
    inputFile: string;
    outputFile: string;
    algorithm: EncryptionAlgorithm;
}

export interface FileHandler {
    readFile(filePath: string): string;
    writeFile(filePath: string, data: string): void;
}

export interface Encryptor {
    encryptText(text: string, algorithm: EncryptionAlgorithm): string;
    encryptFile(filePath: string, algorithm: EncryptionAlgorithm): void;
}

export interface Decryptor {
    decryptText(encryptedText: string, algorithm: EncryptionAlgorithm): string;
    decryptFile(filePath: string, algorithm: EncryptionAlgorithm): void;
}