package com.rtobuddy.nativeapp.ui.quest

import android.annotation.SuppressLint
import android.graphics.Color
import android.view.ViewGroup
import android.webkit.ConsoleMessage
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.FrameLayout
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
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

@SuppressLint("SetJavaScriptEnabled", "JavascriptInterface")
@Composable
fun QuestWorldView(
    modifier: Modifier = Modifier,
    events: QuestWorldEvents,
) {
    val context = LocalContext.current
    val bridge = remember { QuestJsBridge(events) }
    bridge.events = events

    AndroidView(
        modifier = modifier.fillMaxSize(),
        factory = { ctx ->
            FrameLayout(ctx).apply {
                layoutParams = FrameLayout.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT,
                )
                val webView = WebView(ctx).apply {
                    layoutParams = FrameLayout.LayoutParams(
                        ViewGroup.LayoutParams.MATCH_PARENT,
                        ViewGroup.LayoutParams.MATCH_PARENT,
                    )
                    setBackgroundColor(Color.parseColor("#0B1220"))
                    setLayerType(WebView.LAYER_TYPE_HARDWARE, null)
                    settings.javaScriptEnabled = true
                    settings.domStorageEnabled = true
                    settings.allowFileAccess = true
                    settings.allowContentAccess = true
                    settings.mediaPlaybackRequiresUserGesture = false
                    settings.cacheMode = WebSettings.LOAD_NO_CACHE
                    settings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                    @Suppress("DEPRECATION")
                    settings.allowFileAccessFromFileURLs = true
                    @Suppress("DEPRECATION")
                    settings.allowUniversalAccessFromFileURLs = true
                    webChromeClient = object : WebChromeClient() {
                        override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                            android.util.Log.d(
                                "Quest3D",
                                "${consoleMessage?.message()} @${consoleMessage?.lineNumber()}",
                            )
                            return true
                        }
                    }
                    webViewClient = object : WebViewClient() {
                        override fun onPageFinished(view: WebView?, url: String?) {
                            view?.evaluateJavascript(
                                "(function(){if(window.QuestWorld&&QuestWorld.ensureSized)QuestWorld.ensureSized();})();",
                                null,
                            )
                        }
                    }
                    addJavascriptInterface(bridge, "AndroidQuest")
                    loadQuestHtml(this)
                }
                addView(webView)
            }
        },
        update = { bridge.events = events },
    )
}

private fun loadQuestHtml(webView: WebView) {
    val assets = webView.context.assets
    val html = assets.open("quest3d/index.html").bufferedReader().use { it.readText() }
    val three = assets.open("quest3d/three.min.js").bufferedReader().use { it.readText() }
    val quest = assets.open("quest3d/quest.js").bufferedReader().use { it.readText() }
    val inlined = html
        .replace("""<script src="three.min.js"></script>""", "<script>\n$three\n</script>")
        .replace("""<script src="quest.js"></script>""", "<script>\n$quest\n</script>")
    webView.loadDataWithBaseURL(
        "https://appassets.androidplatform.net/quest3d/",
        inlined,
        "text/html",
        "UTF-8",
        null,
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
