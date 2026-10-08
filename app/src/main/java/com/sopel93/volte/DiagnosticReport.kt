package com.sopel93.volte

import android.content.Context
import android.os.Build
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object DiagnosticReport {
    fun create(context: Context): String {
        val network = NetworkDiagnostics.collect(context)
        val telephony = TelephonyDiagnostics.collect(context)
        val ims = ImsDiagnostics.collect(context)
        val shizuku = ShizukuDiagnostics.collect()
        val version = runCatching {
            context.packageManager.getPackageInfo(context.packageName, 0).versionName ?: "nieznana"
        }.getOrDefault("nieznana")
        val time = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(Date())

        return buildString {
            appendLine("VoLTE Optimizer - raport diagnostyczny")
            appendLine("Wygenerowano: $time")
            appendLine("Wersja aplikacji: $version")
            appendLine("Android: ${Build.VERSION.RELEASE} (API ${Build.VERSION.SDK_INT})")
            appendLine("Urządzenie: ${Build.MANUFACTURER} ${Build.MODEL}")
            appendLine()
            appendLine("[SHIZUKU]")
            appendLine("Dostępne: ${if (shizuku.available) "tak" else "nie"}")
            appendLine("Autoryzowane: ${if (shizuku.granted) "tak" else "nie"}")
            appendLine("Tryb: ${shizuku.mode}")
            appendLine()
            appendLine("[SIEĆ]")
            appendLine("Transport: ${network.transport}")
            appendLine("Internet: ${network.internet}")
            appendLine("Walidacja: ${if (network.validated) "OK" else "brak"}")
            appendLine("Metered: ${if (network.metered) "tak" else "nie"}")
            appendLine("Captive portal: ${if (network.captivePortal) "tak" else "nie"}")
            appendLine("Łącze: ↓ ${network.linkDownstream} kb/s, ↑ ${network.linkUpstream} kb/s")
            appendLine()
            appendLine("[TELEFONIA / SIM]")
            appendLine("Obsługa telefonii: ${if (telephony.supported) "tak" else "nie"}")
            appendLine("Operator: ${telephony.operator.ifBlank { "brak danych" }}")
            appendLine("Kraj: ${telephony.country.ifBlank { "brak" }}")
            appendLine("Technologia danych: ${telephony.networkType}")
            appendLine("Stan usługi: ${telephony.serviceState}")
            appendLine("Aktywne modemy: ${telephony.activeModems}")
            telephony.sims.forEach {
                appendLine("SIM ${it.slot}: ${it.carrier}, MCC/MNC ${it.mccMnc}, stan ${it.state}, kraj ${it.country}, roaming ${if (it.dataRoaming) "tak" else "nie"}")
            }
            appendLine("Komórki radiowe odczytane: ${telephony.cells.size}")
            telephony.error?.let { appendLine("Uwaga: $it") }
            appendLine()
            appendLine("[IMS / VoLTE]")
            appendLine("Obsługa IMS: ${if (ims.supported) "tak" else "nie"}")
            appendLine("Subskrypcja głosowa: ${ims.subscriptionId ?: "brak"}")
            appendLine("Rejestracja IMS: ${ims.registration}")
            appendLine("VoLTE / Advanced Calling: ${ims.volte}")
            appendLine("VoWiFi: ${ims.vowifi}")
            ims.error?.let { appendLine("Uwaga: $it") }
            appendLine()
            appendLine("Raport zawiera wyłącznie informacje diagnostyczne odczytane przez aplikację.")
        }
    }
}
