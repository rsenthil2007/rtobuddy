package com.rtobuddy.nativeapp.ui.learn

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.ScrollableTabRow
import androidx.compose.material3.Tab
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import coil.decode.SvgDecoder
import coil.request.ImageRequest
import com.rtobuddy.nativeapp.data.RtoBuddyRepository
import com.rtobuddy.nativeapp.domain.model.RoadMarking
import com.rtobuddy.nativeapp.domain.model.RoadRule
import com.rtobuddy.nativeapp.domain.model.StateUtRule
import com.rtobuddy.nativeapp.domain.model.TrafficSign
import com.rtobuddy.nativeapp.domain.model.TrafficSignal
import com.rtobuddy.nativeapp.ui.components.SectionCard
import kotlinx.coroutines.launch

private enum class LearnTab(val label: String) {
    Signs("Signs"),
    Signals("Signals"),
    Markings("Markings"),
    Rules("Rules"),
    State("State / UT"),
}

@Composable
fun LearnScreen(
    repository: RtoBuddyRepository,
    padding: PaddingValues,
    initialTab: String? = null,
) {
    val scope = rememberCoroutineScope()
    var tabIndex by remember {
        mutableIntStateOf(
            when (initialTab) {
                "signals" -> 1
                "markings" -> 2
                "rules" -> 3
                "state" -> 4
                else -> 0
            },
        )
    }
    var signs by remember { mutableStateOf<List<TrafficSign>>(emptyList()) }
    var signals by remember { mutableStateOf<List<TrafficSignal>>(emptyList()) }
    var markings by remember { mutableStateOf<List<RoadMarking>>(emptyList()) }
    var rules by remember { mutableStateOf<List<RoadRule>>(emptyList()) }
    var stateRules by remember { mutableStateOf<List<StateUtRule>>(emptyList()) }
    var selectedSign by remember { mutableStateOf<TrafficSign?>(null) }
    var selectedSignal by remember { mutableStateOf<TrafficSignal?>(null) }
    var selectedMarking by remember { mutableStateOf<RoadMarking?>(null) }
    var selectedRule by remember { mutableStateOf<RoadRule?>(null) }

    LaunchedEffect(Unit) {
        signs = repository.getSigns()
        signals = repository.getSignals()
        markings = repository.getMarkings()
        rules = repository.getRules()
        stateRules = repository.getStateRules()
    }

    LaunchedEffect(initialTab) {
        tabIndex = when (initialTab) {
            "signals" -> 1
            "markings" -> 2
            "rules" -> 3
            "state" -> 4
            "signs" -> 0
            else -> tabIndex
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(padding),
    ) {
        ScrollableTabRow(selectedTabIndex = tabIndex) {
            LearnTab.entries.forEachIndexed { index, tab ->
                Tab(
                    selected = tabIndex == index,
                    onClick = {
                        tabIndex = index
                        selectedSign = null
                        selectedSignal = null
                        selectedMarking = null
                        selectedRule = null
                    },
                    text = { Text(tab.label) },
                )
            }
        }

        when (LearnTab.entries[tabIndex]) {
            LearnTab.Signs -> {
                val sign = selectedSign
                if (sign != null) {
                    SignDetail(sign) { selectedSign = null }
                } else {
                    LazyColumn(
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        items(signs, key = { it.id }) { item ->
                            SectionCard(title = item.name, body = "${item.category} · ${item.id}") {
                                FilterChip(
                                    selected = false,
                                    onClick = {
                                        selectedSign = item
                                        scope.launch { repository.trackSignView(item.id) }
                                    },
                                    label = { Text("Open") },
                                )
                            }
                        }
                    }
                }
            }

            LearnTab.Signals -> {
                val signal = selectedSignal
                if (signal != null) {
                    DetailPane(
                        title = signal.name,
                        body = signal.meaning,
                        onBack = { selectedSignal = null },
                    )
                } else {
                    LazyColumn(
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        items(signals, key = { it.id }) { item ->
                            SectionCard(title = item.name, body = item.meaning) {
                                FilterChip(
                                    selected = false,
                                    onClick = { selectedSignal = item },
                                    label = { Text("Open") },
                                )
                            }
                        }
                    }
                }
            }

            LearnTab.Markings -> {
                val marking = selectedMarking
                if (marking != null) {
                    DetailPane(
                        title = marking.name,
                        body = marking.meaning,
                        onBack = { selectedMarking = null },
                    )
                } else {
                    LazyColumn(
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        items(markings, key = { it.id }) { item ->
                            SectionCard(title = item.name, body = item.meaning) {
                                FilterChip(
                                    selected = false,
                                    onClick = { selectedMarking = item },
                                    label = { Text("Open") },
                                )
                            }
                        }
                    }
                }
            }

            LearnTab.Rules -> {
                val rule = selectedRule
                if (rule != null) {
                    DetailPane(
                        title = rule.title,
                        body = rule.summary,
                        onBack = { selectedRule = null },
                    )
                } else {
                    LazyColumn(
                        contentPadding = PaddingValues(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                    ) {
                        items(rules, key = { it.id }) { item ->
                            val preview = if (item.summary.length > 140) {
                                item.summary.take(140) + "…"
                            } else {
                                item.summary
                            }
                            SectionCard(title = item.title, body = preview) {
                                FilterChip(
                                    selected = false,
                                    onClick = { selectedRule = item },
                                    label = { Text("Open") },
                                )
                            }
                        }
                    }
                }
            }

            LearnTab.State -> {
                LazyColumn(
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    if (stateRules.isEmpty()) {
                        item { Text("No State/UT overlay rules for the current selection.") }
                    }
                    items(stateRules, key = { it.id }) { rule ->
                        SectionCard(title = rule.title, body = rule.summary) {
                            FilterChip(
                                selected = false,
                                onClick = { scope.launch { repository.trackStateRuleView() } },
                                label = { Text("Mark reviewed") },
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun DetailPane(title: String, body: String, onBack: () -> Unit) {
    Column(
        modifier = Modifier.padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        Text(title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
        Text(body)
        OutlinedButton(onClick = onBack) { Text("Back") }
    }
}

@Composable
private fun SignDetail(sign: TrafficSign, onBack: () -> Unit) {
    val context = LocalContext.current
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text(sign.name, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
        Text(sign.category)
        val asset = sign.image_asset
        if (asset != null) {
            AsyncImage(
                model = ImageRequest.Builder(context)
                    .data("file:///android_asset/signs/$asset")
                    .decoderFactory(SvgDecoder.Factory())
                    .build(),
                contentDescription = sign.name,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(180.dp),
                contentScale = ContentScale.Fit,
            )
        }
        Text(sign.meaning)
        OutlinedButton(onClick = onBack) { Text("Back") }
    }
}
