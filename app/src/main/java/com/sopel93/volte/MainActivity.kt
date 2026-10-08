package com.sopel93.volte

import android.content.ComponentName
import android.content.ServiceConnection
import android.content.pm.PackageManager
import android.os.Bundle
import android.os.IBinder
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import rikka.shizuku.Shizuku
import rikka.shizuku.Shizuku.OnRequestPermissionResultListener
import rikka.shizuku.Shizuku.UserServiceArgs

/**
 * VOLT — tuner Realme 9 Pro 5G przez Shizuku.
 * Shizuku 13.1.5: UserService zamiast usuniętego Shizuku.newProcess().
 */
class MainActivity : AppCompatActivity() {

    private lateinit var status: TextView
    private lateinit var logView: TextView
    private var shell: IShellService? = null
    private var serviceBound = false

    private val userServiceArgs by lazy {
        UserServiceArgs(ComponentName(packageName, ShellService::class.java.name))
            .daemon(false)
            .processNameSuffix("shell")
            .debuggable(BuildConfig.DEBUG)
            .version(BuildConfig.VERSION_CODE)
    }

    private val permissionListener = OnRequestPermissionResultListener { requestCode, grantResult ->
        if (requestCode != REQ_SHIZUKU) return@OnRequestPermissionResultListener
        if (grantResult == PackageManager.PERMISSION_GRANTED) {
            log("Uprawnienie Shizuku przyznane")
            bindShell()
        } else {
            log("Odmowa Shizuku — otwórz aplikację Shizuku i włącz VOLT")
        }
        renderStatus()
    }

    private val binderReceived = Shizuku.OnBinderReceivedListener {
        runOnUiThread {
            log("Binder Shizuku aktywny")
            renderStatus()
            if (hasShizukuPermission()) bindShell()
        }
    }

    private val binderDead = Shizuku.OnBinderDeadListener {
        runOnUiThread {
            shell = null
            serviceBound = false
            log("Shizuku padło — uruchom je ponownie")
            renderStatus()
        }
    }

