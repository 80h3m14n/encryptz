#!/bin/bash

# EncryptZ Installation Script
echo "🔐 Installing EncryptZ - Advanced File Encryption Tool"
echo "=================================================="

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version $NODE_VERSION is too old. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
if npm install; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Build the project
echo "🔨 Building project..."
if npm run build; then
    echo "✅ Project built successfully"
else
    echo "❌ Failed to build project"
    exit 1
fi

# Run tests
echo "🧪 Running tests..."
if npm test; then
    echo "✅ All tests passed"
else
    echo "⚠️  Some tests failed, but installation can continue"
fi

echo ""
echo "🎉 EncryptZ installation completed!"
echo ""
echo "Usage examples:"
echo "  npm start -- encrypt --file document.txt --algorithm aes"
echo "  npm start -- decrypt --file document.txt.encrypted --algorithm aes"
echo "  npm start -- encrypt --directory ./folder --algorithm chacha20 --recursive"
echo ""
echo "For help: npm start -- encrypt --help"
echo "For documentation: see README.md"
