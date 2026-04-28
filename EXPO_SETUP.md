# Expo Setup Guide for Archive App

This guide will help you set up and build an APK for the Archive app using Expo CLI.

## Prerequisites

- Node.js 18+ and npm/pnpm installed
- Expo account (create at https://expo.dev)
- EAS CLI installed

## Step 1: Install Dependencies

```bash
# Using npm
npm install

# Or using pnpm
pnpm install

# Or using yarn
yarn install
```

## Step 2: Install Expo CLI and EAS CLI

```bash
# Install Expo CLI globally (if not already installed)
npm install -g expo-cli

# Install EAS CLI
npm install -g eas-cli

# Authenticate with Expo
eas login
```

## Step 3: Initialize EAS (First Time Only)

```bash
# This will set up your project with Expo
eas init --id $(uuidgen)
```

When prompted, select:
- **Platform**: Android
- **Build type**: APK (for APK output)

## Step 4: Generate Required Assets

Create placeholder assets in the `assets/` directory:

### Minimal Setup (Quick Testing)
If you don't have icons/splash screens yet, you can skip the visual assets. The app will use defaults.

### Full Setup (Production)
Generate or provide these files in `assets/`:
- `icon.png` (1024x1024)
- `splash.png` (1242x2436)
- `adaptive-icon.png` (1080x1080)
- `favicon.png` (192x192)

## Step 5: Build the APK

### Option A: Cloud Build (Recommended)
No Android SDK needed on your machine:

```bash
# Build APK in the cloud
eas build --platform android

# For internal/testing distribution
eas build --platform android --profile android-apk

# When asked which device to build for, choose "Android"
# When asked about app signing, let EAS handle it (recommended for first build)
```

### Option B: Local Build
Requires Android SDK installed:

```bash
# Install Android SDK first
# Then run
eas build --platform android --local
```

## Step 6: Download and Install APK

After the build completes:

1. Go to https://expo.dev and sign in
2. Navigate to your build
3. Click "Download" to get the APK file
4. Transfer the APK to your Android device
5. Open the APK file and install it
6. Or use ADB: `adb install ./path/to/app.apk`

## Development Testing

To test the app during development:

```bash
# Start the Expo development server
npm start

# Then in another terminal, run on Android
npm run android

# Or preview in web
npm run web
```

## Troubleshooting

### Build Fails with "Gradle Error"
- Make sure `android/local.properties` exists if doing local builds
- Clear cache: `eas build:cache --platform android --clear`

### "Expo not initialized" Error
- Run: `eas init --id $(uuidgen)`
- Update `app.json` with your project details

### Cannot Install APK
- Check device settings: Settings → Security → Allow installation from unknown sources
- Use ADB: `adb install -r ./app.apk`

### Connection Issues
- Make sure device is on same WiFi as development machine
- Check firewall settings
- Restart Expo: `npm start --clear`

## Next Steps

1. **Add Custom Icons**: Create app icons and place in `assets/` folder
2. **Configure App Details**: Edit `app.json` with your app name, version, etc.
3. **Build for Production**: Use `eas build --platform android` for Play Store submission
4. **Set Up Signing**: Configure Play Store signing in EAS dashboard

## Resources

- [Expo Documentation](https://docs.expo.dev)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [React Native Docs](https://reactnative.dev)
- [Archive.org API](https://archive.org/developers/)

## Important Notes

- The app currently fetches data from archive.org's API
- Make sure you have internet connectivity for the app to work
- The app uses AsyncStorage for local vault storage
- All data is stored locally on the device
