package com.sopel93.volte

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.telephony.ServiceState
import android.telephony.SubscriptionManager
import android.telephony.TelephonyManager
import androidx.core.content.ContextCompat

data class SimInfo(
    val slot: Int,
    val subscriptionId: Int,
    val carrier: String,
    val mccMnc: String,
    val country: String,
    val state: String,
    val dataRoaming: Boolean
)

data class TelephonyReport(
    val supported: Boolean,
    val activeModems: Int,
    val networkType: String,
    val operator: String,
    val country: String,
    val serviceState: String,
    val sims: List<SimInfo>,
    val cells: List<String>,
    val error: String? = null
)

object TelephonyDiagnostics {
    fun collect(context: Context): TelephonyReport {
        if (!context.packageManager.hasSystemFeature(PackageManager.FEATURE_TELEPHONY)) {
            return TelephonyReport(false, 0, "Brak telefonii", "", "", "", emptyList(), emptyList())
        }
        if (ContextCompat.checkSelfPermission(context, Manifest.permission.READ_PHONE_STATE) != PackageManager.PERMISSION_GRANTED) {
            return TelephonyReport(true, 0, "Brak uprawnienia", "", "", "", emptyList(), emptyList(),
                "Nadaj uprawnienie Telefon, aby odczytać SIM/operatora.")
        }
        return try {
            val tm = context.getSystemService(TelephonyManager::class.java)
            val sm = context.getSystemService(SubscriptionManager::class.java)
            val sims = runCatching {
                sm.activeSubscriptionInfoList.orEmpty().map { info ->
                    val perSim = tm.createForSubscriptionId(info.subscriptionId)
                    SimInfo(
                        info.simSlotIndex + 1, info.subscriptionId,
                        info.carrierName?.toString().orEmpty().ifBlank { "Nieznany" },
                        perSim.simOperator.orEmpty().ifBlank { "brak" },
                        perSim.simCountryIso.orEmpty().ifBlank { "brak" },
                        simStateLabel(perSim.simState),
                        runCatching { perSim.isDataRoamingEnabled }.getOrDefault(false)
                    )
                }
            }.getOrDefault(emptyList())

            val cells = if (ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
                runCatching { tm.allCellInfo.orEmpty().take(12).map { it.toString().take(240) } }.getOrDefault(emptyList())
            } else emptyList()

            TelephonyReport(
                true,
                runCatching { tm.activeModemCount }.getOrDefault(sims.size.coerceAtMost(2)),
                runCatching { networkTypeLabel(tm.dataNetworkType) }.getOrDefault("Nieznany"),
                runCatching { tm.networkOperatorName.orEmpty() }.getOrDefault("Nieznany"),
                runCatching { tm.networkCountryIso.orEmpty() }.getOrDefault("brak"),
                runCatching { serviceStateLabel(tm.serviceState) }.getOrDefault("Nieznany"),
                sims, cells
            )
        } catch (e: SecurityException) {
            TelephonyReport(true, 0, "Odmowa dostępu", "", "", "", emptyList(), emptyList(), e.message)
        } catch (e: Throwable) {
            TelephonyReport(true, 0, "Błąd", "", "", "", emptyList(), emptyList(), e.message)
        }
    }

    private fun simStateLabel(state: Int) = when (state) {
        TelephonyManager.SIM_STATE_READY -> "Gotowa"
        TelephonyManager.SIM_STATE_ABSENT -> "Brak SIM"
        TelephonyManager.SIM_STATE_PIN_REQUIRED -> "PIN"
        TelephonyManager.SIM_STATE_PUK_REQUIRED -> "PUK"
        TelephonyManager.SIM_STATE_NETWORK_LOCKED -> "Zablokowana sieciowo"
        else -> "Nieznany ($state)"
    }

    private fun serviceStateLabel(state: ServiceState) = when (state.state) {
        ServiceState.STATE_IN_SERVICE -> "W zasięgu / usługa aktywna"
        ServiceState.STATE_OUT_OF_SERVICE -> "Poza usługą"
        ServiceState.STATE_EMERGENCY_ONLY -> "Tylko alarmowe"
        else -> "Stan nieznany"
    }

    private fun networkTypeLabel(type: Int) = when (type) {
        TelephonyManager.NETWORK_TYPE_NR -> "5G NR"
        TelephonyManager.NETWORK_TYPE_LTE -> "4G LTE"
        TelephonyManager.NETWORK_TYPE_HSPAP -> "HSPA+"
        TelephonyManager.NETWORK_TYPE_HSDPA -> "HSDPA"
        TelephonyManager.NETWORK_TYPE_HSUPA -> "HSUPA"
        TelephonyManager.NETWORK_TYPE_UMTS -> "3G UMTS"
        TelephonyManager.NETWORK_TYPE_GSM -> "2G GSM"
        TelephonyManager.NETWORK_TYPE_EDGE -> "2G EDGE"
        TelephonyManager.NETWORK_TYPE_GPRS -> "2G GPRS"
        else -> "Typ $type"
    }
}
