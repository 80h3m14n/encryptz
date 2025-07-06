import * as fs from 'fs-extra';
import * as path from 'path';
import { validateOutputPath } from '../utils/validation';
import { ProgressCallback } from '../types';

export class FileWriter {
    async writeFile(filePath: string, data: Buffer | string): Promise<void> {
        try {
            const dir = path.dirname(filePath);
            await fs.ensureDir(dir);
            
            if (Buffer.isBuffer(data)) {
                await fs.writeFile(filePath, data);
            } else {
                await fs.writeFile(filePath, data, { encoding: 'utf8' });
            }
        } catch (error) {
            throw new Error(`Failed to write file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async writeFileStream(filePath: string, data: Buffer, progressCallback?: ProgressCallback): Promise<void> {
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
                } else {
                    writeStream.write(data);
                    writeStream.end();
                }
            });
        } catch (error) {
            throw new Error(`Failed to write file stream ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async appendToFile(filePath: string, data: Buffer | string): Promise<void> {
        try {
            const dir = path.dirname(filePath);
            await fs.ensureDir(dir);
            
            if (Buffer.isBuffer(data)) {
                await fs.appendFile(filePath, data);
            } else {
                await fs.appendFile(filePath, data, { encoding: 'utf8' });
            }
        } catch (error) {
            throw new Error(`Failed to append to file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async createDirectory(dirPath: string): Promise<void> {
        try {
            await fs.ensureDir(dirPath);
        } catch (error) {
            throw new Error(`Failed to create directory ${dirPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async copyFile(sourcePath: string, destPath: string): Promise<void> {
        try {
            const dir = path.dirname(destPath);
            await fs.ensureDir(dir);
            await fs.copy(sourcePath, destPath);
        } catch (error) {
            throw new Error(`Failed to copy file from ${sourcePath} to ${destPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async moveFile(sourcePath: string, destPath: string): Promise<void> {
        try {
            const dir = path.dirname(destPath);
            await fs.ensureDir(dir);
            await fs.move(sourcePath, destPath);
        } catch (error) {
            throw new Error(`Failed to move file from ${sourcePath} to ${destPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async deleteFile(filePath: string): Promise<void> {
        try {
            await fs.remove(filePath);
        } catch (error) {
            throw new Error(`Failed to delete file ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async createBackup(filePath: string, backupSuffix: string = '.backup'): Promise<string> {
        try {
            const backupPath = `${filePath}${backupSuffix}`;
            await this.copyFile(filePath, backupPath);
            return backupPath;
        } catch (error) {
            throw new Error(`Failed to create backup for ${filePath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async writeFilesInDirectory(directoryPath: string, filesData: Map<string, Buffer | string>, progressCallback?: ProgressCallback): Promise<void> {
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
        } catch (error) {
            throw new Error(`Failed to write files in directory ${directoryPath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}