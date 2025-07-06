import { FileInfo, ProgressCallback } from '../types';
export declare class DirectoryScanner {
    scanDirectory(directoryPath: string, recursive?: boolean): Promise<FileInfo[]>;
    scanSubdirectories(directoryPath: string, progressCallback?: ProgressCallback): Promise<FileInfo[]>;
    getFilesByExtension(directoryPath: string, extensions: string[], recursive?: boolean): Promise<FileInfo[]>;
    getFilesByPattern(directoryPath: string, pattern: RegExp, recursive?: boolean): Promise<FileInfo[]>;
    getDirectoryStructure(directoryPath: string, maxDepth?: number): Promise<FileInfo[]>;
    filterFilesBySize(files: FileInfo[], minSize?: number, maxSize?: number): Promise<FileInfo[]>;
    getTotalSize(files: FileInfo[]): Promise<number>;
    groupFilesByExtension(files: FileInfo[]): Promise<Map<string, FileInfo[]>>;
}
//# sourceMappingURL=directory-scanner.d.ts.map