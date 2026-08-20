package com.rtobuddy.nativeapp.ui.tools

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
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
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.rtobuddy.nativeapp.data.RtoBuddyRepository
import com.rtobuddy.nativeapp.domain.model.OfficialService
import com.rtobuddy.nativeapp.ui.components.SectionCard

@Composable
fun ToolsScreen(
    repository: RtoBuddyRepository,
    padding: PaddingValues,
) {
    val context = LocalContext.current
    var services by remember { mutableStateOf<List<OfficialService>>(emptyList()) }

    LaunchedEffect(Unit) {
        services = repository.getServices()
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
