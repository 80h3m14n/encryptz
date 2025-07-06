# Getting Started with EncryptZ

## Quick Installation

1. **Run the installation script:**
   ```bash
   ./install.sh
   ```

   Or manually:
   ```bash
   npm install
   npm run build
   ```

## First Steps

### 1. Encrypt Your First File

```bash
# Encrypt a text file with AES
npm start -- encrypt --file examples/sample.txt --algorithm aes --password "MySecurePass123!"
```

This will create `examples/sample.txt.encrypted`

### 2. Decrypt the File

```bash
# Decrypt the file
npm start -- decrypt --file examples/sample.txt.encrypted --algorithm aes --password "MySecurePass123!"
```

This will create `examples/sample.txt.decrypted`

### 3. Encrypt Text Directly

```bash
# Encrypt text from command line
npm start -- encrypt --text "Hello, World!" --algorithm aes --password "MySecurePass123!"
```

### 4. Encrypt a Directory

```bash
# Encrypt all files in examples directory
npm start -- encrypt --directory examples --algorithm chacha20 --password "MySecurePass123!" --recursive
```

### 5. Decrypt a Directory

```bash
# Decrypt a directory
npm start -- decrypt --directory examples_encrypted --algorithm aes --password "MySecurePass123!" --recursive
```

## Algorithm Comparison

| Feature            | AES-256     | RSA-2048     | ChaCha20    |
|--------------------|-------------|--------------|-------------|
| Speed              | Fast        | Slow         | Fastest     |
| Security           | Excellent   | Excellent    | Excellent   |
| Password Required  | Yes         | No           | Yes         |
| File Size Limit    | None        | None*        | None        |
| Best For           | General use | Key exchange | High performance |

*RSA uses hybrid encryption for large files

## Security Best Practices

1. **Use Strong Passwords:**
   - Minimum 8 characters
   - Mix of uppercase, lowercase, numbers, symbols
   - Example: `MyStr0ng!P@ssw0rd`

2. **Choose the Right Algorithm:**
   - **AES**: Best for most use cases
   - **ChaCha20**: Best for performance-critical applications
   - **RSA**: Best for small files or when you need asymmetric encryption

3. **Secure Your Passwords:**
   - Never hardcode passwords in scripts
   - Use environment variables or secure password managers
   - Let the tool prompt for passwords when possible

## Common Use Cases

### Backup Encryption
```bash
# Encrypt important documents
npm start -- encrypt --directory ~/Documents/Important --algorithm aes --output ~/Backup/Documents.encrypted --recursive
```

### Secure File Transfer
```bash
# Encrypt before sending
npm start -- encrypt --file sensitive-data.xlsx --algorithm chacha20
# Send the .encrypted file
# Recipient decrypts with the same password
```

### Text Message Encryption
```bash
# Encrypt sensitive text
npm start -- encrypt --text "Confidential information here" --algorithm aes
# Share the encrypted output safely
```

## Troubleshooting

### "Module not found" errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### TypeScript compilation errors
```bash
# Check TypeScript configuration
npm run lint
npm run build
```

### Performance issues with large files
- Use ChaCha20 for fastest encryption
- Ensure sufficient RAM for very large files
- Consider encrypting in smaller batches for huge datasets

## Next Steps

1. Read the full README.md for advanced features
2. Check out the examples/ directory for more test files
3. Explore the source code in src/ directory

## Need Help?

- Check the comprehensive README.md
- Look at example commands in examples/README.md
- Open an issue on GitHub for bugs or feature requests
