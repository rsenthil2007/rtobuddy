package com.rtobuddy.nativeapp.ui.tools

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
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
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.rtobuddy.nativeapp.ads.AdsManager
import com.rtobuddy.nativeapp.data.RtoBuddyRepository
import com.rtobuddy.nativeapp.domain.model.CatalogStats
import com.rtobuddy.nativeapp.domain.model.EmergencyNumber
import com.rtobuddy.nativeapp.domain.model.OfficialService
import com.rtobuddy.nativeapp.ui.components.SectionCard
import com.rtobuddy.nativeapp.ui.theme.AppThemeId
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
    var emergencyNumbers by remember { mutableStateOf<List<EmergencyNumber>>(emptyList()) }
    var stats by remember { mutableStateOf(CatalogStats()) }
    var selectedTheme by remember { mutableStateOf(AppThemeId.BALANCED) }
    val adsCfg by adsManager.config.collectAsStateWithLifecycle()

    LaunchedEffect(Unit) {
        services = repository.getServices()
        emergencyNumbers = repository.getEmergencyNumbers()
        stats = repository.getCatalogStats()
        selectedTheme = AppThemeId.fromStored(repository.themeId.first())
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(padding)
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
        contentPadding = PaddingValues(vertical = 16.dp),
    ) {
        item {
            Text("Tools", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
            Text(
                "Emergency numbers, official links, and app settings.",
                style = MaterialTheme.typography.bodyMedium,
            )
        }

        item {
            SectionCard(
                title = "Emergency numbers (India)",
                body = "Prefer 112 when unsure. Tap to open the dialer — confirm before calling.",
            ) {
                emergencyNumbers.forEach { entry ->
                    Column(modifier = Modifier.fillMaxWidth()) {
                        OutlinedButton(
                            onClick = {
                                val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:${entry.number}"))
                                context.startActivity(intent)
                            },
                            modifier = Modifier.fillMaxWidth(),
                        ) {
                            Text("${entry.number} · ${entry.name}")
                        }
                        Text(
                            entry.when_to_call,
                            style = MaterialTheme.typography.bodySmall,
                            modifier = Modifier.padding(start = 4.dp, bottom = 8.dp),
                        )
                    }
                }
            }
        }

        item {
            SectionCard(
                title = "After a road crash",
                body = "1. Switch on hazard lights if safe.\n" +
                    "2. Call 112 or 108 if anyone is hurt.\n" +
                    "3. Do not crowd the scene — keep space for ambulances.\n" +
                    "4. Note location and vehicle details for police (100) if needed.",
            )
        }

        item {
            SectionCard(title = "Official services") {
                services.take(8).forEach { service ->
                    OutlinedButton(
                        onClick = {
                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(service.url))
                            context.startActivity(intent)
                        },
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Text(service.name)
                    }
                }
            }
        }

        item {
            SectionCard(title = "Dataset") {
                Text(
                    "Signs ${stats.signs} · Signals ${stats.signals} · Markings ${stats.markings} · " +
                        "Rules ${stats.rules} · Questions ${stats.questions}",
                )
            }
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
    }
}
