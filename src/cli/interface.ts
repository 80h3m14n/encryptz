import chalk from 'chalk';
import ora from 'ora';
import { ProgressCallback } from '../types';
import { formatFileSize, createProgressBar } from '../utils/helpers';

export interface CommandLineOptions {
    inputFile: string;
    outputFile: string;
    algorithm: string;
    action: 'encrypt' | 'decrypt';
}

export class CLIInterface {
    private static spinner: any;

    static showWelcome(): void {
        console.log(chalk.cyan.bold('\n🔐 EncryptZ - Advanced File Encryption Tool\n'));
        console.log(chalk.gray('Secure your files with AES, RSA, and ChaCha20 encryption\n'));
    }

    static showHelp(): void {
        console.log(chalk.yellow.bold('Usage Examples:'));
        console.log(chalk.white('  Encrypt a file:'));
        console.log(chalk.green('    encryptz encrypt --file document.txt --algorithm aes --password mypassword'));
        console.log(chalk.white('\n  Decrypt a file:'));
        console.log(chalk.green('    encryptz decrypt --file document.txt.encrypted --algorithm aes --password mypassword'));
        console.log(chalk.white('\n  Encrypt a directory:'));
        console.log(chalk.green('    encryptz encrypt --directory ./documents --algorithm chacha20 --password mypassword --recursive'));
        console.log(chalk.white('\n  Encrypt text:'));
        console.log(chalk.green('    encryptz encrypt --text "Hello World" --algorithm rsa'));
        console.log(chalk.white('\nSupported algorithms: aes, rsa, chacha20\n'));
    }

    static showError(message: string): void {
        if (this.spinner) this.spinner.stop();
        console.error(chalk.red.bold('❌ Error: ') + chalk.red(message));
    }

    static showSuccess(message: string): void {
        if (this.spinner) this.spinner.succeed();
        console.log(chalk.green.bold('✅ Success: ') + chalk.green(message));
    }

    static showWarning(message: string): void {
        if (this.spinner) this.spinner.warn();
        console.warn(chalk.yellow.bold('⚠️  Warning: ') + chalk.yellow(message));
    }

    static showInfo(message: string): void {
        if (this.spinner) this.spinner.stop();
        console.log(chalk.blue.bold('ℹ️  Info: ') + chalk.blue(message));
    }

    static startSpinner(text: string): void {
        this.spinner = ora(text).start();
    }

    static updateSpinner(text: string): void {
        if (this.spinner) {
            this.spinner.text = text;
        }
    }

    static stopSpinner(): void {
        if (this.spinner) {
            this.spinner.stop();
            this.spinner = null;
        }
    }

    static createProgressCallback(): ProgressCallback {
        let lastProgress = -1;
        
        return (current: number, total: number, fileName?: string) => {
            const progress = Math.round((current / total) * 100);
            
            // Only update if progress changed significantly
            if (progress !== lastProgress) {
                const progressText = fileName ? 
                    `Processing ${fileName} - ${progress}%` : 
                    `Progress: ${progress}%`;
                
                if (this.spinner) {
                    this.updateSpinner(progressText);
                } else {
                    process.stdout.clearLine(0);
                    process.stdout.cursorTo(0);
                    
                    const progressBar = createProgressBar(current, total, fileName);
                    process.stdout.write(chalk.cyan(progressBar));
                    
                    if (progress === 100) {
                        console.log(''); // New line when complete
                    }
                }
                
                lastProgress = progress;
            }
        };
    }

    static showFileInfo(filePath: string, size: number, algorithm: string): void {
        console.log(chalk.gray('─'.repeat(50)));
        console.log(chalk.white.bold('File Information:'));
        console.log(chalk.gray(`  Path: ${filePath}`));
        console.log(chalk.gray(`  Size: ${formatFileSize(size)}`));
        console.log(chalk.gray(`  Algorithm: ${algorithm.toUpperCase()}`));
        console.log(chalk.gray('─'.repeat(50)));
    }

    static showEncryptionResult(originalPath: string, outputPath: string, originalSize: number, encryptedSize: number): void {
        console.log(chalk.green.bold('\n🔒 Encryption Completed!'));
        console.log(chalk.white(`Original file: ${originalPath}`));
        console.log(chalk.white(`Encrypted file: ${outputPath}`));
        console.log(chalk.gray(`Size change: ${formatFileSize(originalSize)} → ${formatFileSize(encryptedSize)}`));
        
        const compressionRatio = ((encryptedSize - originalSize) / originalSize * 100);
        if (compressionRatio > 0) {
            console.log(chalk.yellow(`Size increased by ${compressionRatio.toFixed(1)}%`));
        } else if (compressionRatio < 0) {
            console.log(chalk.green(`Size reduced by ${Math.abs(compressionRatio).toFixed(1)}%`));
        }
    }

    static showDecryptionResult(originalPath: string, outputPath: string, encryptedSize: number, decryptedSize: number): void {
        console.log(chalk.green.bold('\n🔓 Decryption Completed!'));
        console.log(chalk.white(`Encrypted file: ${originalPath}`));
        console.log(chalk.white(`Decrypted file: ${outputPath}`));
        console.log(chalk.gray(`Size change: ${formatFileSize(encryptedSize)} → ${formatFileSize(decryptedSize)}`));
    }

    static showDirectoryResult(action: string, inputPath: string, outputPath: string, processedFiles: number, totalSize: number): void {
        const actionEmoji = action === 'encrypt' ? '🔒' : '🔓';
        const actionText = action === 'encrypt' ? 'Encryption' : 'Decryption';
        
        console.log(chalk.green.bold(`\n${actionEmoji} Directory ${actionText} Completed!`));
        console.log(chalk.white(`Input directory: ${inputPath}`));
        console.log(chalk.white(`Output directory: ${outputPath}`));
        console.log(chalk.gray(`Files processed: ${processedFiles}`));
        console.log(chalk.gray(`Total size: ${formatFileSize(totalSize)}`));
    }

    static promptPassword(): Promise<string> {
        return new Promise((resolve) => {
            process.stdout.write(chalk.yellow('Enter password: '));
            
            const stdin = process.stdin;
            stdin.setRawMode(true);
            stdin.resume();
            stdin.setEncoding('utf8');
            
            let password = '';
            
            stdin.on('data', (char: string) => {
                if (char === '\n' || char === '\r' || char === '\u0004') {
                    stdin.setRawMode(false);
                    stdin.pause();
                    console.log('');
                    resolve(password);
                } else if (char === '\u0003') {
                    // Ctrl+C
                    process.exit(1);
                } else if (char === '\u007f') {
                    // Backspace
                    if (password.length > 0) {
                        password = password.slice(0, -1);
                        process.stdout.write('\b \b');
                    }
                } else {
                    password += char;
                    process.stdout.write('*');
                }
            });
        });
    }

    static clearScreen(): void {
        console.clear();
    }

    static showBanner(): void {
        console.log(chalk.cyan(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                                  EncryptZ                                    ║
║                     Advanced File & Directory Encryption                     ║
║                                                                              ║
║  🔐 AES-256-GCM  |  🔑 RSA-2048  |  ⚡ ChaCha20                              ║
║  📁 Directories  |  📄 Files     |  📝 Text                                 ║
╚══════════════════════════════════════════════════════════════════════════════╝
        `));
    }
}