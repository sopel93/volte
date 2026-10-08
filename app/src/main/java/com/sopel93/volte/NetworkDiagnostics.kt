package com.sopel93.volte

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities

data class NetworkReport(
    val transport: String,
    val internet: String,
    val validated: Boolean,
    val metered: Boolean,
    val captivePortal: Boolean,
    val linkDownstream: Int,
    val linkUpstream: Int
)

object NetworkDiagnostics {
    fun collect(context: Context): NetworkReport {
        val cm = context.getSystemService(ConnectivityManager::class.java)
        val network = cm.activeNetwork ?: return NetworkReport("Brak", "BRAK", false, false, false, 0, 0)
        val caps = cm.getNetworkCapabilities(network)
            ?: return NetworkReport("Nieznana", "BRAK DANYCH", false, false, false, 0, 0)
        val transport = when {
            caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) -> "Wi‑Fi"
            caps.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) -> "Sieć komórkowa"
            caps.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET) -> "Ethernet"
            caps.hasTransport(NetworkCapabilities.TRANSPORT_VPN) -> "VPN"
            else -> "Inne"
        }
        val hasInternet = caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
        val validated = caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED)
        return NetworkReport(
            transport = transport,
            internet = when {
                validated -> "DOSTĘPNY"
                hasInternet -> "NIEPOTWIERDZONY"
                else -> "BRAK"
            },
            validated = validated,
            metered = !caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_NOT_METERED),
            captivePortal = caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_CAPTIVE_PORTAL),
            linkDownstream = caps.linkDownstreamBandwidthKbps,
            linkUpstream = caps.linkUpstreamBandwidthKbps
        )
    }
}
