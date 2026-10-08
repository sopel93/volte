# VoLTE Optimizer - native Android

Branch: `native-android`

This branch contains the native Android 14 migration of the original project.

## Current functionality

- Native Kotlin Activity, no WebView.
- Android SDK 34 / targetSdk 34.
- Shizuku availability and authorization status.
- Native network diagnostics.
- SIM and operator information.
- Cellular technology detection including LTE and 5G NR when Android exposes it.
- IMS registration and VoLTE/Advanced Calling status when Android exposes it.
- VoWiFi status when Android exposes it.
- Cell information when location permission allows access.
- Links to official Android network/SIM settings.
- GitHub Actions debug APK build.

## Safety boundary

The app does not silently modify APN, preferred network mode, IMS configuration, modem settings, or carrier provisioning.

Android protects detailed phone/IMS information with restricted or carrier-level permissions. The app reports unavailable data instead of bypassing those protections through hidden APIs.

Shizuku is currently used for controlled authorization/status detection. Future system operations must remain explicit, reversible where possible, logged, and confirmed by the user.

## Build

GitHub Actions workflow `.github/workflows/android-build.yml` builds:

`app/build/outputs/apk/debug/app-debug.apk`

The workflow is intended to make APK creation possible directly from the GitHub repository without requiring a PC.
