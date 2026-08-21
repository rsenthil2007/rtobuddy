package com.rtobuddy.nativeapp.ui.tools

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.rtobuddy.nativeapp.ads.AdsManager
import com.rtobuddy.nativeapp.data.RtoBuddyRepository
import com.rtobuddy.nativeapp.domain.model.CatalogStats
import com.rtobuddy.nativeapp.domain.model.OfficialService
import com.rtobuddy.nativeapp.ui.components.SectionCard
import com.rtobuddy.nativeapp.ui.theme.AppThemeId
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

@Composable
fun ToolsScreen(
    repository: RtoBuddyRepository,
    adsManager: AdsManager,
    padding: PaddingValues,
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    var services by remember { mutableStateOf<List<OfficialService>>(emptyList()) }
    var stats by remember { mutableStateOf(CatalogStats()) }
    var selectedTheme by remember { mutableStateOf(AppThemeId.BALANCED) }
    val adsCfg by adsManager.config.collectAsStateWithLifecycle()

    LaunchedEffect(Unit) {
        services = repository.getServices()
        stats = repository.getCatalogStats()
        selectedTheme = AppThemeId.fromStored(repository.themeId.first())
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(padding),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            Text("Tools", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
        }

        item {
            SectionCard(title = "Theme") {
                Text("Pick Classic, Balanced, or Hardcore — changes apply instantly.")
                AppThemeId.entries.forEach { theme ->
                    OutlinedButton(
                        onClick = {
                            selectedTheme = theme
                            scope.launch { repository.setThemeId(theme.name) }
                        },
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Text(if (selectedTheme == theme) "✓ ${theme.label}" else theme.label)
                    }
                }
            }
        }

        item {
            SectionCard(title = "Ads (remote)") {
                Text(
                    "Status: ${if (adsCfg.adsEnabled) "Enabled" else "Disabled"} · " +
                        "banner=${adsCfg.bannerEnabled} · cooldown=${adsCfg.interstitialCooldownSec}s",
                )
                Text(
                    adsCfg.message ?: "Controlled by remote JSON. Default is Disabled until the server says Enabled.",
                    style = MaterialTheme.typography.bodySmall,
                )
                OutlinedButton(
                    onClick = { adsManager.refreshConfig() },
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    Text("Refresh remote ads config")
                }
            }
        }

        item {
            SectionCard(
                title = "Offline pack",
                body = "${stats.signs} signs · ${stats.signals} signals · ${stats.markings} markings · ${stats.rules} rules · ${stats.questions} exam questions · ${stats.jurisdictions} State/UT overlays",
            )
        }

        item {
            SectionCard(
                title = "About & sources",
                body = "RTOBuddy packages national baseline learning content plus State/UT overlays for offline study. Legal-sensitive summaries always point back to official sources. This app is educational and not a substitute for the current Act, Rules, or State/UT orders.",
            )
        }

        items(services, key = { it.id }) { service ->
            SectionCard(title = service.name, body = service.purpose) {
                if (service.url.isNotBlank()) {
                    OutlinedButton(onClick = {
                        context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(service.url)))
                    }) { Text("Open official site") }
                }
            }
        }
    }
}
