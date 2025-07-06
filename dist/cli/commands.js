"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCommandLineArgs = parseCommandLineArgs;
exports.executeCommand = executeCommand;
exports.getCommandOptions = getCommandOptions;
const commander_1 = require("commander");
const validation_1 = require("../utils/validation");
function parseCommandLineArgs() {
    const program = new commander_1.Command();
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
function executeEncrypt(options) {
    const commandOptions = {
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
    }
    else if (options.file) {
        commandOptions.input = options.file;
    }
    global.encryptzOptions = commandOptions;
}
function executeDecrypt(options) {
    const commandOptions = {
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
    }
    else if (options.file) {
        commandOptions.input = options.file;
    }
    global.encryptzOptions = commandOptions;
}
function validateAlgorithm(algorithm) {
    if (!(0, validation_1.isValidEncryptionAlgorithm)(algorithm)) {
        console.error(`Invalid algorithm: ${algorithm}. Supported algorithms: aes, rsa, chacha20`);
        process.exit(1);
    }
    return algorithm;
}
function executeCommand(command) {
    // This function can be used for programmatic command execution
    const args = command.split(' ');
    process.argv = ['node', 'encryptz', ...args];
    parseCommandLineArgs();
}
// Helper function to get parsed options
function getCommandOptions() {
    return global.encryptzOptions || null;
}
//# sourceMappingURL=commands.js.map