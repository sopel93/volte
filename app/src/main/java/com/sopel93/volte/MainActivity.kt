package com.sopel93.volte

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Typeface
import android.net.Uri
import android.os.Bundle
import android.provider.Settings
import android.view.View
import android.widget.Button
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.google.android.material.card.MaterialCardView
import rikka.shizuku.Shizuku

class MainActivity : AppCompatActivity() {
    companion object {
        private const val SHIZUKU_REQUEST_CODE = 1001
        private const val TELEPHONY_REQUEST_CODE = 1002
        private const val SHIZUKU_PACKAGE = "moe.shizuku.privileged.api"
    }

    private lateinit var shizukuStatus: TextView
    private lateinit var networkStatus: TextView
    private lateinit var telephonyStatus: TextView
    private lateinit var imsStatus: TextView
    private lateinit var shizukuButton: Button

    private val binderListener = Shizuku.OnBinderReceivedListener {
        runOnUiThread { refreshAll() }
    }

    private val permissionListener = Shizuku.OnRequestPermissionResultListener { requestCode, _ ->
        if (requestCode == SHIZUKU_REQUEST_CODE) runOnUiThread { refreshAll() }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Shizuku.addBinderReceivedListener(binderListener)
        Shizuku.addRequestPermissionResultListener(permissionListener)
        setContentView(buildUi())
        requestTelephonyPermissionsIfNeeded()
        refreshAll()
    }

    override fun onDestroy() {
        Shizuku.removeBinderReceivedListener(binderListener)
        Shizuku.removeRequestPermissionResultListener(permissionListener)
        super.onDestroy()
    }

