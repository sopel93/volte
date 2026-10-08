package com.sopel93.volte

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.telephony.SubscriptionManager
import android.telephony.ims.ImsManager
import android.telephony.ims.RegistrationManager
import androidx.core.content.ContextCompat

data class ImsReport(
    val supported: Boolean,
    val subscriptionId: Int?,
    val registration: String,
    val volte: String,
    val vowifi: String,
    val error: String? = null
)

object ImsDiagnostics {
    fun collect(context: Context): ImsReport {
        if (!context.packageManager.hasSystemFeature(PackageManager.FEATURE_TELEPHONY_IMS)) {
            return ImsReport(false, null, "IMS niedostępny", "Nieobsługiwane", "Nieobsługiwane")
        }
        if (ContextCompat.checkSelfPermission(context, Manifest.permission.READ_PHONE_STATE) != PackageManager.PERMISSION_GRANTED) {
            return ImsReport(true, null, "Brak uprawnienia", "Nieodczytane", "Nieodczytane", "Nadaj uprawnienie Telefon.")
        }
        return try {
            val subId = SubscriptionManager.getDefaultVoiceSubscriptionId()
            if (subId == SubscriptionManager.INVALID_SUBSCRIPTION_ID) {
                return ImsReport(true, null, "Brak aktywnej karty SIM", "Nieznane", "Nieznane")
            }
            val imsManager = context.getSystemService(ImsManager::class.java)
            val mmTel = imsManager.getImsMmTelManager(subId)
            val registration = runCatching {
                when (val state = mmTel.registrationState) {
                    RegistrationManager.REGISTRATION_STATE_REGISTERED -> "ZAREJESTROWANY"
                    RegistrationManager.REGISTRATION_STATE_REGISTERING -> "REJESTROWANIE"
                    RegistrationManager.REGISTRATION_STATE_NOT_REGISTERED -> "NIEZAREJESTROWANY"
                    else -> "STAN $state"
                }
            }.getOrElse { "Brak dostępu (${it.javaClass.simpleName})" }
            val volte = runCatching {
                if (mmTel.isAdvancedCallingSettingEnabled) "WŁĄCZONE" else "WYŁĄCZONE"
            }.getOrElse { "Niedostępne" }
            val vowifi = runCatching {
                if (mmTel.isVoWiFiSettingEnabled) "WŁĄCZONE" else "WYŁĄCZONE"
            }.getOrElse { "Niedostępne" }
            ImsReport(true, subId, registration, volte, vowifi)
        } catch (e: SecurityException) {
            ImsReport(true, null, "Brak uprawnień systemowych", "Niedostępne", "Niedostępne",
                "Android może wymagać READ_PRECISE_PHONE_STATE/carrier privileges dla szczegółów IMS.")
        } catch (e: Throwable) {
            ImsReport(true, null, "Błąd IMS", "Niedostępne", "Niedostępne", e.message)
        }
    }
}
