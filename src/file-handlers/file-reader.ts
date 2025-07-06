import * as fs from 'fs-extra';
import * as path from 'path';
import { FileInfo } from '../types';
import { createFileInfo, formatFileSize } from '../utils/helpers';
import { validateFilePath } from '../utils/validation';

export class FileReader {
    async readFile(filePath: string): Promise<Buffer> {
        try {
            if (!validateFilePath(filePath)) {
                throw new Error(`File does not exist: ${filePath}`);
            }
            
            const data = await fs.readFile(filePath);
            return data;
        } catch (error) {
            throw new Error(`Failed to read file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async readFileAsText(filePath: string, encoding: BufferEncoding = 'utf8'): Promise<string> {
        try {
            const data = await this.readFile(filePath);
            return data.toString(encoding);
        } catch (error) {
            throw new Error(`Failed to read file as text ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getFileInfo(filePath: string): Promise<FileInfo> {
        try {
            const stats = await fs.stat(filePath);
            return createFileInfo(filePath, stats);
        } catch (error) {
            throw new Error(`Failed to get file info for ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async readFilesInDirectory(directoryPath: string, recursive: boolean = false): Promise<FileInfo[]> {
        try {
            const files: FileInfo[] = [];
            const items = await fs.readdir(directoryPath);

            for (const item of items) {
                const itemPath = path.join(directoryPath, item);
                const stats = await fs.stat(itemPath);
                const fileInfo = createFileInfo(itemPath, stats);

                if (stats.isDirectory() && recursive) {
                    files.push(fileInfo);
                    const subFiles = await this.readFilesInDirectory(itemPath, recursive);
                    files.push(...subFiles);
                } else if (stats.isFile()) {
                    files.push(fileInfo);
                }
            }

            return files;
        } catch (error) {
            throw new Error(`Failed to read directory ${directoryPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getDirectorySize(directoryPath: string): Promise<number> {
        try {
            let totalSize = 0;
            const files = await this.readFilesInDirectory(directoryPath, true);
            
            for (const file of files) {
                if (!file.isDirectory) {
                    totalSize += file.size;
                }
            }
            
            return totalSize;
        } catch (error) {
            throw new Error(`Failed to calculate directory size for ${directoryPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async readFileStream(filePath: string): Promise<fs.ReadStream> {
        try {
            if (!validateFilePath(filePath)) {
                throw new Error(`File does not exist: ${filePath}`);
            }
            
            return fs.createReadStream(filePath);
        } catch (error) {
            throw new Error(`Failed to create read stream for ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async isFile(filePath: string): Promise<boolean> {
        try {
            const stats = await fs.stat(filePath);
            return stats.isFile();
        } catch (error) {
            return false;
        }
    }

    async isDirectory(dirPath: string): Promise<boolean> {
        try {
            const stats = await fs.stat(dirPath);
            return stats.isDirectory();
        } catch (error) {
            return false;
        }
    }

    async fileExists(filePath: string): Promise<boolean> {
        try {
            await fs.access(filePath);
            return true;
        } catch (error) {
            return false;
        }
    }
}