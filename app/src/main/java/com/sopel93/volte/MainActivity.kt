package com.sopel93.volte

import android.os.Bundle
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        webView = WebView(this).apply {
            // Włączenie obsługi skryptów i pamięci podręcznej dla Vercela
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.databaseEnabled = true
            settings.cacheMode = WebSettings.LOAD_DEFAULT

            // Wymuszenie otwierania strony wewnątrz aplikacji (blokuje wychodzenie do Chrome)
            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                    return false
                }
            }

            // Wczytanie dokładnego interfejsu z Twojej strony Vercel
            loadUrl("https://volte-omega.vercel.app")
        }

        setContentView(webView)
    }

    // Obsługa przycisku "Wstecz" na telefonie wewnątrz aplikacji
    override fun onBackPressed() {
        if (::webView.isInitialized && webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
