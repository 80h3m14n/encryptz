import * as fs from 'fs-extra';
import * as path from 'path';
import { FileInfo, ProgressCallback } from '../types';
import { createFileInfo, getFileExtension } from '../utils/helpers';
import { validateDirectoryPath } from '../utils/validation';

export class DirectoryScanner {
    async scanDirectory(directoryPath: string, recursive: boolean = false): Promise<FileInfo[]> {
        try {
            if (!validateDirectoryPath(directoryPath)) {
                throw new Error(`Directory does not exist: ${directoryPath}`);
            }

            const files: FileInfo[] = [];
            const items = await fs.readdir(directoryPath);

            for (const item of items) {
                const itemPath = path.join(directoryPath, item);
                const stats = await fs.stat(itemPath);
                const fileInfo = createFileInfo(itemPath, stats);

                if (stats.isDirectory() && recursive) {
                    const subFiles = await this.scanDirectory(itemPath, recursive);
                    files.push(...subFiles);
                } else if (stats.isFile()) {
                    files.push(fileInfo);
                }
            }

            return files;
        } catch (error) {
            throw new Error(`Failed to scan directory ${directoryPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async scanSubdirectories(directoryPath: string, progressCallback?: ProgressCallback): Promise<FileInfo[]> {
        try {
            const allFiles: FileInfo[] = [];
            const directories: string[] = [directoryPath];
            let processedDirs = 0;

            while (directories.length > 0) {
                const currentDir = directories.shift()!;
                const items = await fs.readdir(currentDir);

                for (const item of items) {
                    const itemPath = path.join(currentDir, item);
                    const stats = await fs.stat(itemPath);
                    const fileInfo = createFileInfo(itemPath, stats);

                    if (stats.isDirectory()) {
                        directories.push(itemPath);
                    } else {
                        allFiles.push(fileInfo);
                    }
                }

                processedDirs++;
                if (progressCallback) {
                    progressCallback(processedDirs, directories.length + processedDirs, currentDir);
                }
            }

            return allFiles;
        } catch (error) {
            throw new Error(`Failed to scan subdirectories of ${directoryPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getFilesByExtension(directoryPath: string, extensions: string[], recursive: boolean = true): Promise<FileInfo[]> {
        try {
            const allFiles = await this.scanDirectory(directoryPath, recursive);
            const normalizedExtensions = extensions.map(ext => ext.toLowerCase().startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`);
            
            return allFiles.filter(file => 
                !file.isDirectory && 
                normalizedExtensions.includes(file.extension.toLowerCase())
            );
        } catch (error) {
            throw new Error(`Failed to get files by extension in ${directoryPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getFilesByPattern(directoryPath: string, pattern: RegExp, recursive: boolean = true): Promise<FileInfo[]> {
        try {
            const allFiles = await this.scanDirectory(directoryPath, recursive);
            
            return allFiles.filter(file => 
                !file.isDirectory && 
                pattern.test(file.name)
            );
        } catch (error) {
            throw new Error(`Failed to get files by pattern in ${directoryPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getDirectoryStructure(directoryPath: string, maxDepth: number = Infinity): Promise<FileInfo[]> {
        try {
            const structure: FileInfo[] = [];
            
            const scan = async (currentPath: string, currentDepth: number) => {
                if (currentDepth > maxDepth) return;
                
                const items = await fs.readdir(currentPath);
                
                for (const item of items) {
                    const itemPath = path.join(currentPath, item);
                    const stats = await fs.stat(itemPath);
                    const fileInfo = createFileInfo(itemPath, stats);
                    
                    structure.push(fileInfo);
                    
                    if (stats.isDirectory() && currentDepth < maxDepth) {
                        await scan(itemPath, currentDepth + 1);
                    }
                }
            };
            
            await scan(directoryPath, 0);
            return structure;
        } catch (error) {
            throw new Error(`Failed to get directory structure for ${directoryPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async filterFilesBySize(files: FileInfo[], minSize?: number, maxSize?: number): Promise<FileInfo[]> {
        return files.filter(file => {
            if (file.isDirectory) return false;
            if (minSize !== undefined && file.size < minSize) return false;
            if (maxSize !== undefined && file.size > maxSize) return false;
            return true;
        });
    }

    async getTotalSize(files: FileInfo[]): Promise<number> {
        return files.reduce((total, file) => total + (file.isDirectory ? 0 : file.size), 0);
    }

    async groupFilesByExtension(files: FileInfo[]): Promise<Map<string, FileInfo[]>> {
        const grouped = new Map<string, FileInfo[]>();
        
        files.forEach(file => {
            if (!file.isDirectory) {
                const ext = file.extension || '.no-extension';
                if (!grouped.has(ext)) {
                    grouped.set(ext, []);
                }
                grouped.get(ext)!.push(file);
            }
        });
        
        return grouped;
    }
}