# Native Android migration

The `native-android` branch is the first native migration stage of VoLTE Optimizer.

## Current stage

- Kotlin native Activity
- Android SDK 34 / Android 14 target
- No WebView and no HTML entry point in the native Activity
- Shizuku API 13.1.5 integration
- Shizuku permission/status handling
- Native network transport and validated-internet diagnostics
- Removed the previous placeholder VPN service that routed all traffic without implementing packet forwarding

## Next stages

1. Build and verify the APK.
2. Add a dedicated Shizuku command/service layer.
3. Add VoLTE/IMS diagnostics using only APIs that are available and safe on the target device.
4. Add operator/network information and signal diagnostics where Android permissions allow it.
5. Add guarded system-setting operations through Shizuku.
6. Add persistent settings, logs and a safe reset path.
7. Run Android 14 compatibility tests and package a release APK.

Shizuku is an optional capability. The app must remain usable when Shizuku is not running.
