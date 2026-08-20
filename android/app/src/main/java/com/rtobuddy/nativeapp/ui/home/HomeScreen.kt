package com.rtobuddy.nativeapp.ui.home

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.rtobuddy.nativeapp.data.RtoBuddyRepository
import com.rtobuddy.nativeapp.domain.model.CatalogStats
import com.rtobuddy.nativeapp.domain.model.DailyRule
import com.rtobuddy.nativeapp.domain.model.JurisdictionInfo
import com.rtobuddy.nativeapp.domain.model.LocalReminder
import com.rtobuddy.nativeapp.domain.model.MissionProgress
import com.rtobuddy.nativeapp.domain.model.ReadinessSnapshot
import com.rtobuddy.nativeapp.ui.components.SectionCard
import com.rtobuddy.nativeapp.ui.theme.AppThemeId
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

data class HomeLaunch(
    val category: String = "all",
    val count: Int = 10,
    val mode: String = "practice",
    val questionIds: List<String>? = null,
)

@Composable
fun HomeScreen(
    repository: RtoBuddyRepository,
    padding: PaddingValues,
    refreshToken: Int,
    onLaunchExam: (HomeLaunch) -> Unit,
    onOpenLibrary: (String) -> Unit,
    onOpenProgress: () -> Unit,
    onOpenState: () -> Unit,
    onOpenQuest: () -> Unit = {},
) {
    val scope = rememberCoroutineScope()
    var readiness by remember { mutableStateOf(ReadinessSnapshot()) }
    var mission by remember { mutableStateOf(MissionProgress()) }
    var stats by remember { mutableStateOf(CatalogStats()) }
    var dailyRule by remember { mutableStateOf(DailyRule("", "", "")) }
    var reminder by remember { mutableStateOf<LocalReminder?>(null) }
    var jurisdictions by remember { mutableStateOf<List<JurisdictionInfo>>(emptyList()) }
    var selectedCode by remember { mutableStateOf("TN") }
    var selectedTheme by remember { mutableStateOf(AppThemeId.BALANCED) }
    var menuOpen by remember { mutableStateOf(false) }
    var recentScores by remember { mutableStateOf<List<Int>>(emptyList()) }

    suspend fun load() {
        readiness = repository.getReadinessSnapshot()
        mission = repository.getMissionProgress()
        stats = repository.getCatalogStats()
        dailyRule = repository.getDailyRule()
        reminder = repository.getLocalReminder()
        jurisdictions = repository.getJurisdictions()
        selectedCode = repository.jurisdictionCode.first()
        selectedTheme = AppThemeId.fromStored(repository.themeId.first())
        recentScores = repository.getRecentScores()
    }

    LaunchedEffect(refreshToken) { load() }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(padding),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        item {
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = MaterialTheme.colorScheme.surface,
                tonalElevation = 2.dp,
                modifier = Modifier.fillMaxWidth(),
            ) {
                Column(
                    modifier = Modifier.padding(18.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    Text(
                        "MISSION CONTROL",
                        style = MaterialTheme.typography.labelLarge,
                        color = MaterialTheme.colorScheme.primary,
                        fontWeight = FontWeight.Bold,
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text("Train. React. Pass.", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                            Text(
                                "Daily drills for signs, rules, and real-road judgement.",
                                style = MaterialTheme.typography.bodyMedium,
                            )
                            Text(
                                "${stats.signs} signs · ${stats.signals} signals · ${stats.markings} markings · ${stats.rules} rules · ${stats.questions} questions · ${stats.jurisdictions} States/UTs",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.75f),
                            )
                            Text(
                                "🔥 ${readiness.streakDays}-day streak",
                                style = MaterialTheme.typography.labelLarge,
                                fontWeight = FontWeight.SemiBold,
                            )
                        }
                        ReadinessRing(percent = readiness.bestScore, status = readiness.status)
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                        Button(
                            onClick = {
                                scope.launch {
                                    val weak = repository.getWeakCategory()
                                    onLaunchExam(HomeLaunch(category = weak ?: "all", count = 10))
                                }
                            },
                            modifier = Modifier.weight(1f),
                        ) { Text("Continue training") }
                        OutlinedButton(
                            onClick = { onLaunchExam(HomeLaunch(count = 5)) },
                            modifier = Modifier.weight(1f),
                        ) { Text("Quick 5") }
                    }
                    Button(
                        onClick = onOpenQuest,
                        modifier = Modifier.fillMaxWidth(),
                    ) { Text("Enter Road Quest · Roadsville") }
                    Text("Theme", style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.SemiBold)
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                        AppThemeId.entries.forEach { theme ->
                            OutlinedButton(
                                onClick = {
                                    selectedTheme = theme
                                    scope.launch { repository.setThemeId(theme.name) }
                                },
                                modifier = Modifier.weight(1f),
                            ) {
                                Text(if (selectedTheme == theme) "✓ ${theme.label}" else theme.label)
                            }
                        }
                    }
                }
            }
        }

        item {
            SectionCard(title = "Today's route") {
                Text("Mission ${mission.completedCount}/3")
                LinearProgressIndicator(
                    progress = { mission.completedCount / 3f },
                    modifier = Modifier.fillMaxWidth(),
                )
                Text("1. Open 5 signs (${mission.signsViewed}/5)")
                Text("2. Finish a 10-question drill ${if (mission.exam10Completed) "✓" else ""}")
                Text("3. Review one State/UT note ${if (mission.stateRuleReviewed) "✓" else ""}")
            }
        }

        item {
            SectionCard(title = "Quick launch") {
                val tiles = listOf(
                    Triple("Signs Drill", "${stats.signs} offline") { onLaunchExam(HomeLaunch("traffic_sign", 8)) },
                    Triple("Signals Sprint", "${stats.signals} signals") { onLaunchExam(HomeLaunch("traffic_signal", 5)) },
                    Triple("Rules check", "${stats.rules} rules") { onLaunchExam(HomeLaunch("road_rule", 8)) },
                    Triple("State notes", "${stats.jurisdictions} regions") { onOpenState() },
                )
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    for (row in tiles.chunked(2)) {
                        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                            row.forEach { (title, meta, action) ->
                                Surface(
                                    shape = RoundedCornerShape(14.dp),
                                    color = MaterialTheme.colorScheme.primary.copy(alpha = 0.12f),
                                    modifier = Modifier
                                        .weight(1f)
                                        .clickable(onClick = action),
                                ) {
                                    Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                        Text(title, fontWeight = FontWeight.SemiBold)
                                        Text(meta, style = MaterialTheme.typography.bodySmall)
                                    }
                                }
                            }
                            if (row.size == 1) Spacer(modifier = Modifier.weight(1f))
                        }
                    }
                }
            }
        }

        item {
            SectionCard(title = "Can You Spot It?") {
                Text("Scenario drills using visual road situations from the offline bank.")
                Button(
                    onClick = {
                        scope.launch {
                            val ids = repository.getSpotItQuestionIds()
                            onLaunchExam(HomeLaunch(count = ids.size.coerceAtLeast(1), mode = "spot", questionIds = ids))
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                ) { Text("Start Spot It") }
            }
        }

        item {
            val selectedName = jurisdictions.firstOrNull { it.code == selectedCode }?.name ?: selectedCode
            SectionCard(title = "Today in $selectedName") {
                Box {
                    OutlinedButton(onClick = { menuOpen = true }, modifier = Modifier.fillMaxWidth()) {
                        Text(selectedName)
                    }
                    DropdownMenu(expanded = menuOpen, onDismissRequest = { menuOpen = false }) {
                        jurisdictions.forEach { item ->
                            DropdownMenuItem(
                                text = { Text("${item.code} — ${item.name}") },
                                onClick = {
                                    menuOpen = false
                                    scope.launch {
                                        repository.setJurisdiction(item.code)
                                        selectedCode = item.code
                                        reminder = repository.getLocalReminder()
                                    }
                                },
                            )
                        }
                    }
                }
                reminder?.let {
                    Text("Local rule to remember:", fontWeight = FontWeight.SemiBold)
                    Text(it.title)
                    Text(it.summary)
                    OutlinedButton(onClick = {
                        scope.launch {
                            repository.trackStateRuleView()
                            onOpenState()
                        }
                    }) { Text("Open State / UT library") }
                } ?: Text("No local overlay note for this region yet — national baseline still applies.")
            }
        }

        item {
            SectionCard(title = "Daily Rule", body = "${dailyRule.title}\n\n${dailyRule.summary}")
        }

        item {
            SectionCard(title = "Recent form") {
                if (recentScores.isEmpty()) {
                    Text("No attempts yet. Run a Quick 5 to start your score trail.")
                } else {
                    ScoreSparkline(scores = recentScores)
                    Text(recentScores.joinToString(" → ") { "$it%" }, style = MaterialTheme.typography.bodySmall)
                }
                OutlinedButton(onClick = onOpenProgress, modifier = Modifier.fillMaxWidth()) {
                    Text("Open Progress")
                }
            }
        }

        item {
            SectionCard(title = "Library shortcuts") {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                    OutlinedButton(onClick = { onOpenLibrary("signs") }, modifier = Modifier.weight(1f)) { Text("Signs") }
                    OutlinedButton(onClick = { onOpenLibrary("signals") }, modifier = Modifier.weight(1f)) { Text("Signals") }
                }
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                    OutlinedButton(onClick = { onOpenLibrary("markings") }, modifier = Modifier.weight(1f)) { Text("Markings") }
                    OutlinedButton(onClick = { onOpenLibrary("rules") }, modifier = Modifier.weight(1f)) { Text("Rules") }
                }
            }
        }
    }
}