    private val connection = object : ServiceConnection {
        override fun onServiceConnected(name: ComponentName, service: IBinder) {
            shell = IShellService.Stub.asInterface(service)
            log("Shell UserService połączony (uid shell)")
            renderStatus()
        }

        override fun onServiceDisconnected(name: ComponentName) {
            shell = null
            serviceBound = false
            log("UserService rozłączony")
            renderStatus()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        status = findViewById(R.id.status)
        logView = findViewById(R.id.log)
        logView.tag = logView.text.toString()
        bindClicks()

        Shizuku.addRequestPermissionResultListener(permissionListener)
        Shizuku.addBinderReceivedListenerSticky(binderReceived)
        Shizuku.addBinderDeadListener(binderDead)

        renderStatus()
        if (isShizukuLive() && hasShizukuPermission()) bindShell()
    }

    override fun onDestroy() {
        Shizuku.removeRequestPermissionResultListener(permissionListener)
        Shizuku.removeBinderReceivedListener(binderReceived)
        Shizuku.removeBinderDeadListener(binderDead)
        if (serviceBound) {
            try {
                Shizuku.unbindUserService(userServiceArgs, connection, true)
            } catch (_: Throwable) {
            }
            serviceBound = false
        }
        super.onDestroy()
    }

    private fun bindClicks() {
        findViewById<android.view.View>(R.id.btn_shizuku).setOnClickListener { requestShizuku() }
        findViewById<android.view.View>(R.id.btn_grant).setOnClickListener {
            runAndLog("WRITE_SECURE_SETTINGS", TunerCommands.GRANT_SECURE)
        }
        findViewById<android.view.View>(R.id.btn_apply_all).setOnClickListener {
            runAndLog("Cały tuner", TunerCommands.APPLY_ALL)
        }
        findViewById<android.view.View>(R.id.btn_smart5g).setOnClickListener {
            runAndLog("Inteligentne 5G OFF", TunerCommands.SMART_5G_OFF)
        }
        findViewById<android.view.View>(R.id.btn_network_auto).setOnClickListener {
            runAndLog("Typ sieci NSA", TunerCommands.NETWORK_AUTO_5G)
        }
        findViewById<android.view.View>(R.id.btn_data_saver).setOnClickListener {
            runAndLog("Oszczędzanie danych OFF", TunerCommands.DATA_SAVER_OFF)
        }
        findViewById<android.view.View>(R.id.btn_always_on).setOnClickListener {
            runAndLog("mobile_data_always_on", TunerCommands.MOBILE_ALWAYS_ON)
        }
        findViewById<android.view.View>(R.id.btn_battery).setOnClickListener {
            runAndLog("Bateria", TunerCommands.BATTERY_BALANCED)
            runAndLog("Otwórz baterię", TunerCommands.OPEN_BATTERY)
        }
        findViewById<android.view.View>(R.id.btn_dual).setOnClickListener {
            runAndLog("Wi-Fi / dwukanałowe", TunerCommands.OPEN_WIFI)
        }
        findViewById<android.view.View>(R.id.btn_sim).setOnClickListener {
            runAndLog("Karta SIM", TunerCommands.OPEN_SIM)
        }
        findViewById<android.view.View>(R.id.btn_dns_cf).setOnClickListener {
            runAndLog("DNS Cloudflare", TunerCommands.privateDns("one.one.one.one"))
        }
        findViewById<android.view.View>(R.id.btn_dns_google).setOnClickListener {
            runAndLog("DNS Google", TunerCommands.privateDns("dns.google"))
        }
        findViewById<android.view.View>(R.id.btn_dns_quad9).setOnClickListener {
            runAndLog("DNS Quad9", TunerCommands.privateDns("dns.quad9.net"))
        }
        findViewById<android.view.View>(R.id.btn_dns_adguard).setOnClickListener {
            runAndLog("DNS AdGuard", TunerCommands.privateDns("dns.adguard-dns.com"))
        }
        findViewById<android.view.View>(R.id.btn_dns_off).setOnClickListener {
            runAndLog("DNS off", TunerCommands.DNS_OFF)
        }
        findViewById<android.view.View>(R.id.btn_apn_ipv6).setOnClickListener {
            runAndLog("APN IPv4/IPv6", TunerCommands.APN_IPV4V6)
        }
        findViewById<android.view.View>(R.id.btn_apn_play).setOnClickListener {
            runAndLog(
                "APN Play",
                TunerCommands.insertApn("Play Internet", "internet", "260", "06"),
            )
        }
        findViewById<android.view.View>(R.id.btn_apn_orange).setOnClickListener {
            runAndLog(
                "APN Orange",
                TunerCommands.insertApn("Orange Internet", "internet", "260", "03"),
            )
        }
        findViewById<android.view.View>(R.id.btn_apn_plus).setOnClickListener {
            runAndLog(
                "APN Plus",
                TunerCommands.insertApn("Plus Internet", "plus", "260", "01", "plusgsm", "plusgsm"),
            )
        }
        findViewById<android.view.View>(R.id.btn_apn_tmobile).setOnClickListener {
            runAndLog(
                "APN T-Mobile",
                TunerCommands.insertApn("T-Mobile Internet", "internet", "260", "02"),
            )
        }
        findViewById<android.view.View>(R.id.btn_apn_open).setOnClickListener {
            runAndLog("Lista APN", TunerCommands.OPEN_APN)
        }
        findViewById<android.view.View>(R.id.btn_volte).setOnClickListener {
            runAndLog("VoLTE", TunerCommands.VOLTE_ON)
        }
        findViewById<android.view.View>(R.id.btn_vowifi).setOnClickListener {
            runAndLog("VoWiFi", TunerCommands.VOWIFI_ON)
        }
        findViewById<android.view.View>(R.id.btn_radioinfo).setOnClickListener {
            runAndLog("RadioInfo", TunerCommands.RADIO_INFO)
        }
    }

    private fun isShizukuLive(): Boolean = try {
        Shizuku.pingBinder()
    } catch (_: Throwable) {
        false
    }

    private fun hasShizukuPermission(): Boolean = try {
        Shizuku.checkSelfPermission() == PackageManager.PERMISSION_GRANTED
    } catch (_: Throwable) {
        false
    }

    private fun requestShizuku() {
        if (!isShizukuLive()) {
            log("Shizuku nie działa. Zainstaluj Shizuku, włącz debugowanie bezprzewodowe i uruchom parowanie.")
            renderStatus()
            return
        }
        if (hasShizukuPermission()) {
            log("Uprawnienie już jest")
            bindShell()
            renderStatus()
            return
        }
        Shizuku.requestPermission(REQ_SHIZUKU)
    }

    private fun bindShell() {
        if (serviceBound || !isShizukuLive() || !hasShizukuPermission()) return
        try {
            Shizuku.bindUserService(userServiceArgs, connection)
            serviceBound = true
        } catch (t: Throwable) {
            serviceBound = false
            log("bindUserService: ${t.message}")
        }
    }

    private fun runShell(command: String): String {
        val svc = shell ?: return "Brak UserService — najpierw połącz Shizuku"
        return try {
            svc.exec(command)
        } catch (t: Throwable) {
            "błąd: ${t.message}"
        }
    }

    private fun runAndLog(title: String, command: String) {
        if (!ensureReady()) return
        log("→ $title")
        Thread {
            val out = runShell(command)
            runOnUiThread { log(out) }
        }.start()
    }

    private fun ensureReady(): Boolean {
        if (!isShizukuLive()) {
            log("Shizuku wyłączone")
            renderStatus()
            return false
        }
        if (!hasShizukuPermission()) {
            requestShizuku()
            return false
        }
        if (shell == null) {
            bindShell()
            log("Czekam na UserService… wciśnij ponownie za sekundę")
            return false
        }
        return true
    }

    private fun renderStatus() {
        val live = isShizukuLive()
        val perm = live && hasShizukuPermission()
        val ready = perm && shell != null
        status.text = when {
            ready -> "Shizuku · shell gotowy"
            perm -> "Shizuku · uprawnienie OK, łączę UserService"
            live -> "Shizuku działa · brak zgody dla VOLT"
            else -> "Shizuku wyłączone"
        }
        status.setTextColor(
            ContextCompat.getColor(
                this,
                if (ready) R.color.volt_signal else if (live) R.color.volt_muted else R.color.volt_danger,
            ),
        )
    }

    private fun log(line: String) {
        val next = (logView.tag as? String).orEmpty() + line.trimEnd() + "\n\n"
        logView.tag = next
        logView.text = next
    }

    companion object {
        private const val REQ_SHIZUKU = 9001
    }
}
