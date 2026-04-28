#!/bin/bash

echo "🚀 Setting up Archive App for Expo..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js is installed"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Check if Expo CLI is installed
if ! command -v expo &> /dev/null; then
    echo ""
    echo "📲 Installing Expo CLI globally..."
    npm install -g expo-cli
fi

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo ""
    echo "🔧 Installing EAS CLI globally..."
    npm install -g eas-cli
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Log in to Expo: eas login"
echo "2. Start development: npm start"
echo "3. Build APK: npm run build:android"
echo ""
echo "For more details, see EXPO_SETUP.md"
