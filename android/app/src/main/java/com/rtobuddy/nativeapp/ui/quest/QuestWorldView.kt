package com.rtobuddy.nativeapp.ui.quest

import android.annotation.SuppressLint
import android.graphics.Color
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView

data class QuestWorldEvents(
    val onReady: () -> Unit = {},
    val onScenarioStart: (String) -> Unit = {},
    val onSceneResult: (chapterId: String, sceneId: String, safe: Boolean) -> Unit = { _, _, _ -> },
    val onScenarioComplete: (scenarioId: String, safe: Boolean) -> Unit = { _, _ -> },
    val onExitToMap: () -> Unit = {},
)

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun QuestWorldView(
    modifier: Modifier = Modifier,
    events: QuestWorldEvents,
) {
    val context = LocalContext.current
    val bridge = remember(events) {
        QuestJsBridge(events)
    }

    DisposableEffect(Unit) {
        onDispose {
            // WebView cleaned up with AndroidView disposal
        }
    }

    AndroidView(
        modifier = modifier.fillMaxSize(),
        factory = {
            WebView(context).apply {
                setBackgroundColor(Color.parseColor("#0B1220"))
                settings.javaScriptEnabled = true
                settings.domStorageEnabled = true
                settings.allowFileAccess = true
                settings.allowContentAccess = true
                settings.mediaPlaybackRequiresUserGesture = false
                settings.cacheMode = WebSettings.LOAD_DEFAULT
                settings.mixedContentMode = WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE
                webChromeClient = WebChromeClient()
                webViewClient = WebViewClient()
                addJavascriptInterface(bridge, "AndroidQuest")
                loadUrl("file:///android_asset/quest3d/index.html")
            }
        },
        update = { webView ->
            bridge.events = events
            // keep existing page; events rebound
            webView
        },
    )
}

private class QuestJsBridge(
    @Volatile var events: QuestWorldEvents,
) {
    @JavascriptInterface
    fun onReady() {
        events.onReady()
    }

    @JavascriptInterface
    fun onScenarioStart(id: String?) {
        events.onScenarioStart(id.orEmpty())
    }

    @JavascriptInterface
    fun onSceneResult(chapterId: String?, sceneId: String?, safeFlag: String?) {
        events.onSceneResult(
            chapterId.orEmpty(),
            sceneId.orEmpty(),
            safeFlag == "1" || safeFlag.equals("true", ignoreCase = true),
        )
    }

    @JavascriptInterface
    fun onScenarioComplete(scenarioId: String?, safeFlag: String?) {
        events.onScenarioComplete(
            scenarioId.orEmpty(),
            safeFlag == "1" || safeFlag.equals("true", ignoreCase = true),
        )
    }

    @JavascriptInterface
    fun onExitToMap() {
        events.onExitToMap()
    }
}
