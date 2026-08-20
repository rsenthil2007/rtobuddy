package com.rtobuddy.nativeapp.ui.learn

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ScrollableTabRow
import androidx.compose.material3.Tab
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
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
                    onClick = { tabIndex = index },
                    text = { Text(tab.label) },
                )
            }
        }

        when (LearnTab.entries[tabIndex]) {
            LearnTab.Signs -> {
                LazyColumn(
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    items(signs, key = { it.id }) { item ->
                        LaunchedEffect(item.id) { repository.trackSignView(item.id) }
                        SectionCard(title = item.name, body = "${item.category} · ${item.id}") {
                            SignThumb(asset = item.image_asset, name = item.name)
                            Text(item.meaning)
                        }
                    }
                }
            }

            LearnTab.Signals -> {
                LazyColumn(
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    items(signals, key = { it.id }) { item ->
                        SectionCard(title = item.name) {
                            Row(
                                horizontalArrangement = Arrangement.spacedBy(12.dp),
                                verticalAlignment = Alignment.CenterVertically,
                            ) {
                                SignalThumb(name = item.name)
                                Text(item.meaning, modifier = Modifier.weight(1f))
                            }
                        }
                    }
                }
            }

            LearnTab.Markings -> {
                LazyColumn(
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    items(markings, key = { it.id }) { item ->
                        SectionCard(title = item.name, body = "${item.category} · ${item.id}") {
                            MarkingThumb(category = item.category)
                            Text(item.meaning)
                        }
                    }
                }
            }

            LearnTab.Rules -> {
                LazyColumn(
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    items(rules, key = { it.id }) { item ->
                        SectionCard(title = item.title, body = item.summary)
                    }
                }
            }

            LearnTab.State -> {
                LazyColumn(
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    if (stateRules.isEmpty()) {
                        item { Text("No State/UT overlay rules for the current selection.") }
                    }
                    items(stateRules, key = { it.id }) { rule ->
                        SectionCard(title = rule.title, body = rule.summary) {
                            Text(
                                "Tap card content counts as reviewed when opened in list.",
                                style = MaterialTheme.typography.bodySmall,
                            )
                        }
                    }
                    item {
                        LaunchedEffect(stateRules) {
                            if (stateRules.isNotEmpty()) repository.trackStateRuleView()
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun SignThumb(asset: String?, name: String) {
    val context = LocalContext.current
    if (asset.isNullOrBlank()) return
    AsyncImage(
        model = ImageRequest.Builder(context)
            .data("file:///android_asset/signs/$asset")
            .decoderFactory(SvgDecoder.Factory())
            .build(),
        contentDescription = name,
        modifier = Modifier
            .fillMaxWidth()
            .height(120.dp)
            .padding(bottom = 4.dp),
        contentScale = ContentScale.Fit,
    )
}

@Composable
private fun SignalThumb(name: String) {
    val active = when {
        name.contains("flashing", ignoreCase = true) && name.contains("red", ignoreCase = true) -> "flash_red"
        name.contains("flashing", ignoreCase = true) -> "flash_amber"
        name.contains("green", ignoreCase = true) -> "green"
        name.contains("amber", ignoreCase = true) || name.contains("yellow", ignoreCase = true) -> "amber"
        else -> "red"
    }
    Canvas(modifier = Modifier.size(width = 44.dp, height = 96.dp)) {
        val housing = Size(width = size.width, height = size.height)
        drawRoundRect(color = Color(0xFF1F2937), size = housing, cornerRadius = androidx.compose.ui.geometry.CornerRadius(8f, 8f))
        val cx = size.width / 2
        val r = size.width * 0.22f
        val centers = listOf(size.height * 0.22f, size.height * 0.5f, size.height * 0.78f)
        val colors = listOf(Color(0xFF4B5563), Color(0xFF4B5563), Color(0xFF4B5563)).toMutableList()
        when (active) {
            "red", "flash_red" -> colors[0] = Color(0xFFEF4444)
            "amber", "flash_amber" -> colors[1] = Color(0xFFF59E0B)
            "green" -> colors[2] = Color(0xFF22C55E)
        }
        centers.forEachIndexed { i, cy ->
            drawCircle(color = colors[i], radius = r, center = Offset(cx, cy))
        }
    }
}

@Composable
private fun MarkingThumb(category: String) {
    Canvas(
        modifier = Modifier
            .fillMaxWidth()
            .height(56.dp)
            .padding(bottom = 4.dp),
    ) {
        drawRect(color = Color(0xFF374151))
        when {
            category.contains("zebra", ignoreCase = true) || category.contains("crossing", ignoreCase = true) -> {
                var x = 24f
                while (x < size.width - 24f) {
                    drawRect(color = Color.White, topLeft = Offset(x, size.height * 0.25f), size = Size(14f, size.height * 0.5f))
                    x += 28f
                }
            }
            category.contains("centre", ignoreCase = true) || category.contains("center", ignoreCase = true) -> {
                drawLine(
                    color = Color(0xFFFBBF24),
                    start = Offset(16f, size.height / 2),
                    end = Offset(size.width - 16f, size.height / 2),
                    strokeWidth = 6f,
                )
            }
            else -> {
                drawLine(
                    color = Color.White,
                    start = Offset(16f, size.height / 2),
                    end = Offset(size.width - 16f, size.height / 2),
                    strokeWidth = 5f,
                )
            }
        }
    }
}
