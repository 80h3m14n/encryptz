import * as fs from 'fs-extra';
import { FileInfo } from '../types';
export declare class FileReader {
    readFile(filePath: string): Promise<Buffer>;
    readFileAsText(filePath: string, encoding?: BufferEncoding): Promise<string>;
    getFileInfo(filePath: string): Promise<FileInfo>;
    readFilesInDirectory(directoryPath: string, recursive?: boolean): Promise<FileInfo[]>;
    getDirectorySize(directoryPath: string): Promise<number>;
    readFileStream(filePath: string): Promise<fs.ReadStream>;
    isFile(filePath: string): Promise<boolean>;
    isDirectory(dirPath: string): Promise<boolean>;
    fileExists(filePath: string): Promise<boolean>;
}
//# sourceMappingURL=file-reader.d.ts.map