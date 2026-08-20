package com.rtobuddy.nativeapp.ui.home

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenu
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Button
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.rtobuddy.nativeapp.data.RtoBuddyRepository
import com.rtobuddy.nativeapp.domain.model.DailyRule
import com.rtobuddy.nativeapp.domain.model.JurisdictionInfo
import com.rtobuddy.nativeapp.domain.model.LocalReminder
import com.rtobuddy.nativeapp.domain.model.MissionProgress
import com.rtobuddy.nativeapp.domain.model.ReadinessSnapshot
import com.rtobuddy.nativeapp.domain.model.SevenDayStep
import com.rtobuddy.nativeapp.ui.components.SectionCard
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

data class HomeLaunch(
    val category: String = "all",
    val count: Int = 10,
    val mode: String = "practice",
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    repository: RtoBuddyRepository,
    padding: PaddingValues,
    refreshToken: Int,
    onLaunchExam: (HomeLaunch) -> Unit,
    onOpenLearn: (String) -> Unit,
    onOpenState: () -> Unit,
) {
    val scope = rememberCoroutineScope()
    var readiness by remember { mutableStateOf(ReadinessSnapshot()) }
    var mission by remember { mutableStateOf(MissionProgress()) }
    var plan by remember { mutableStateOf<List<SevenDayStep>>(emptyList()) }
    var dailyRule by remember { mutableStateOf(DailyRule("", "", "")) }
    var reminder by remember { mutableStateOf<LocalReminder?>(null) }
    var jurisdictions by remember { mutableStateOf<List<JurisdictionInfo>>(emptyList()) }
    var selectedCode by remember { mutableStateOf("TN") }
    var menuOpen by remember { mutableStateOf(false) }

    suspend fun load() {
        readiness = repository.getReadinessSnapshot()
        mission = repository.getMissionProgress()
        plan = repository.getSevenDayPlan()
        dailyRule = repository.getDailyRule()
        reminder = repository.getLocalReminder()
        jurisdictions = repository.getJurisdictions()
        selectedCode = repository.jurisdictionCode.first()
    }

    LaunchedEffect(refreshToken) { load() }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(padding),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text("RTOBuddy", style = MaterialTheme.typography.headlineMedium, fontWeight = FontWeight.Bold)
                Text("Offline-first learner training", style = MaterialTheme.typography.bodyMedium)
            }
        }

        item {
            SectionCard(title = "Mission Control") {
                Text("Status: ${readiness.status}")
                Text("Best score: ${readiness.bestScore}%  ·  Streak: ${readiness.streakDays} day(s)  ·  Attempts: ${readiness.attempts}")
                Text("Daily mission: ${mission.completedCount}/3")
                LinearProgressIndicator(
                    progress = { mission.completedCount / 3f },
                    modifier = Modifier.fillMaxWidth(),
                )
                Text("• View 5 signs (${mission.signsViewed}/5)")
                Text("• Complete a 10-question test ${if (mission.exam10Completed) "✓" else ""}")
                Text("• Review a state/UT rule ${if (mission.stateRuleReviewed) "✓" else ""}")
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(onClick = {
                        scope.launch {
                            val weak = repository.getWeakCategory()
                            onLaunchExam(HomeLaunch(category = weak ?: "all", count = 10))
                        }
                    }) { Text("Continue training") }
                    OutlinedButton(onClick = { onLaunchExam(HomeLaunch(count = 5)) }) { Text("Quick 5") }
                }
            }
        }

        item {
            val selectedName = jurisdictions.firstOrNull { it.code == selectedCode }?.name ?: selectedCode
            SectionCard(title = "Your State / UT") {
                ExposedDropdownMenuBox(expanded = menuOpen, onExpandedChange = { menuOpen = it }) {
                    TextField(
                        value = selectedName,
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Jurisdiction") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = menuOpen) },
                        modifier = Modifier
                            .menuAnchor()
                            .fillMaxWidth(),
                    )
                    ExposedDropdownMenu(expanded = menuOpen, onDismissRequest = { menuOpen = false }) {
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
                            load()
                        }
                    }) { Text("Review state notes") }
                } ?: Text("No local overlay note found for this State/UT yet.")
            }
        }

        item {
            SectionCard(title = "Daily Rule", body = "${dailyRule.title}\n\n${dailyRule.summary}")
        }

        item {
            SectionCard(title = "Quick drills") {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                    FilterChip(selected = false, onClick = { onLaunchExam(HomeLaunch("traffic_sign", 8)) }, label = { Text("Signs") })
                    FilterChip(selected = false, onClick = { onLaunchExam(HomeLaunch("traffic_signal", 5)) }, label = { Text("Signals") })
                    FilterChip(selected = false, onClick = { onLaunchExam(HomeLaunch("road_marking", 5)) }, label = { Text("Markings") })
                }
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedButton(onClick = { onLaunchExam(HomeLaunch("all", 10, "simulator")) }) { Text("Simulator") }
                    OutlinedButton(onClick = {
                        scope.launch {
                            val ids = repository.getRecentMistakeIds()
                            if (ids.isNotEmpty()) {
                                onLaunchExam(HomeLaunch(count = ids.size.coerceAtMost(10), mode = "replay"))
                            }
                        }
                    }) { Text("Replay mistakes") }
                    OutlinedButton(onClick = { onOpenLearn("signs") }) { Text("Learn signs") }
                }
            }
        }

        item {
            SectionCard(title = "Pass in 7 Days") {
                plan.forEach { step ->
                    Text("Day ${step.day}: ${step.title}${if (step.completed) " ✓" else ""}", fontWeight = FontWeight.SemiBold)
                    Text(step.detail)
                    if (!step.completed) {
                        OutlinedButton(onClick = {
                            when (step.action) {
                                "signs" -> onLaunchExam(HomeLaunch("traffic_sign", 8))
                                "signals" -> onLaunchExam(HomeLaunch("traffic_signal", 5))
                                "markings" -> onLaunchExam(HomeLaunch("road_marking", 5))
                                "rules" -> onLaunchExam(HomeLaunch("road_rule", 8))
                                "state" -> onOpenState()
                                "exam10" -> onLaunchExam(HomeLaunch("all", 10))
                                "simulator" -> onLaunchExam(HomeLaunch("all", 15, "simulator"))
                                else -> onLaunchExam(HomeLaunch())
                            }
                        }) { Text("Start") }
                    }
                }
            }
        }
    }
}
