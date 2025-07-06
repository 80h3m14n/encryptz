# EncryptZ Examples

This directory contains example files to test EncryptZ functionality.

## Quick Start

1. **Encrypt a text file:**
   ```bash
   npm start encrypt --file examples/sample.txt --algorithm aes --password "MySecurePass123!"
   ```

2. **Decrypt the encrypted file:**
   ```bash
   npm start decrypt --file examples/sample.txt.encrypted --algorithm aes --password "MySecurePass123!"
   ```

3. **Encrypt the entire examples directory:**
   ```bash
   npm start encrypt --directory examples --algorithm chacha20 --password "MySecurePass123!" --recursive
   ```

## Test Files

- `sample.txt` - A simple text file for testing
- `data.json` - Sample JSON data
- `image.jpg` - A small test image (binary file)
- `large-text.txt` - Larger text file for performance testing

## Security Notes

- Always use strong passwords for real encryption
- The example password "MySecurePass123!" is for demonstration only
- Never commit real encrypted files to version control
