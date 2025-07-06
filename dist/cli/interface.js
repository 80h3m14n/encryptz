"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLIInterface = void 0;
const chalk_1 = __importDefault(require("chalk"));
const ora_1 = __importDefault(require("ora"));
const helpers_1 = require("../utils/helpers");
class CLIInterface {
    static showWelcome() {
        console.log(chalk_1.default.cyan.bold('\n🔐 EncryptZ - Advanced File Encryption Tool\n'));
        console.log(chalk_1.default.gray('Secure your files with AES, RSA, and ChaCha20 encryption\n'));
    }
    static showHelp() {
        console.log(chalk_1.default.yellow.bold('Usage Examples:'));
        console.log(chalk_1.default.white('  Encrypt a file:'));
        console.log(chalk_1.default.green('    encryptz encrypt --file document.txt --algorithm aes --password mypassword'));
        console.log(chalk_1.default.white('\n  Decrypt a file:'));
        console.log(chalk_1.default.green('    encryptz decrypt --file document.txt.encrypted --algorithm aes --password mypassword'));
        console.log(chalk_1.default.white('\n  Encrypt a directory:'));
        console.log(chalk_1.default.green('    encryptz encrypt --directory ./documents --algorithm chacha20 --password mypassword --recursive'));
        console.log(chalk_1.default.white('\n  Encrypt text:'));
        console.log(chalk_1.default.green('    encryptz encrypt --text "Hello World" --algorithm rsa'));
        console.log(chalk_1.default.white('\nSupported algorithms: aes, rsa, chacha20\n'));
    }
    static showError(message) {
        if (this.spinner)
            this.spinner.stop();
        console.error(chalk_1.default.red.bold('❌ Error: ') + chalk_1.default.red(message));
    }
    static showSuccess(message) {
        if (this.spinner)
            this.spinner.succeed();
        console.log(chalk_1.default.green.bold('✅ Success: ') + chalk_1.default.green(message));
    }
    static showWarning(message) {
        if (this.spinner)
            this.spinner.warn();
        console.warn(chalk_1.default.yellow.bold('⚠️  Warning: ') + chalk_1.default.yellow(message));
    }
    static showInfo(message) {
        if (this.spinner)
            this.spinner.stop();
        console.log(chalk_1.default.blue.bold('ℹ️  Info: ') + chalk_1.default.blue(message));
    }
    static startSpinner(text) {
        this.spinner = (0, ora_1.default)(text).start();
    }
    static updateSpinner(text) {
        if (this.spinner) {
            this.spinner.text = text;
        }
    }
    static stopSpinner() {
        if (this.spinner) {
            this.spinner.stop();
            this.spinner = null;
        }
    }
    static createProgressCallback() {
        let lastProgress = -1;
        return (current, total, fileName) => {
            const progress = Math.round((current / total) * 100);
            // Only update if progress changed significantly
            if (progress !== lastProgress) {
                const progressText = fileName ?
                    `Processing ${fileName} - ${progress}%` :
                    `Progress: ${progress}%`;
                if (this.spinner) {
                    this.updateSpinner(progressText);
                }
                else {
                    process.stdout.clearLine(0);
                    process.stdout.cursorTo(0);
                    const progressBar = (0, helpers_1.createProgressBar)(current, total, fileName);
                    process.stdout.write(chalk_1.default.cyan(progressBar));
                    if (progress === 100) {
                        console.log(''); // New line when complete
                    }
                }
                lastProgress = progress;
            }
        };
    }
    static showFileInfo(filePath, size, algorithm) {
        console.log(chalk_1.default.gray('─'.repeat(50)));
        console.log(chalk_1.default.white.bold('File Information:'));
        console.log(chalk_1.default.gray(`  Path: ${filePath}`));
        console.log(chalk_1.default.gray(`  Size: ${(0, helpers_1.formatFileSize)(size)}`));
        console.log(chalk_1.default.gray(`  Algorithm: ${algorithm.toUpperCase()}`));
        console.log(chalk_1.default.gray('─'.repeat(50)));
    }
    static showEncryptionResult(originalPath, outputPath, originalSize, encryptedSize) {
        console.log(chalk_1.default.green.bold('\n🔒 Encryption Completed!'));
        console.log(chalk_1.default.white(`Original file: ${originalPath}`));
        console.log(chalk_1.default.white(`Encrypted file: ${outputPath}`));
        console.log(chalk_1.default.gray(`Size change: ${(0, helpers_1.formatFileSize)(originalSize)} → ${(0, helpers_1.formatFileSize)(encryptedSize)}`));
        const compressionRatio = ((encryptedSize - originalSize) / originalSize * 100);
        if (compressionRatio > 0) {
            console.log(chalk_1.default.yellow(`Size increased by ${compressionRatio.toFixed(1)}%`));
        }
        else if (compressionRatio < 0) {
            console.log(chalk_1.default.green(`Size reduced by ${Math.abs(compressionRatio).toFixed(1)}%`));
        }
    }
    static showDecryptionResult(originalPath, outputPath, encryptedSize, decryptedSize) {
        console.log(chalk_1.default.green.bold('\n🔓 Decryption Completed!'));
        console.log(chalk_1.default.white(`Encrypted file: ${originalPath}`));
        console.log(chalk_1.default.white(`Decrypted file: ${outputPath}`));
        console.log(chalk_1.default.gray(`Size change: ${(0, helpers_1.formatFileSize)(encryptedSize)} → ${(0, helpers_1.formatFileSize)(decryptedSize)}`));
    }
    static showDirectoryResult(action, inputPath, outputPath, processedFiles, totalSize) {
        const actionEmoji = action === 'encrypt' ? '🔒' : '🔓';
        const actionText = action === 'encrypt' ? 'Encryption' : 'Decryption';
        console.log(chalk_1.default.green.bold(`\n${actionEmoji} Directory ${actionText} Completed!`));
        console.log(chalk_1.default.white(`Input directory: ${inputPath}`));
        console.log(chalk_1.default.white(`Output directory: ${outputPath}`));
        console.log(chalk_1.default.gray(`Files processed: ${processedFiles}`));
        console.log(chalk_1.default.gray(`Total size: ${(0, helpers_1.formatFileSize)(totalSize)}`));
    }
    static promptPassword() {
        return new Promise((resolve) => {
            process.stdout.write(chalk_1.default.yellow('Enter password: '));
            const stdin = process.stdin;
            stdin.setRawMode(true);
            stdin.resume();
            stdin.setEncoding('utf8');
            let password = '';
            stdin.on('data', (char) => {
                if (char === '\n' || char === '\r' || char === '\u0004') {
                    stdin.setRawMode(false);
                    stdin.pause();
                    console.log('');
                    resolve(password);
                }
                else if (char === '\u0003') {
                    // Ctrl+C
                    process.exit(1);
                }
                else if (char === '\u007f') {
                    // Backspace
                    if (password.length > 0) {
                        password = password.slice(0, -1);
                        process.stdout.write('\b \b');
                    }
                }
                else {
                    password += char;
                    process.stdout.write('*');
                }
            });
        });
    }
    static clearScreen() {
        console.clear();
    }
    static showBanner() {
        console.log(chalk_1.default.cyan(`
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
exports.CLIInterface = CLIInterface;
//# sourceMappingURL=interface.js.map