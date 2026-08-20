package com.rtobuddy.nativeapp

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.rtobuddy.nativeapp.ui.RtoBuddyAppUi
import com.rtobuddy.nativeapp.ui.theme.AppThemeId
import com.rtobuddy.nativeapp.ui.theme.RtoBuddyTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val app = application as RtoBuddyApp
        setContent {
            val themeName by app.container.repository.themeId.collectAsStateWithLifecycle(initialValue = "CLASSIC")
            val themeId = AppThemeId.fromStored(themeName)
            RtoBuddyTheme(themeId = themeId) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = androidx.compose.material3.MaterialTheme.colorScheme.background,
                ) {
                    RtoBuddyAppUi(
                        repository = app.container.repository,
                        catalog = app.container.catalog,
                    )
                }
            }
        }
    }
}
