import { ProgressCallback } from '../types';
export declare class FileWriter {
    writeFile(filePath: string, data: Buffer | string): Promise<void>;
    writeFileStream(filePath: string, data: Buffer, progressCallback?: ProgressCallback): Promise<void>;
    appendToFile(filePath: string, data: Buffer | string): Promise<void>;
    createDirectory(dirPath: string): Promise<void>;
    copyFile(sourcePath: string, destPath: string): Promise<void>;
    moveFile(sourcePath: string, destPath: string): Promise<void>;
    deleteFile(filePath: string): Promise<void>;
    createBackup(filePath: string, backupSuffix?: string): Promise<string>;
    writeFilesInDirectory(directoryPath: string, filesData: Map<string, Buffer | string>, progressCallback?: ProgressCallback): Promise<void>;
}
//# sourceMappingURL=file-writer.d.ts.map