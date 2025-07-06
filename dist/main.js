"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commands_1 = require("./cli/commands");
const interface_1 = require("./cli/interface");
const encryptor_1 = require("./encryption/encryptor");
const decryptor_1 = require("./encryption/decryptor");
const file_reader_1 = require("./file-handlers/file-reader");
const validation_1 = require("./utils/validation");
const prompts_1 = __importDefault(require("prompts"));
const chalk_1 = __importDefault(require("chalk"));
async function main() {
    try {
        interface_1.CLIInterface.showBanner();
        // Parse command line arguments
        (0, commands_1.parseCommandLineArgs)();
        const options = (0, commands_1.getCommandOptions)();
        if (!options) {
            interface_1.CLIInterface.showHelp();
            return;
        }
        // Validate inputs
        if (!options.input && !options.text) {
            interface_1.CLIInterface.showError('No input specified. Use --file, --directory, or --text option.');
            return;
        }
        // Prompt for password if not provided and required
        if (!options.password && (options.algorithm === 'aes' || options.algorithm === 'chacha20')) {
            const response = await (0, prompts_1.default)({
                type: 'password',
                name: 'password',
                message: `Enter password for ${options.algorithm.toUpperCase()} ${options.action}:`
            });
            options.password = response.password;
        }
        if (options.action === 'encrypt') {
            await handleEncryption(options);
        }
        else if (options.action === 'decrypt') {
            await handleDecryption(options);
        }
        else {
            interface_1.CLIInterface.showError('Invalid action. Use "encrypt" or "decrypt".');
        }
    }
    catch (error) {
        interface_1.CLIInterface.showError(error instanceof Error ? error.message : 'An unknown error occurred');
        process.exit(1);
    }
}
async function handleEncryption(options) {
    var _a, _b, _c;
    const encryptor = new encryptor_1.Encryptor();
    const fileReader = new file_reader_1.FileReader();
    const progressCallback = interface_1.CLIInterface.createProgressCallback();
    try {
        if (options.text) {
            // Encrypt text
            interface_1.CLIInterface.showInfo(`Encrypting text with ${options.algorithm.toUpperCase()}...`);
            const result = await encryptor.encryptText(options.text, options.algorithm, options.password);
            if (result.success) {
                interface_1.CLIInterface.showSuccess('Text encrypted successfully!');
                console.log(chalk_1.default.yellow.bold('\nEncrypted text (Base64):'));
                console.log(chalk_1.default.cyan(Buffer.from(result.data).toString('base64')));
            }
            else {
                interface_1.CLIInterface.showError(result.error || 'Text encryption failed');
            }
        }
        else if (options.input) {
            const isDirectory = await fileReader.isDirectory(options.input);
            if (isDirectory) {
                // Encrypt directory
                interface_1.CLIInterface.showInfo(`Encrypting directory: ${options.input}`);
                const result = await encryptor.encryptDirectory(options.input, {
                    algorithm: options.algorithm,
                    password: options.password,
                    outputPath: options.output
                }, progressCallback);
                if (result.success) {
                    interface_1.CLIInterface.showDirectoryResult('encrypt', options.input, result.data, 0, // We don't track individual file count in this simple version
                    ((_a = result.metadata) === null || _a === void 0 ? void 0 : _a.originalSize) || 0);
                }
                else {
                    interface_1.CLIInterface.showError(result.error || 'Directory encryption failed');
                }
            }
            else {
                // Encrypt file
                if (!(0, validation_1.validateFilePath)(options.input)) {
                    interface_1.CLIInterface.showError(`File does not exist: ${options.input}`);
                    return;
                }
                const fileInfo = await fileReader.getFileInfo(options.input);
                interface_1.CLIInterface.showFileInfo(fileInfo.path, fileInfo.size, options.algorithm);
                const result = await encryptor.encryptFile(options.input, {
                    algorithm: options.algorithm,
                    password: options.password,
                    outputPath: options.output
                }, progressCallback);
                if (result.success) {
                    interface_1.CLIInterface.showEncryptionResult(options.input, result.data, ((_b = result.metadata) === null || _b === void 0 ? void 0 : _b.originalSize) || 0, ((_c = result.metadata) === null || _c === void 0 ? void 0 : _c.encryptedSize) || 0);
                }
                else {
                    interface_1.CLIInterface.showError(result.error || 'File encryption failed');
                }
            }
        }
    }
    catch (error) {
        interface_1.CLIInterface.showError(error instanceof Error ? error.message : 'Encryption failed');
    }
}
async function handleDecryption(options) {
    var _a, _b, _c;
    const decryptor = new decryptor_1.Decryptor();
    const fileReader = new file_reader_1.FileReader();
    const progressCallback = interface_1.CLIInterface.createProgressCallback();
    try {
        if (options.text) {
            // Decrypt text
            interface_1.CLIInterface.showInfo(`Decrypting text with ${options.algorithm.toUpperCase()}...`);
            const result = await decryptor.decryptText(options.text, options.algorithm, options.password);
            if (result.success) {
                interface_1.CLIInterface.showSuccess('Text decrypted successfully!');
                console.log(chalk_1.default.yellow.bold('\nDecrypted text:'));
                console.log(chalk_1.default.green(result.data));
            }
            else {
                interface_1.CLIInterface.showError(result.error || 'Text decryption failed');
            }
        }
        else if (options.input) {
            const isDirectory = await fileReader.isDirectory(options.input);
            if (isDirectory) {
                // Decrypt directory
                interface_1.CLIInterface.showInfo(`Decrypting directory: ${options.input}`);
                const result = await decryptor.decryptDirectory(options.input, {
                    algorithm: options.algorithm,
                    password: options.password,
                    outputPath: options.output
                }, progressCallback);
                if (result.success) {
                    interface_1.CLIInterface.showDirectoryResult('decrypt', options.input, result.data, 0, // We don't track individual file count in this simple version
                    ((_a = result.metadata) === null || _a === void 0 ? void 0 : _a.originalSize) || 0);
                }
                else {
                    interface_1.CLIInterface.showError(result.error || 'Directory decryption failed');
                }
            }
            else {
                // Decrypt file
                if (!(0, validation_1.validateFilePath)(options.input)) {
                    interface_1.CLIInterface.showError(`File does not exist: ${options.input}`);
                    return;
                }
                const fileInfo = await fileReader.getFileInfo(options.input);
                interface_1.CLIInterface.showFileInfo(fileInfo.path, fileInfo.size, options.algorithm);
                const result = await decryptor.decryptFile(options.input, {
                    algorithm: options.algorithm,
                    password: options.password,
                    outputPath: options.output
                }, progressCallback);
                if (result.success) {
                    interface_1.CLIInterface.showDecryptionResult(options.input, result.data, ((_b = result.metadata) === null || _b === void 0 ? void 0 : _b.originalSize) || 0, ((_c = result.metadata) === null || _c === void 0 ? void 0 : _c.encryptedSize) || 0);
                }
                else {
                    interface_1.CLIInterface.showError(result.error || 'File decryption failed');
                }
            }
        }
    }
    catch (error) {
        interface_1.CLIInterface.showError(error instanceof Error ? error.message : 'Decryption failed');
    }
}
main().catch(error => {
    interface_1.CLIInterface.showError(error instanceof Error ? error.message : 'An unknown error occurred');
    process.exit(1);
});
//# sourceMappingURL=main.js.map