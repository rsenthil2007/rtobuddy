package com.rtobuddy.nativeapp.ui.components

import android.annotation.SuppressLint
import android.graphics.Color
import android.webkit.WebView
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView

private val KNOWN = setOf(
    "give_way",
    "no_overtaking",
    "speed_limit",
    "pedestrian_crossing",
    "ambulance_priority",
    "signal_red",
    "signal_green",
    "signal_amber",
    "signal_flashing_red",
    "signal_flashing_amber",
    "lane_arrow",
    "zebra_crossing",
)

fun hasScenarioAnimation(type: String?): Boolean =
    !type.isNullOrBlank() && type in KNOWN

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun ScenarioAnimationView(
    animationType: String,
    modifier: Modifier = Modifier,
) {
    AndroidView(
        modifier = modifier
            .fillMaxWidth()
            .height(180.dp)
            .clip(RoundedCornerShape(12.dp)),
        factory = { context ->
            WebView(context).apply {
                setBackgroundColor(Color.TRANSPARENT)
                settings.javaScriptEnabled = true
                settings.domStorageEnabled = false
                isVerticalScrollBarEnabled = false
                isHorizontalScrollBarEnabled = false
            }
        },
        update = { webView ->
            val js = webView.context.assets.open("animations/bundle.js").bufferedReader().use { it.readText() }
            val safeType = animationType.replace("'", "")
            val html = """
                <!DOCTYPE html>
                <html>
                <head>
                  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"/>
                  <style>
                    html,body{margin:0;padding:0;background:#1e293b;overflow:hidden}
                    #root{display:flex;justify-content:center;align-items:center;min-height:180px}
                    .anim-svg{width:100%;height:auto;max-height:180px;display:block}
                  </style>
                </head>
                <body>
                  <div id="root"></div>
                  <script>
                  $js
                  (function(){
                    var type = '$safeType';
                    var fn = (typeof ANIMATIONS !== 'undefined') ? ANIMATIONS[type] : null;
                    document.getElementById('root').innerHTML = fn ? fn() : '';
                  })();
                  </script>
                </body>
                </html>
            """.trimIndent()
            webView.loadDataWithBaseURL(
                "file:///android_asset/animations/",
                html,
                "text/html",
                "UTF-8",
                null,
            )
        },
    )
}
