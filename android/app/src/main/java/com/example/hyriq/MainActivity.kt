package com.example.hyriq

import android.annotation.SuppressLint
import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.webkit.WebView
import android.webkit.WebViewClient
import android.webkit.WebChromeClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.example.hyriq.theme.HyriqTheme

import android.content.Intent
import android.net.Uri
import android.webkit.WebResourceRequest

class MainActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    // Request notification permission for Android 13+
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
        ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.POST_NOTIFICATIONS), 101)
      }
    }

    enableEdgeToEdge()
    setContent {
      HyriqTheme { 
        Surface(
          modifier = Modifier.fillMaxSize().statusBarsPadding(), 
          color = MaterialTheme.colorScheme.background
        ) { 
          HyriqWebView("https://www.hyriq.online") 
        } 
      }
    }
  }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun HyriqWebView(url: String) {
  AndroidView(
    factory = { context ->
      WebView(context).apply {
        webViewClient = object : WebViewClient() {
          override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
            val requestUrl = request?.url?.toString() ?: return false
            
            // If standard HTTP/HTTPS, let the webview load it
            if (requestUrl.startsWith("http://") || requestUrl.startsWith("https://")) {
              return false
            }
            
            // For custom URI schemes (like upi://, intent://, paytm://, phonepe://, bank apps)
            try {
              val intent = Intent(Intent.ACTION_VIEW, Uri.parse(requestUrl))
              context.startActivity(intent)
              return true // handled override loader
            } catch (e: Exception) {
              // App not installed
              return true
            }
          }
        }
        webChromeClient = WebChromeClient()
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.loadWithOverviewMode = true
        settings.useWideViewPort = true
        loadUrl(url)
      }
    },
    update = { webView ->
      // Can be used to load new urls
    },
    modifier = Modifier.fillMaxSize()
  )
}
