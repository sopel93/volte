package com.sopel93.volte

import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Typeface
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.card.MaterialCardView
import rikka.shizuku.Shizuku

class MainActivity : AppCompatActivity() {

    companion object {
        private const val SHIZUKU_REQUEST_CODE = 1001
        private const val SHIZUKU_PACKAGE = "moe.shizuku.privileged.api"
    }

    private lateinit var shizukuStatus: TextView
    private lateinit var networkStatus: TextView
    private lateinit var shizukuButton: Button

    private val binderListener = Shizuku.OnBinderReceivedListener {
        runOnUiThread { refreshStatus() }
    }

    private val permissionListener =
        Shizuku.OnRequestPermissionResultListener { requestCode, _ ->
            if (requestCode == SHIZUKU_REQUEST_CODE) {
                runOnUiThread { refreshStatus() }
            }
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Shizuku.addBinderReceivedListener(binderListener)
        Shizuku.addRequestPermissionResultListener(permissionListener)
        setContentView(buildUi())
        refreshStatus()
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
            text = "Natywna aplikacja Android 14 • bez WebView"
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
        shizukuCard.addView(shizukuBox)
        root.addView(shizukuCard, matchWrap(dp(12)))

        val networkCard = card()
        val networkBox = verticalBox()
        networkBox.addView(sectionTitle("Połączenie"))
        networkStatus = statusText()
        networkBox.addView(networkStatus, matchWrap())
        networkBox.addView(Button(this).apply {
            text = "Odśwież status sieci"
            setOnClickListener { refreshNetworkStatus() }
        }, matchWrap())
        networkCard.addView(networkBox)
        root.addView(networkCard, matchWrap(dp(12)))

        val infoCard = card()
        infoCard.addView(TextView(this).apply {
            text = "Etap 1 przebudowy\n\n• natywny interfejs Kotlin\n• Android 14 / SDK 34\n• integracja Shizuku\n• diagnostyka sieci\n• brak ładowania strony HTML\n\nKolejne etapy: operacje systemowe przez Shizuku, diagnostyka VoLTE/IMS, bezpieczne ustawienia sieci i testy."
            textSize = 15f
            setTextColor(0xFF344054.toInt())
            setPadding(dp(16), dp(16), dp(16), dp(16))
        })
        root.addView(infoCard, matchWrap())

        return ScrollView(this).apply { addView(root) }
    }

    private fun refreshStatus() {
        val binderReady = try {
            Shizuku.pingBinder()
        } catch (_: Throwable) {
            false
        }

        val granted = binderReady && try {
            Shizuku.checkSelfPermission() == PackageManager.PERMISSION_GRANTED
        } catch (_: Throwable) {
            false
        }

        shizukuStatus.text = when {
            !binderReady -> "● Shizuku: niedostępne. Uruchom usługę Shizuku."
            granted -> "● Shizuku: aktywne i autoryzowane."
            else -> "● Shizuku: działa, ale aplikacja nie ma jeszcze uprawnienia."
        }

        shizukuButton.isEnabled = binderReady
        refreshNetworkStatus()
    }

    private fun requestShizukuPermission() {
        try {
            if (!Shizuku.pingBinder()) {
                openShizuku()
                return
            }

            if (Shizuku.checkSelfPermission() == PackageManager.PERMISSION_GRANTED) {
                refreshStatus()
                return
            }

            if (Shizuku.shouldShowRequestPermissionRationale()) {
                openShizuku()
            } else {
                Shizuku.requestPermission(SHIZUKU_REQUEST_CODE)
            }
        } catch (_: Throwable) {
            openShizuku()
        }
    }

    private fun openShizuku() {
        val intent: Intent? = packageManager.getLaunchIntentForPackage(SHIZUKU_PACKAGE)
        if (intent != null) startActivity(intent)
    }

    private fun refreshNetworkStatus() {
        val cm = getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
        val network = cm.activeNetwork
        val caps = network?.let(cm::getNetworkCapabilities)

        networkStatus.text = when {
            caps == null -> "● Brak aktywnego połączenia sieciowego."
            caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) ->
                "● Wi‑Fi aktywne\nInternet: ${internetState(caps)}"
            caps.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) ->
                "● Sieć komórkowa aktywna\nInternet: ${internetState(caps)}"
            caps.hasTransport(NetworkCapabilities.TRANSPORT_ETHERNET) ->
                "● Ethernet aktywny\nInternet: ${internetState(caps)}"
            else -> "● Sieć aktywna\nInternet: ${internetState(caps)}"
        }
    }

    private fun internetState(caps: NetworkCapabilities): String =
        if (caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET) &&
            caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED)
        ) "dostępny" else "niepotwierdzony"

    private fun card() = MaterialCardView(this).apply {
        radius = dp(18).toFloat()
        cardElevation = dp(2).toFloat()
        setContentPadding(dp(16), dp(16), dp(16), dp(16))
    }

    private fun verticalBox() = LinearLayout(this).apply {
        orientation = LinearLayout.VERTICAL
    }

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

    private fun dp(value: Int): Int =
        (value * resources.displayMetrics.density).toInt()

    private fun matchWrap(bottomMargin: Int = 0) =
        LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
        ).apply {
            if (bottomMargin > 0) this.bottomMargin = bottomMargin
        }
}
