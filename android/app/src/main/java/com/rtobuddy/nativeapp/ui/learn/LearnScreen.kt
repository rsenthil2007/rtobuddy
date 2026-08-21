package com.rtobuddy.nativeapp.ui.learn

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
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
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
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
import kotlin.math.min

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
                            MarkingThumb(id = item.id, name = item.name, category = item.category)
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
    val mode = when {
        name.contains("flashing", ignoreCase = true) && name.contains("red", ignoreCase = true) -> "flash_red"
        name.contains("flashing", ignoreCase = true) -> "flash_amber"
        name.contains("green", ignoreCase = true) -> "green"
        name.contains("amber", ignoreCase = true) || name.contains("yellow", ignoreCase = true) -> "amber"
        else -> "red"
    }
    val infinite = rememberInfiniteTransition(label = "signalFlash")
    val flashOn by infinite.animateFloat(
        initialValue = 1f,
        targetValue = 0.12f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 450, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse,
        ),
        label = "flashAlpha",
    )
    val litAlpha = when (mode) {
        "flash_red", "flash_amber" -> flashOn
        else -> 1f
    }

    Canvas(modifier = Modifier.size(width = 44.dp, height = 96.dp)) {
        drawRoundRect(
            color = Color(0xFF1F2937),
            size = Size(width = size.width, height = size.height),
            cornerRadius = CornerRadius(8f, 8f),
        )
        val cx = size.width / 2
        val r = size.width * 0.22f
        val centers = listOf(size.height * 0.22f, size.height * 0.5f, size.height * 0.78f)
        val dim = Color(0xFF4B5563)
        val red = Color(0xFFEF4444).copy(alpha = if (mode == "red" || mode == "flash_red") litAlpha else 1f)
        val amber = Color(0xFFF59E0B).copy(alpha = if (mode == "amber" || mode == "flash_amber") litAlpha else 1f)
        val green = Color(0xFF22C55E)
        val colors = listOf(
            when (mode) {
                "red", "flash_red" -> red
                else -> dim
            },
            when (mode) {
                "amber", "flash_amber" -> amber
                else -> dim
            },
            when (mode) {
                "green" -> green
                else -> dim
            },
        )
        centers.forEachIndexed { i, cy ->
            drawCircle(color = colors[i], radius = r, center = Offset(cx, cy))
        }
    }
}