@Composable
private fun ReadinessRing(percent: Int, status: String) {
    val track = MaterialTheme.colorScheme.outline.copy(alpha = 0.35f)
    val progress = MaterialTheme.colorScheme.primary
    Box(contentAlignment = Alignment.Center, modifier = Modifier.size(96.dp)) {
        Canvas(modifier = Modifier.size(96.dp)) {
            val stroke = Stroke(width = 10.dp.toPx(), cap = StrokeCap.Round)
            drawCircle(color = track, style = stroke)
            drawArc(
                color = progress,
                startAngle = -90f,
                sweepAngle = (percent.coerceIn(0, 100) / 100f) * 360f,
                useCenter = false,
                style = stroke,
            )
        }
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text("$percent%", fontWeight = FontWeight.Bold)
            Text(status, style = MaterialTheme.typography.labelSmall)
        }
    }
}

@Composable
private fun ScoreSparkline(scores: List<Int>) {
    val line = MaterialTheme.colorScheme.primary
    val fill = MaterialTheme.colorScheme.primary.copy(alpha = 0.18f)
    Canvas(
        modifier = Modifier
            .fillMaxWidth()
            .height(56.dp)
            .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.35f), RoundedCornerShape(12.dp))
            .padding(8.dp),
    ) {
        if (scores.isEmpty()) return@Canvas
        val max = 100f
        val stepX = if (scores.size == 1) size.width else size.width / (scores.size - 1)
        val points = scores.mapIndexed { index, value ->
            Offset(index * stepX, size.height - (value / max) * size.height)
        }
        for (i in 0 until points.lastIndex) {
            drawLine(color = line, start = points[i], end = points[i + 1], strokeWidth = 4f, cap = StrokeCap.Round)
        }
        points.forEach { point ->
            drawCircle(color = fill, radius = 8f, center = point)
            drawCircle(color = line, radius = 4f, center = point)
        }
    }
}
