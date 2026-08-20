package com.rtobuddy.nativeapp.ui.progress

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.LinearProgressIndicator
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.rtobuddy.nativeapp.data.RtoBuddyRepository
import com.rtobuddy.nativeapp.domain.model.Achievement
import com.rtobuddy.nativeapp.domain.model.ConfidenceItem
import com.rtobuddy.nativeapp.domain.model.SevenDayStep
import com.rtobuddy.nativeapp.ui.components.SectionCard
import com.rtobuddy.nativeapp.ui.home.HomeLaunch

@Composable
fun ProgressScreen(
    repository: RtoBuddyRepository,
    padding: PaddingValues,
    refreshToken: Int,
    onLaunchExam: (HomeLaunch) -> Unit,
    onOpenState: () -> Unit,
) {
    var confidence by remember { mutableStateOf<List<ConfidenceItem>>(emptyList()) }
    var achievements by remember { mutableStateOf<List<Achievement>>(emptyList()) }
    var plan by remember { mutableStateOf<List<SevenDayStep>>(emptyList()) }
    var recent by remember { mutableStateOf<List<Int>>(emptyList()) }

    LaunchedEffect(refreshToken) {
        confidence = repository.getConfidenceMap()
        achievements = repository.getAchievements()
        plan = repository.getSevenDayPlan()
        recent = repository.getRecentScores()
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(padding),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            Text("Progress", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
            Text("Confidence, badges, and your 7-day route — same loop as the web Mission Control.")
        }

        item {
            SectionCard(title = "Score trail") {
                if (recent.isEmpty()) {
                    Text("No scores yet.")
                } else {
                    Text(recent.joinToString(" → ") { "$it%" }, fontWeight = FontWeight.SemiBold)
                }
            }
        }

        item {
            SectionCard(title = "Confidence map") {
                confidence.forEach { item ->
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 6.dp),
                        verticalArrangement = Arrangement.spacedBy(4.dp),
                    ) {
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                            Text(item.label, fontWeight = FontWeight.SemiBold)
                            Text("${item.averagePercent}% · ${item.level}")
                        }
                        LinearProgressIndicator(
                            progress = { item.averagePercent / 100f },
                            modifier = Modifier.fillMaxWidth(),
                        )
                        Text("${item.attempts} attempt(s)", style = MaterialTheme.typography.bodySmall)
                        if (item.level == "Needs work" || item.level == "Not started") {
                            OutlinedButton(onClick = {
                                onLaunchExam(HomeLaunch(category = item.category, count = 8))
                            }) { Text("Practice ${item.label}") }
                        }
                    }
                }
            }
        }

        item {
            SectionCard(title = "Achievements") {
                achievements.forEach { badge ->
                    Text(
                        "${if (badge.earned) "✓" else "○"} ${badge.title}",
                        fontWeight = FontWeight.SemiBold,
                    )
                    Text(badge.detail, style = MaterialTheme.typography.bodySmall)
                }
            }
        }

        item {
            SectionCard(title = "Pass in 7 Days") {
                plan.forEach { step ->
                    Text(
                        "Day ${step.day}: ${step.title}${if (step.completed) " ✓" else ""}",
                        fontWeight = FontWeight.SemiBold,
                    )
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
                        }) { Text("Start day ${step.day}") }
                    }
                }
            }
        }
    }
}
