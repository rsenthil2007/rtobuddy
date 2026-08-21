package com.rtobuddy.nativeapp.ui.quest

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import android.os.Handler
import android.os.Looper
import com.rtobuddy.nativeapp.data.RtoBuddyRepository
import com.rtobuddy.nativeapp.domain.model.QuestOverview
import kotlinx.coroutines.launch

@Composable
fun QuestScreen(
    repository: RtoBuddyRepository,
    padding: PaddingValues,
    refreshToken: Int,
) {
    val scope = rememberCoroutineScope()
    val mainHandler = remember { Handler(Looper.getMainLooper()) }
    var overview by remember { mutableStateOf<QuestOverview?>(null) }
    var immersive by remember { mutableStateOf(true) }
    var statusLine by remember { mutableStateOf("Enter a district in the 3D world") }

    suspend fun reload() {
        overview = repository.getQuestOverview()
    }

    LaunchedEffect(refreshToken) { reload() }

    if (immersive) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
        ) {
            QuestWorldView(
                modifier = Modifier.fillMaxSize(),
                events = QuestWorldEvents(
                    onReady = {
                        mainHandler.post { statusLine = "Roadsville ready · pick a scenario" }
                    },
                    onScenarioStart = { id ->
                        mainHandler.post { statusLine = "Playing · $id" }
                    },
                    onSceneResult = { chapterId, sceneId, safe ->
                        mainHandler.post {
                            scope.launch {
                                if (chapterId.isNotBlank() && sceneId.isNotBlank()) {
                                    repository.completeQuestScene(chapterId, sceneId, safe)
                                    reload()
                                }
                            }
                        }
                    },
                    onScenarioComplete = { id, safe ->
                        mainHandler.post {
                            statusLine = if (safe) "Cleared · $id" else "Retry · $id"
                            scope.launch { reload() }
                        }
                    },
                    onExitToMap = {
                        mainHandler.post {
                            statusLine = "Back at scenario select"
                            scope.launch { reload() }
                        }
                    },
                ),
            )
            Surface(
                shape = RoundedCornerShape(bottomStart = 12.dp, bottomEnd = 12.dp),
                color = MaterialTheme.colorScheme.surface.copy(alpha = 0.88f),
                modifier = Modifier
                    .align(Alignment.TopCenter)
                    .fillMaxWidth(),
            ) {
                Column(
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
                    verticalArrangement = Arrangement.spacedBy(4.dp),
                ) {
                    Text(
                        "Road Quest · 3D prototype",
                        style = MaterialTheme.typography.labelLarge,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary,
                    )
                    val snap = overview
                    Text(
                        "${snap?.stage ?: "CURIOUS"} · ★ ${snap?.stars ?: 0} · ${snap?.completedPlayable ?: 0}/${snap?.totalPlayable ?: 5}",
                        style = MaterialTheme.typography.bodySmall,
                    )
                    LinearProgressIndicator(
                        progress = {
                            val total = (snap?.totalPlayable ?: 1).coerceAtLeast(1)
                            (snap?.completedPlayable ?: 0).toFloat() / total
                        },
                        modifier = Modifier.fillMaxWidth(),
                    )
                    Text(statusLine, style = MaterialTheme.typography.labelSmall)
                }
            }
            OutlinedButton(
                onClick = { immersive = false },
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .padding(12.dp),
            ) {
                Text("Text map")
            }
        }
        return
    }

    // Fallback: compact chapter list (legacy text journey)
    QuestTextMap(
        overview = overview,
        padding = padding,
        onEnterWorld = { immersive = true },
    )
}

@Composable
private fun QuestTextMap(
    overview: QuestOverview?,
    padding: PaddingValues,
    onEnterWorld: () -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(padding)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text("District list", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
        Text(
            "Prefer the 3D world for learning. This list is only a progress checklist.",
            style = MaterialTheme.typography.bodyMedium,
        )
        OutlinedButton(onClick = onEnterWorld, modifier = Modifier.fillMaxWidth()) {
            Text("Back to Roadsville 3D")
        }
        overview?.chapters?.take(8)?.forEach { status ->
            val mark = when {
                status.completed -> "✓"
                status.unlocked -> "·"
                else -> "🔒"
            }
            Text("$mark  ${status.chapter.title}")
        }
    }
}