    private fun buildUi(): View {
        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(20), dp(18), dp(20), dp(24))
            setBackgroundColor(0xFFF5F7FA.toInt())
        }

        root.addView(TextView(this).apply {
            text = "VoLTE Optimizer"
            textSize = 28f
            typeface = Typeface.DEFAULT_BOLD
            setTextColor(0xFF101828.toInt())
        }, matchWrap())

        root.addView(TextView(this).apply {
            text = "Natywna aplikacja Android 14 • diagnostyka VoLTE / IMS"
            textSize = 14f
            setTextColor(0xFF667085.toInt())
            setPadding(0, dp(4), 0, dp(18))
        }, matchWrap())

        val shizukuCard = card()
        val shizukuBox = verticalBox()
        shizukuBox.addView(sectionTitle("Shizuku"))
        shizukuStatus = statusText()
        shizukuBox.addView(shizukuStatus, matchWrap())
        shizukuButton = Button(this).apply {
            text = "Sprawdź / nadaj uprawnienie Shizuku"
            setOnClickListener { requestShizukuPermission() }
        }
        shizukuBox.addView(shizukuButton, matchWrap())
        shizukuBox.addView(Button(this).apply {
            text = "Otwórz Shizuku"
            setOnClickListener { openShizuku() }
        }, matchWrap())
        shizukuCard.addView(shizukuBox)
        root.addView(shizukuCard, matchWrap(dp(12)))

        val networkCard = card()
        val networkBox = verticalBox()
        networkBox.addView(sectionTitle("Diagnostyka sieci"))
        networkStatus = statusText()
        networkBox.addView(networkStatus, matchWrap())
        networkBox.addView(Button(this).apply {
            text = "Odśwież diagnostykę"
            setOnClickListener { refreshAll() }
        }, matchWrap())
        networkBox.addView(Button(this).apply {
            text = "Otwórz ustawienia sieci"
            setOnClickListener { startActivity(Intent(Settings.ACTION_WIRELESS_SETTINGS)) }
        }, matchWrap())
        networkCard.addView(networkBox)
        root.addView(networkCard, matchWrap(dp(12)))

        val simCard = card()
        val simBox = verticalBox()
        simBox.addView(sectionTitle("SIM / operator / radio"))
        telephonyStatus = statusText()
        simBox.addView(telephonyStatus, matchWrap())
        simBox.addView(Button(this).apply {
            text = "Otwórz ustawienia SIM"
            setOnClickListener { openSimSettings() }
        }, matchWrap())
        simCard.addView(simBox)
        root.addView(simCard, matchWrap(dp(12)))

        val imsCard = card()
        val imsBox = verticalBox()
        imsBox.addView(sectionTitle("VoLTE / IMS"))
        imsStatus = statusText()
        imsBox.addView(imsStatus, matchWrap())
        imsBox.addView(Button(this).apply {
            text = "Sprawdź IMS ponownie"
            setOnClickListener { refreshIms() }
        }, matchWrap())
        imsCard.addView(imsBox)
        root.addView(imsCard, matchWrap(dp(12)))

        val safeCard = card()
        safeCard.addView(TextView(this).apply {
            text = "Bezpieczne operacje\n\nNa tym etapie aplikacja tylko odczytuje stan systemu i otwiera oficjalne ustawienia Androida. Nie zmienia operatora, APN, trybu sieci ani konfiguracji IMS w tle. Funkcje modyfikujące przez Shizuku dodamy dopiero po testach i z potwierdzeniem użytkownika."
            textSize = 15f
            setTextColor(0xFF344054.toInt())
            setPadding(dp(16), dp(16), dp(16), dp(16))
        })
        root.addView(safeCard, matchWrap())

        return ScrollView(this).apply { addView(root) }
    }

    private fun refreshAll() {
        refreshShizuku()
        refreshNetwork()
        refreshTelephony()
        refreshIms()
    }

    private fun refreshShizuku() {
        val report = ShizukuDiagnostics.collect()
        shizukuStatus.text = when {
            !report.available -> "● Shizuku: niedostępne. Uruchom usługę."
            !report.granted -> "● Shizuku: działa, ale brak autoryzacji aplikacji."
            else -> "● Shizuku: autoryzowane\nTryb: ${report.mode}"
        }
        shizukuButton.isEnabled = report.available
    }

    private fun refreshNetwork() {
        val r = NetworkDiagnostics.collect(this)
        networkStatus.text = "Transport: ${r.transport}\nInternet: ${r.internet}\nWalidacja: ${if (r.validated) "OK" else "brak"}\nMetered: ${if (r.metered) "tak" else "nie"}\nCaptive portal: ${if (r.captivePortal) "wykryty" else "nie"}\nŁącze: ↓ ${r.linkDownstream} kb/s • ↑ ${r.linkUpstream} kb/s"
    }

    private fun refreshTelephony() {
        telephonyStatus.text = "Odczyt..."
        Thread {
            val r = TelephonyDiagnostics.collect(this)
            val text = buildString {
                append("Operator: ${r.operator.ifBlank { "brak danych" }}\n")
                append("Kraj sieci: ${r.country.ifBlank { "brak" }}\n")
                append("Technologia danych: ${r.networkType}\n")
                append("Stan usługi: ${r.serviceState}\n")
                append("Aktywne modemy: ${r.activeModems}\n\n")
                if (r.sims.isEmpty()) append("SIM: brak danych lub brak aktywnej karty.\n")
                r.sims.forEach {
                    append("SIM ${it.slot}: ${it.carrier} • ${it.mccMnc}\n")
                    append("  stan: ${it.state}, kraj: ${it.country}, roaming danych: ${if (it.dataRoaming) "tak" else "nie"}\n")
                }
                if (r.cells.isNotEmpty()) {
                    append("\nKomórki radiowe: ${r.cells.size} (szczegóły dostępne po zgodzie na lokalizację).")
                }
                r.error?.let { append("\n\nUwaga: $it") }
            }
            runOnUiThread { telephonyStatus.text = text }
        }.start()
    }

    private fun refreshIms() {
        imsStatus.text = "Sprawdzam IMS..."
        Thread {
            val r = ImsDiagnostics.collect(this)
            val text = "Obsługa IMS: ${if (r.supported) "tak" else "nie"}\n" +
                "SIM/subskrypcja: ${r.subscriptionId ?: "brak"}\n" +
                "Rejestracja IMS: ${r.registration}\n" +
                "VoLTE / Advanced Calling: ${r.volte}\n" +
                "VoWiFi: ${r.vowifi}" +
                (r.error?.let { "\n\nUwaga: $it" } ?: "")
            runOnUiThread { imsStatus.text = text }
        }.start()
    }

    private fun requestTelephonyPermissionsIfNeeded() {
        val missing = buildList {
            if (ContextCompat.checkSelfPermission(this@MainActivity, Manifest.permission.READ_PHONE_STATE) != PackageManager.PERMISSION_GRANTED) add(Manifest.permission.READ_PHONE_STATE)
            if (ContextCompat.checkSelfPermission(this@MainActivity, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) add(Manifest.permission.ACCESS_FINE_LOCATION)
        }
        if (missing.isNotEmpty()) ActivityCompat.requestPermissions(this, missing.toTypedArray(), TELEPHONY_REQUEST_CODE)
    }

    private fun requestShizukuPermission() {
        try {
            if (!Shizuku.pingBinder()) {
                openShizuku()
                return
            }
            if (Shizuku.checkSelfPermission() == PackageManager.PERMISSION_GRANTED) {
                refreshShizuku()
                return
            }
            if (Shizuku.shouldShowRequestPermissionRationale()) openShizuku()
            else Shizuku.requestPermission(SHIZUKU_REQUEST_CODE)
        } catch (_: Throwable) {
            openShizuku()
        }
    }

    private fun openShizuku() {
        packageManager.getLaunchIntentForPackage(SHIZUKU_PACKAGE)?.let(::startActivity)
    }

    private fun openSimSettings() {
        val intent = Intent("android.settings.SIM_SETTINGS")
        runCatching { startActivity(intent) }.onFailure {
            startActivity(Intent(Settings.ACTION_WIRELESS_SETTINGS))
        }
    }

    private fun card() = MaterialCardView(this).apply {
        radius = dp(18).toFloat()
        cardElevation = dp(2).toFloat()
        setContentPadding(dp(16), dp(16), dp(16), dp(16))
    }

    private fun verticalBox() = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL }

    private fun sectionTitle(text: String) = TextView(this).apply {
        this.text = text
        textSize = 19f
        typeface = Typeface.DEFAULT_BOLD
        setTextColor(0xFF101828.toInt())
        setPadding(0, 0, 0, dp(8))
    }

    private fun statusText() = TextView(this).apply {
        textSize = 15f
        setTextColor(0xFF344054.toInt())
        setPadding(0, 0, 0, dp(8))
    }

    private fun dp(value: Int) = (value * resources.displayMetrics.density).toInt()

    private fun matchWrap(bottomMargin: Int = 0) = LinearLayout.LayoutParams(
        LinearLayout.LayoutParams.MATCH_PARENT,
        LinearLayout.LayoutParams.WRAP_CONTENT
    ).apply { if (bottomMargin > 0) this.bottomMargin = bottomMargin }
}