@Composable
private fun MarkingThumb(id: String, name: String, category: String) {
    val key = remember(id, name, category) {
        id.uppercase().ifBlank { name }.lowercase()
    }
    Canvas(
        modifier = Modifier
            .fillMaxWidth()
            .height(72.dp)
            .padding(bottom = 4.dp),
    ) {
        val asphalt = Color(0xFF374151)
        drawRect(color = asphalt)
        val white = Color(0xFFF8FAFC)
        val amber = Color(0xFFFBBF24)
        val yellow = Color(0xFFEAB308)
        val midY = size.height / 2f
        val left = 16f
        val right = size.width - 16f
        val w = right - left

        fun dashedLine(color: Color, y: Float, stroke: Float, dash: Float = 28f, gap: Float = 18f) {
            var x = left
            while (x < right) {
                val end = min(x + dash, right)
                drawLine(color, Offset(x, y), Offset(end, y), strokeWidth = stroke, cap = StrokeCap.Butt)
                x += dash + gap
            }
        }

        fun arrow(cx: Float, cy: Float, color: Color, rotateDeg: Float = 0f, alsoLeft: Boolean = false, alsoRight: Boolean = false) {
            val path = Path()
            // shaft + head pointing up (straight)
            path.moveTo(cx - 8f, cy + 22f)
            path.lineTo(cx + 8f, cy + 22f)
            path.lineTo(cx + 8f, cy - 2f)
            path.lineTo(cx + 18f, cy - 2f)
            path.lineTo(cx, cy - 26f)
            path.lineTo(cx - 18f, cy - 2f)
            path.lineTo(cx - 8f, cy - 2f)
            path.close()
            drawPath(path, color)
            if (alsoLeft) {
                val p = Path()
                p.moveTo(cx - 6f, cy + 6f)
                p.lineTo(cx - 6f, cy - 6f)
                p.lineTo(cx - 28f, cy)
                p.close()
                drawPath(p, color)
            }
            if (alsoRight) {
                val p = Path()
                p.moveTo(cx + 6f, cy + 6f)
                p.lineTo(cx + 6f, cy - 6f)
                p.lineTo(cx + 28f, cy)
                p.close()
                drawPath(p, color)
            }
            @Suppress("UNUSED_VARIABLE")
            val unused = rotateDeg
        }

        when {
            key.contains("rm-010") || name.contains("Zebra", ignoreCase = true) -> {
                var x = left
                while (x < right) {
                    drawRect(white, Offset(x, size.height * 0.18f), Size(16f, size.height * 0.64f))
                    x += 28f
                }
            }
            key.contains("rm-011") || name.contains("Approach", ignoreCase = true) -> {
                dashedLine(white, midY - 10f, 5f, 18f, 12f)
                dashedLine(white, midY + 10f, 5f, 18f, 12f)
                var x = left + 40f
                while (x < right - 40f) {
                    drawRect(white, Offset(x, size.height * 0.35f), Size(10f, size.height * 0.3f))
                    x += 22f
                }
            }
            key.contains("rm-004") || name.contains("Double Solid", ignoreCase = true) -> {
                drawLine(amber, Offset(left, midY - 7f), Offset(right, midY - 7f), 5f)
                drawLine(amber, Offset(left, midY + 7f), Offset(right, midY + 7f), 5f)
            }
            key.contains("rm-002") || name.contains("Broken Centre", ignoreCase = true) -> {
                dashedLine(amber, midY, 6f)
            }
            key.contains("rm-003") || (name.contains("Solid Centre", ignoreCase = true) && !name.contains("Double")) -> {
                drawLine(amber, Offset(left, midY), Offset(right, midY), 6f)
            }
            key.contains("rm-001") || name.equals("Centre Line", ignoreCase = true) -> {
                dashedLine(amber, midY, 6f, 40f, 16f)
            }
            key.contains("rm-006") || name.contains("Broken Lane", ignoreCase = true) -> {
                dashedLine(white, midY, 5f, 24f, 16f)
            }
            key.contains("rm-005") || name.equals("Lane Line", ignoreCase = true) -> {
                dashedLine(white, midY, 5f)
            }
            key.contains("rm-007") || name.equals("Edge Line", ignoreCase = true) -> {
                drawLine(white, Offset(left, size.height * 0.78f), Offset(right, size.height * 0.78f), 7f)
            }
            key.contains("rm-008") || name.contains("Stop Line", ignoreCase = true) -> {
                drawLine(white, Offset(size.width * 0.28f, size.height * 0.2f), Offset(size.width * 0.28f, size.height * 0.8f), 10f)
                dashedLine(amber, midY, 4f)
            }
            key.contains("rm-009") || name.contains("Give-Way", ignoreCase = true) || name.contains("Give Way", ignoreCase = true) -> {
                var x = size.width * 0.22f
                while (x < size.width * 0.38f) {
                    drawLine(white, Offset(x, size.height * 0.25f), Offset(x + 10f, size.height * 0.75f), 4f)
                    x += 14f
                }
            }
            key.contains("rm-012") || name.contains("Straight", ignoreCase = true) && !name.contains("Left") && !name.contains("Right") && !name.contains("or") -> {
                arrow(size.width / 2f, midY, white)
            }
            key.contains("rm-013") || (name.contains("Arrow", ignoreCase = true) && name.contains("Left", ignoreCase = true) && !name.contains("or")) -> {
                val p = Path()
                p.moveTo(size.width * 0.62f, midY - 8f)
                p.lineTo(size.width * 0.62f, midY + 8f)
                p.lineTo(size.width * 0.28f, midY)
                p.close()
                drawPath(p, white)
                drawLine(white, Offset(size.width * 0.62f, midY), Offset(size.width * 0.78f, midY), 10f)
            }
            key.contains("rm-014") || (name.contains("Arrow", ignoreCase = true) && name.contains("Right", ignoreCase = true) && !name.contains("or")) -> {
                val p = Path()
                p.moveTo(size.width * 0.38f, midY - 8f)
                p.lineTo(size.width * 0.38f, midY + 8f)
                p.lineTo(size.width * 0.72f, midY)
                p.close()
                drawPath(p, white)
                drawLine(white, Offset(size.width * 0.22f, midY), Offset(size.width * 0.38f, midY), 10f)
            }
            key.contains("rm-015") || name.contains("Straight-or-Left", ignoreCase = true) -> {
                arrow(size.width * 0.45f, midY, white, alsoLeft = true)
            }
            key.contains("rm-016") || name.contains("Straight-or-Right", ignoreCase = true) -> {
                arrow(size.width * 0.55f, midY, white, alsoRight = true)
            }
            key.contains("rm-017") || name.contains("Yellow Edge", ignoreCase = true) -> {
                drawLine(yellow, Offset(left, size.height * 0.78f), Offset(right, size.height * 0.78f), 8f)
            }
            key.contains("rm-018") || name.contains("No-Parking", ignoreCase = true) -> {
                drawLine(yellow, Offset(left, size.height * 0.72f), Offset(right, size.height * 0.72f), 6f)
                drawLine(yellow, Offset(left, size.height * 0.82f), Offset(right, size.height * 0.82f), 6f)
            }
            key.contains("rm-019") || name.contains("No-Stopping", ignoreCase = true) -> {
                drawLine(yellow, Offset(left, size.height * 0.7f), Offset(right, size.height * 0.7f), 5f)
                drawLine(Color(0xFFEF4444), Offset(left, size.height * 0.8f), Offset(right, size.height * 0.8f), 5f)
            }
            key.contains("rm-020") || name.contains("Box Junction", ignoreCase = true) -> {
                drawRect(yellow, Offset(w * 0.25f + left, size.height * 0.2f), Size(w * 0.5f, size.height * 0.6f), style = Stroke(width = 3f))
                // criss-cross
                drawLine(yellow, Offset(w * 0.25f + left, size.height * 0.2f), Offset(w * 0.75f + left, size.height * 0.8f), 3f)
                drawLine(yellow, Offset(w * 0.75f + left, size.height * 0.2f), Offset(w * 0.25f + left, size.height * 0.8f), 3f)
            }
            key.contains("rm-021") || name.contains("Hatched", ignoreCase = true) -> {
                var x = left
                while (x < right) {
                    drawLine(yellow, Offset(x, size.height * 0.2f), Offset(x + 24f, size.height * 0.8f), 3f)
                    x += 16f
                }
            }
            key.contains("rm-022") || name.contains("Chevron", ignoreCase = true) || name.contains("Diagonal", ignoreCase = true) -> {
                var x = left
                while (x < right) {
                    drawLine(white, Offset(x, size.height * 0.75f), Offset(x + 20f, size.height * 0.25f), 4f)
                    x += 22f
                }
            }
            key.contains("rm-023") || name.contains("Bus Stop", ignoreCase = true) -> {
                drawRoundRect(yellow, Offset(left, size.height * 0.25f), Size(w, size.height * 0.5f), CornerRadius(6f, 6f), style = Stroke(4f))
                drawLine(yellow, Offset(left + 12f, midY), Offset(right - 12f, midY), 4f)
            }
            key.contains("rm-024") || name.contains("Cycle", ignoreCase = true) -> {
                dashedLine(white, midY, 4f, 16f, 10f)
                drawCircle(white, 10f, Offset(size.width * 0.35f, midY), style = Stroke(3f))
                drawCircle(white, 10f, Offset(size.width * 0.55f, midY), style = Stroke(3f))
            }
            key.contains("rm-025") || name.contains("Parking Bay", ignoreCase = true) -> {
                drawRect(white, Offset(left + w * 0.15f, size.height * 0.15f), Size(w * 0.7f, size.height * 0.7f), style = Stroke(4f))
                drawLine(white, Offset(left + w * 0.5f, size.height * 0.15f), Offset(left + w * 0.5f, size.height * 0.85f), 3f)
            }
            category.contains("pedestrian", ignoreCase = true) -> {
                var x = left
                while (x < right) {
                    drawRect(white, Offset(x, size.height * 0.2f), Size(14f, size.height * 0.6f))
                    x += 26f
                }
            }
            else -> {
                drawLine(white, Offset(left, midY), Offset(right, midY), 5f)
            }
        }
    }
}
