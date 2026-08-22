package com.rtobuddy.nativeapp.ui.tools

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.rtobuddy.nativeapp.data.RtoBuddyRepository
import com.rtobuddy.nativeapp.domain.model.RulesCheckEntry
import com.rtobuddy.nativeapp.ui.components.SectionCard
import kotlinx.coroutines.delay

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun RulesCheckSection(repository: RtoBuddyRepository) {
    var query by remember { mutableStateOf("") }
    var vehicleFilter by remember { mutableStateOf<String?>(null) }
    var results by remember { mutableStateOf<List<RulesCheckEntry>>(emptyList()) }

    LaunchedEffect(query, vehicleFilter) {
        delay(200)
        results = if (query.trim().length >= 2) {
            repository.searchRulesCheck(query, vehicleFilter)
        } else {
            emptyList()
        }
    }

    SectionCard(
        title = "Rules Check",
        body = "Search by topic, section (e.g. 194D), or problem — 2W & 4W passenger only. Educational summary; verify with official sources.",
    ) {
        OutlinedTextField(
            value = query,
            onValueChange = { query = it },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            label = { Text("Helmet, parking, 194B, insurance…") },
        )
        FlowRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp),
        ) {
            FilterChip(
                selected = vehicleFilter == null,
                onClick = { vehicleFilter = null },
                label = { Text("All") },
            )
            FilterChip(
                selected = vehicleFilter == "2W",
                onClick = { vehicleFilter = "2W" },
                label = { Text("2W") },
            )
            FilterChip(
                selected = vehicleFilter == "4W",
                onClick = { vehicleFilter = "4W" },
                label = { Text("4W") },
            )
        }
        if (query.trim().length < 2) {
            Text(
                "Type at least 2 characters to search ${20} common rules.",
                style = MaterialTheme.typography.bodySmall,
            )
        } else if (results.isEmpty()) {
            Text(
                "No match yet. Try section number, keyword, or a shorter phrase.",
                style = MaterialTheme.typography.bodySmall,
            )
        } else {
            results.forEach { entry ->
                RulesCheckResultCard(entry)
            }
        }
    }
}

@Composable
private fun RulesCheckResultCard(entry: RulesCheckEntry) {
    SectionCard(title = entry.title) {
        Text(
            entry.vehicle_types.joinToString(" · ") { if (it == "2W") "Two-wheeler" else "Car (LMV)" },
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.primary,
        )
        RuleBlock("Rule (simple)", entry.simple_rule)
        RuleBlock("Section / reference", entry.legal_reference)
        BulletBlock("Do", entry.should_do)
        BulletBlock("Don't", entry.should_not_do)
        RuleBlock("Penalty / fine", entry.penalty)
        Text(
            "Educational summary only — not legal advice. Fines follow current Central/State notifications.",
            style = MaterialTheme.typography.bodySmall,
            modifier = Modifier.padding(top = 4.dp),
        )
    }
}

@Composable
private fun RuleBlock(label: String, text: String) {
    Column(modifier = Modifier.padding(top = 8.dp)) {
        Text(label, fontWeight = FontWeight.SemiBold, style = MaterialTheme.typography.labelLarge)
        Text(text, style = MaterialTheme.typography.bodyMedium)
    }
}

@Composable
private fun BulletBlock(label: String, items: List<String>) {
    if (items.isEmpty()) return
    Column(modifier = Modifier.padding(top = 8.dp)) {
        Text(label, fontWeight = FontWeight.SemiBold, style = MaterialTheme.typography.labelLarge)
        items.forEach { item ->
            Text("• $item", style = MaterialTheme.typography.bodyMedium)
        }
    }
}
