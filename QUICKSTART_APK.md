# Quick Start: Build APK with Expo

Get your Archive app running on Android in 5 minutes!

## Step 1: Install & Login (One-time)

```bash
npm install
npm install -g expo-cli eas-cli
eas login
```

## Step 2: Build APK

```bash
# Cloud build (easiest, no SDK required)
eas build --platform android
```

## Step 3: Install on Device

1. Go to https://expo.dev, sign in, and find your build
2. Click **Download** to get the APK
3. Transfer to your Android device and tap to install

## That's it! 🎉

Your app is now on your Android device.

---

## Alternative: Test First

Before building the full APK:

```bash
# Start dev server
npm start

# In another terminal, run on Android
npm run android
```

---

## Troubleshooting

**"eas login" fails?**
- Create account at https://expo.dev
- Try again

**Build fails?**
```bash
# Clear cache and rebuild
eas build:cache --platform android --clear
eas build --platform android
```

**Can't install APK?**
- Android settings → Security → Allow unknown sources
- Use ADB: `adb install app.apk`

---

## Full Details

See `EXPO_SETUP.md` for complete setup instructions.
