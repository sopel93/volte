package com.sopel93.volte

import android.content.pm.PackageManager
import rikka.shizuku.Shizuku

data class ShizukuReport(
    val available: Boolean,
    val granted: Boolean,
    val uid: Int?,
    val mode: String
)

object ShizukuDiagnostics {
    fun collect(): ShizukuReport {
        val available = runCatching { Shizuku.pingBinder() }.getOrDefault(false)
        val granted = available && runCatching {
            Shizuku.checkSelfPermission() == PackageManager.PERMISSION_GRANTED
        }.getOrDefault(false)
        val uid = if (granted) runCatching { Shizuku.getUid() }.getOrNull() else null
        val mode = when (uid) {
            0 -> "root (UID 0)"
            2000 -> "ADB/shell (UID 2000)"
            null -> "brak autoryzacji"
            else -> "UID $uid"
        }
        return ShizukuReport(available, granted, uid, mode)
    }
}
