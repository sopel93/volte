package com.sopel93.volte

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Typeface
import android.os.Bundle
import android.speech.tts.TextToSpeech
import android.provider.Settings
import android.view.View
import android.widget.Button
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import rikka.shizuku.Shizuku
import java.util.Locale

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
    private lateinit var dashboardShizuku: TextView
    private lateinit var dashboardNetwork: TextView
    private lateinit var dashboardIms: TextView
    private lateinit var shizukuButton: Button
    private var welcomeTts: TextToSpeech? = null

    private val binderListener = Shizuku.OnBinderReceivedListener { runOnUiThread { refreshAll() } }
    private val permissionListener = Shizuku.OnRequestPermissionResultListener { requestCode, _ ->
        if (requestCode == SHIZUKU_REQUEST_CODE) runOnUiThread { refreshAll() }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Shizuku.addBinderReceivedListener(binderListener)
        Shizuku.addRequestPermissionResultListener(permissionListener)
        setContentView(buildUi())
        initWelcomeVoice()
        requestTelephonyPermissionsIfNeeded()
        refreshAll()
    }

    override fun onDestroy() {
        welcomeTts?.stop()
        welcomeTts?.shutdown()
        welcomeTts = null
        Shizuku.removeBinderReceivedListener(binderListener)
        Shizuku.removeRequestPermissionResultListener(permissionListener)
        super.onDestroy()
    }

    private fun buildUi(): View {
        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(16), dp(16), dp(16), dp(28))
            setBackgroundColor(0xFFF4F6FA.toInt())
        }

        val header = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(20), dp(20), dp(20), dp(20))
            setBackgroundResource(R.drawable.bg_header)
        }
        header.addView(TextView(this).apply {
            text = "⚡ VoLTE OPTIMIZER"
            textSize = 27f
            typeface = Typeface.DEFAULT_BOLD
            setTextColor(0xFFFFFFFF.toInt())
        }, matchWrap())
        header.addView(TextView(this).apply {
            text = "Centrum diagnostyki sieci • IMS • SIM • Shizuku"
            textSize = 14f
            setTextColor(0xFFE9D5FF.toInt())
            setPadding(0, dp(5), 0, 0)
        }, matchWrap())
        root.addView(header, matchWrap(dp(12)))

        val dashboard = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
        dashboardShizuku = dashboardItem(dashboard, "SHIZUKU")
        dashboardNetwork = dashboardItem(dashboard, "SIEĆ")
        dashboardIms = dashboardItem(dashboard, "IMS")
        root.addView(dashboard, matchWrap(dp(12)))

        root.addView(actionButton("🔊  Odtwórz powitanie") { speakWelcome() }, matchWrap(dp(8)))
        root.addView(actionButton("📤  Utwórz i udostępnij raport") { shareDiagnosticReport() }, matchWrap(dp(16)))

        val shizukuBox = verticalBox()
        shizukuBox.addView(sectionTitle("🟣  Shizuku"))
        shizukuStatus = statusText()
        shizukuBox.addView(shizukuStatus, matchWrap())
        shizukuButton = actionButton("Sprawdź / nadaj uprawnienie Shizuku") { requestShizukuPermission() }
        shizukuBox.addView(shizukuButton, matchWrap(dp(8)))
        shizukuBox.addView(actionButton("Otwórz Shizuku") { openShizuku() }, matchWrap())
        root.addView(card(shizukuBox), matchWrap(dp(12)))

        val networkBox = verticalBox()
        networkBox.addView(sectionTitle("📡  Sieć i internet"))
        networkStatus = statusText()
        networkBox.addView(networkStatus, matchWrap())
        networkBox.addView(actionButton("Odśwież diagnostykę") { refreshAll() }, matchWrap(dp(8)))
        networkBox.addView(actionButton("Otwórz ustawienia sieci") {
            startActivity(Intent(Settings.ACTION_WIRELESS_SETTINGS))
        }, matchWrap())
        root.addView(card(networkBox), matchWrap(dp(12)))

        val simBox = verticalBox()
        simBox.addView(sectionTitle("📱  SIM • operator • radio"))
        telephonyStatus = statusText()
        simBox.addView(telephonyStatus, matchWrap())
        simBox.addView(actionButton("Otwórz ustawienia SIM") { openSimSettings() }, matchWrap())
        root.addView(card(simBox), matchWrap(dp(12)))

        val imsBox = verticalBox()
        imsBox.addView(sectionTitle("⚡  VoLTE / IMS"))
        imsStatus = statusText()
        imsBox.addView(imsStatus, matchWrap())
        imsBox.addView(actionButton("Sprawdź IMS ponownie") { refreshIms() }, matchWrap())
        root.addView(card(imsBox), matchWrap(dp(12)))

        val safeBox = verticalBox()
        safeBox.addView(sectionTitle("🛡  Bezpieczne operacje"))
        safeBox.addView(TextView(this).apply {
            text = "Aplikacja działa natywnie na Androidzie 14. Odczytuje stan sieci, SIM, radia i IMS oraz sprawdza Shizuku. Nie zmienia operatora, APN, trybu sieci ani konfiguracji IMS w tle. Operacje przez Shizuku są wykonywane wyłącznie po wyraźnym poleceniu."
            textSize = 14f
            setTextColor(0xFF475467.toInt())
        }, matchWrap())
        root.addView(card(safeBox), matchWrap(dp(12)))

        val infoBox = verticalBox()
        infoBox.addView(sectionTitle("ℹ️  Informacje"))
        val version = runCatching { packageManager.getPackageInfo(packageName, 0).versionName ?: "nieznana" }
            .getOrDefault("nieznana")
        infoBox.addView(TextView(this).apply {
            text = "Wersja: $version\nAndroid: ${android.os.Build.VERSION.RELEASE} (API ${android.os.Build.VERSION.SDK_INT})\nUrządzenie: ${android.os.Build.MANUFACTURER} ${android.os.Build.MODEL}\n\nBrak WebView. Aplikacja jest w pełni natywna."
            textSize = 14f
            setTextColor(0xFF475467.toInt())
        }, matchWrap())
        root.addView(card(infoBox), matchWrap())

        return ScrollView(this).apply {
            isFillViewport = true
            addView(root)
        }
    }

    private fun dashboardItem(parent: LinearLayout, label: String): TextView {
        val view = TextView(this).apply {
            text = "• $label\nSprawdzam"
            textSize = 11f
            typeface = Typeface.DEFAULT_BOLD
            setTextColor(0xFF344054.toInt())
            setPadding(dp(8), dp(10), dp(8), dp(10))
            setBackgroundColor(0xFFFFFFFF.toInt())
        }
        parent.addView(view, LinearLayout.LayoutParams(0, LinearLayout.LayoutParams.WRAP_CONTENT, 1f).apply {
            setMargins(dp(2), 0, dp(2), 0)
        })
        return view
    }

    private fun actionButton(label: String, onClick: () -> Unit) = Button(this).apply {
        text = label
        textSize = 14f
        setTextColor(0xFFFFFFFF.toInt())
        setBackgroundResource(R.drawable.bg_button)
        stateListAnimator = null
        minHeight = dp(52)
        setAllCaps(false)
        setOnClickListener { onClick() }
    }

    private fun initWelcomeVoice() {
        welcomeTts = TextToSpeech(this) { result ->
            if (result == TextToSpeech.SUCCESS) {
                val status = welcomeTts?.setLanguage(Locale("pl", "PL"))
                if (status != TextToSpeech.LANG_MISSING_DATA && status != TextToSpeech.LANG_NOT_SUPPORTED) {
                    welcomeTts?.setSpeechRate(0.92f)
                    welcomeTts?.setPitch(1.0f)
                    speakWelcome()
                }
            }
        }
    }

    private fun speakWelcome() {
        welcomeTts?.let { runCatching { it.speak("Witamy w aplikacji Wojtka Sobczaka.", TextToSpeech.QUEUE_FLUSH, null, "volte_welcome") } }
    }

    private fun shareDiagnosticReport() {
        Thread {
            val report = runCatching { DiagnosticReport.create(this) }
                .getOrElse { "Nie udało się utworzyć raportu: ${it.message ?: "nieznany błąd"}" }
            runOnUiThread {
                val intent = Intent(Intent.ACTION_SEND).apply {
                    type = "text/plain"
                    putExtra(Intent.EXTRA_SUBJECT, "VoLTE Optimizer - raport diagnostyczny")
                    putExtra(Intent.EXTRA_TEXT, report)
                }
                startActivity(Intent.createChooser(intent, "Udostępnij raport"))
            }
        }.start()
    }

    private fun refreshAll() {
        refreshShizuku()
        refreshNetwork()
        refreshTelephony()
        refreshIms()
    }

    private fun refreshShizuku() {
        val report = ShizukuDiagnostics.collect()
        dashboardShizuku.text = when {
            !report.available -> "• SHIZUKU\nOffline"
            !report.granted -> "• SHIZUKU\nBrak zgody"
            else -> "• SHIZUKU\nOK"
        }
        shizukuStatus.text = when {
            !report.available -> "● Shizuku: niedostępne. Uruchom usługę."
            !report.granted -> "● Shizuku: działa, ale brak autoryzacji aplikacji."
            else -> "● Shizuku: autoryzowane\nTryb: ${report.mode}"
        }
        shizukuButton.isEnabled = report.available
    }

    private fun refreshNetwork() {
        val r = NetworkDiagnostics.collect(this)
        dashboardNetwork.text = "• SIEĆ\n${if (r.internet) "Online" else "Offline"}"
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
                if (r.cells.isNotEmpty()) append("\nKomórki radiowe: ${r.cells.size} (szczegóły po zgodzie na lokalizację).")
                r.error?.let { append("\n\nUwaga: $it") }
            }
            runOnUiThread { telephonyStatus.text = text }
        }.start()
    }

    private fun refreshIms() {
        imsStatus.text = "Sprawdzam IMS..."
        Thread {
            val r = ImsDiagnostics.collect(this)
            val text = "Obsługa IMS: ${if (r.supported) "tak" else "nie"}\nSIM/subskrypcja: ${r.subscriptionId ?: "brak"}\nRejestracja IMS: ${r.registration}\nVoLTE / Advanced Calling: ${r.volte}\nVoWiFi: ${r.vowifi}" +
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
            if (!Shizuku.pingBinder()) { openShizuku(); return }
            if (Shizuku.checkSelfPermission() == PackageManager.PERMISSION_GRANTED) { refreshShizuku(); return }
            if (Shizuku.shouldShowRequestPermissionRationale()) openShizuku()
            else Shizuku.requestPermission(SHIZUKU_REQUEST_CODE)
        } catch (_: Throwable) { openShizuku() }
    }

    private fun openShizuku() {
        packageManager.getLaunchIntentForPackage(SHIZUKU_PACKAGE)?.let(::startActivity)
    }

    private fun openSimSettings() {
        runCatching { startActivity(Intent("android.settings.SIM_SETTINGS")) }
            .onFailure { startActivity(Intent(Settings.ACTION_WIRELESS_SETTINGS)) }
    }

    private fun card(content: View) = LinearLayout(this).apply {
        orientation = LinearLayout.VERTICAL
        setPadding(dp(16), dp(16), dp(16), dp(16))
        setBackgroundColor(0xFFFFFFFF.toInt())
        elevation = dp(3).toFloat()
        addView(content)
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
