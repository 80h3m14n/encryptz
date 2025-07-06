import { parseCommandLineArgs, getCommandOptions } from './cli/commands';
import { CLIInterface } from './cli/interface';
import { Encryptor } from './encryption/encryptor';
import { Decryptor } from './encryption/decryptor';
import { FileReader } from './file-handlers/file-reader';
import { validateFilePath, validateDirectoryPath } from './utils/validation';
import { formatFileSize } from './utils/helpers';
import prompts from 'prompts';
import chalk from 'chalk';

async function main() {
    try {
        CLIInterface.showBanner();
        
        // Parse command line arguments
        parseCommandLineArgs();
        const options = getCommandOptions();
        
        if (!options) {
            CLIInterface.showHelp();
            return;
        }

        // Validate inputs
        if (!options.input && !options.text) {
            CLIInterface.showError('No input specified. Use --file, --directory, or --text option.');
            return;
        }

        // Prompt for password if not provided and required
        if (!options.password && (options.algorithm === 'aes' || options.algorithm === 'chacha20')) {
            const response = await prompts({
                type: 'password',
                name: 'password',
                message: `Enter password for ${options.algorithm.toUpperCase()} ${options.action}:`
            });
            options.password = response.password;
        }

        if (options.action === 'encrypt') {
            await handleEncryption(options);
        } else if (options.action === 'decrypt') {
            await handleDecryption(options);
        } else {
            CLIInterface.showError('Invalid action. Use "encrypt" or "decrypt".');
        }
    } catch (error) {
        CLIInterface.showError(error instanceof Error ? error.message : 'An unknown error occurred');
        process.exit(1);
    }
}

async function handleEncryption(options: any) {
    const encryptor = new Encryptor();
    const fileReader = new FileReader();
    const progressCallback = CLIInterface.createProgressCallback();

    try {
        if (options.text) {
            // Encrypt text
            CLIInterface.showInfo(`Encrypting text with ${options.algorithm.toUpperCase()}...`);
            const result = await encryptor.encryptText(options.text, options.algorithm, options.password);
            
            if (result.success) {
                CLIInterface.showSuccess('Text encrypted successfully!');
                console.log(chalk.yellow.bold('\nEncrypted text (Base64):'));
                console.log(chalk.cyan(Buffer.from(result.data as Buffer).toString('base64')));
            } else {
                CLIInterface.showError(result.error || 'Text encryption failed');
            }
        } else if (options.input) {
            const isDirectory = await fileReader.isDirectory(options.input);
            
            if (isDirectory) {
                // Encrypt directory
                CLIInterface.showInfo(`Encrypting directory: ${options.input}`);
                const result = await encryptor.encryptDirectory(options.input, {
                    algorithm: options.algorithm,
                    password: options.password,
                    outputPath: options.output
                }, progressCallback);
                
                if (result.success) {
                    CLIInterface.showDirectoryResult(
                        'encrypt',
                        options.input,
                        result.data as string,
                        0, // We don't track individual file count in this simple version
                        result.metadata?.originalSize || 0
                    );
                } else {
                    CLIInterface.showError(result.error || 'Directory encryption failed');
                }
            } else {
                // Encrypt file
                if (!validateFilePath(options.input)) {
                    CLIInterface.showError(`File does not exist: ${options.input}`);
                    return;
                }
                
                const fileInfo = await fileReader.getFileInfo(options.input);
                CLIInterface.showFileInfo(fileInfo.path, fileInfo.size, options.algorithm);
                
                const result = await encryptor.encryptFile(options.input, {
                    algorithm: options.algorithm,
                    password: options.password,
                    outputPath: options.output
                }, progressCallback);
                
                if (result.success) {
                    CLIInterface.showEncryptionResult(
                        options.input,
                        result.data as string,
                        result.metadata?.originalSize || 0,
                        result.metadata?.encryptedSize || 0
                    );
                } else {
                    CLIInterface.showError(result.error || 'File encryption failed');
                }
            }
        }
    } catch (error) {
        CLIInterface.showError(error instanceof Error ? error.message : 'Encryption failed');
    }
}

async function handleDecryption(options: any) {
    const decryptor = new Decryptor();
    const fileReader = new FileReader();
    const progressCallback = CLIInterface.createProgressCallback();

    try {
        if (options.text) {
            // Decrypt text
            CLIInterface.showInfo(`Decrypting text with ${options.algorithm.toUpperCase()}...`);
            const result = await decryptor.decryptText(options.text, options.algorithm, options.password);
            
            if (result.success) {
                CLIInterface.showSuccess('Text decrypted successfully!');
                console.log(chalk.yellow.bold('\nDecrypted text:'));
                console.log(chalk.green(result.data as string));
            } else {
                CLIInterface.showError(result.error || 'Text decryption failed');
            }
        } else if (options.input) {
            const isDirectory = await fileReader.isDirectory(options.input);
            
            if (isDirectory) {
                // Decrypt directory
                CLIInterface.showInfo(`Decrypting directory: ${options.input}`);
                const result = await decryptor.decryptDirectory(options.input, {
                    algorithm: options.algorithm,
                    password: options.password,
                    outputPath: options.output
                }, progressCallback);
                
                if (result.success) {
                    CLIInterface.showDirectoryResult(
                        'decrypt',
                        options.input,
                        result.data as string,
                        0, // We don't track individual file count in this simple version
                        result.metadata?.originalSize || 0
                    );
                } else {
                    CLIInterface.showError(result.error || 'Directory decryption failed');
                }
            } else {
                // Decrypt file
                if (!validateFilePath(options.input)) {
                    CLIInterface.showError(`File does not exist: ${options.input}`);
                    return;
                }
                
                const fileInfo = await fileReader.getFileInfo(options.input);
                CLIInterface.showFileInfo(fileInfo.path, fileInfo.size, options.algorithm);
                
                const result = await decryptor.decryptFile(options.input, {
                    algorithm: options.algorithm,
                    password: options.password,
                    outputPath: options.output
                }, progressCallback);
                
                if (result.success) {
                    CLIInterface.showDecryptionResult(
                        options.input,
                        result.data as string,
                        result.metadata?.originalSize || 0,
                        result.metadata?.encryptedSize || 0
                    );
                } else {
                    CLIInterface.showError(result.error || 'File decryption failed');
                }
            }
        }
    } catch (error) {
        CLIInterface.showError(error instanceof Error ? error.message : 'Decryption failed');
    }
}

main().catch(error => {
    CLIInterface.showError(error instanceof Error ? error.message : 'An unknown error occurred');
    process.exit(1);
});