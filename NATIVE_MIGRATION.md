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


## Etap 2: VoLTE / IMS / SIM / sieć

Dodano:
- panel VoLTE/IMS oparty o publiczne Android Telephony IMS APIs;
- odczyt stanu rejestracji IMS, Advanced Calling/Enhanced 4G LTE oraz VoWiFi, gdy system udostępnia te dane;
- informacje o aktywnych kartach SIM, operatorze, MCC/MNC, kraju, roamingu danych i stanie SIM;
- diagnostykę transportu sieciowego, walidacji Internetu, metered/captive portal oraz deklarowanej przepustowości łącza;
- odczyt dostępnych informacji o komórkach radiowych po przyznaniu lokalizacji;
- panel Shizuku pokazujący dostępność, autoryzację i UID/tryb;
- przyciski prowadzące do oficjalnych ustawień Androida zamiast wykonywania ryzykownych zmian w tle;
- runtime permissions dla READ_PHONE_STATE i ACCESS_FINE_LOCATION.

### Ograniczenia Androida

Szczegółowy stan IMS może być chroniony przez READ_PRECISE_PHONE_STATE albo carrier privileges. Dlatego aplikacja nie udaje, że ma dostęp do danych, których Android/OEM/operator nie udostępnia. W takim przypadku pokazuje dokładnie, że odczyt jest ograniczony.

Shizuku na tym etapie jest używane konserwatywnie: autoryzacja i identyfikacja trybu są gotowe, natomiast operacje zmieniające konfigurację sieci/IMS nie są wykonywane automatycznie. Kolejny etap może dodać kontrolowane operacje systemowe z potwierdzeniem i logiem.
