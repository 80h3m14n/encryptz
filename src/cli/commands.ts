import { Command } from 'commander';
import { CommandOptions, EncryptionAlgorithm } from '../types';
import { isValidEncryptionAlgorithm } from '../utils/validation';

// Extend global interface for storing command options
declare global {
    var encryptzOptions: CommandOptions | undefined;
}

export function parseCommandLineArgs(): CommandOptions {
    const program = new Command();

    program
        .name('encryptz')
        .description('Encrypt/decrypt files and directories with multiple algorithms')
        .version('1.0.0');

    program
        .command('encrypt')
        .description('Encrypt text, file, or directory')
        .option('-f, --file <path>', 'file to encrypt')
        .option('-d, --directory <path>', 'directory to encrypt')
        .option('-t, --text <text>', 'text to encrypt')
        .option('-a, --algorithm <algorithm>', 'encryption algorithm (aes, rsa, chacha20)', 'aes')
        .option('-p, --password <password>', 'password for encryption')
        .option('-o, --output <path>', 'output path')
        .option('-r, --recursive', 'encrypt directory recursively', false)
        .option('--preserve-structure', 'preserve directory structure', false)
        .action((options) => {
            executeEncrypt(options);
        });

    program
        .command('decrypt')
        .description('Decrypt text, file, or directory')
        .option('-f, --file <path>', 'file to decrypt')
        .option('-d, --directory <path>', 'directory to decrypt')
        .option('-t, --text <text>', 'text to decrypt')
        .option('-a, --algorithm <algorithm>', 'decryption algorithm (aes, rsa, chacha20)', 'aes')
        .option('-p, --password <password>', 'password for decryption')
        .option('-o, --output <path>', 'output path')
        .option('-r, --recursive', 'decrypt directory recursively', false)
        .option('--preserve-structure', 'preserve directory structure', false)
        .action((options) => {
            executeDecrypt(options);
        });

    program.parse();

    // Return default options if no command is executed
    return {
        action: 'encrypt',
        algorithm: 'aes',
        recursive: false,
        preserveStructure: false
    };
}

function executeEncrypt(options: any): void {
    const commandOptions: CommandOptions = {
        action: 'encrypt',
        input: options.file || options.directory,
        text: options.text,
        algorithm: validateAlgorithm(options.algorithm),
        password: options.password,
        output: options.output,
        recursive: options.recursive || false,
        preserveStructure: options.preserveStructure || false
    };

    if (options.directory) {
        commandOptions.input = options.directory;
    } else if (options.file) {
        commandOptions.input = options.file;
    }

    global.encryptzOptions = commandOptions;
}

function executeDecrypt(options: any): void {
    const commandOptions: CommandOptions = {
        action: 'decrypt',
        input: options.file || options.directory,
        text: options.text,
        algorithm: validateAlgorithm(options.algorithm),
        password: options.password,
        output: options.output,
        recursive: options.recursive || false,
        preserveStructure: options.preserveStructure || false
    };

    if (options.directory) {
        commandOptions.input = options.directory;
    } else if (options.file) {
        commandOptions.input = options.file;
    }

    global.encryptzOptions = commandOptions;
}

function validateAlgorithm(algorithm: string): EncryptionAlgorithm {
    if (!isValidEncryptionAlgorithm(algorithm)) {
        console.error(`Invalid algorithm: ${algorithm}. Supported algorithms: aes, rsa, chacha20`);
        process.exit(1);
    }
    return algorithm as EncryptionAlgorithm;
}

export function executeCommand(command: string): void {
    // This function can be used for programmatic command execution
    const args = command.split(' ');
    process.argv = ['node', 'encryptz', ...args];
    parseCommandLineArgs();
}

// Helper function to get parsed options
export function getCommandOptions(): CommandOptions | null {
    return (global as any).encryptzOptions || null;
}