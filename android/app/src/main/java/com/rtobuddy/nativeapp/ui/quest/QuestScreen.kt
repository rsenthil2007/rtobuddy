package com.rtobuddy.nativeapp.ui.quest

import android.os.Handler
import android.os.Looper
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import android.app.Activity
import com.rtobuddy.nativeapp.ads.AdsManager
import com.rtobuddy.nativeapp.data.RtoBuddyRepository
import com.rtobuddy.nativeapp.domain.model.QuestOverview
import kotlinx.coroutines.launch

@Composable
fun QuestScreen(
    repository: RtoBuddyRepository,
    adsManager: AdsManager,
    padding: PaddingValues,
    refreshToken: Int,
) {
    val scope = rememberCoroutineScope()
    val mainHandler = remember { Handler(Looper.getMainLooper()) }
    val activity = LocalContext.current as? Activity
    var overview by remember { mutableStateOf<QuestOverview?>(null) }
    var statusLine by remember { mutableStateOf("Finish districts in order") }

    suspend fun reload() {
        overview = repository.getQuestOverview()
    }

    LaunchedEffect(refreshToken) { reload() }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .padding(padding),
    ) {
        QuestWorldView(
            modifier = Modifier.fillMaxSize(),
            completedScenarioIds = overview?.completedSceneIds.orEmpty(),
            events = QuestWorldEvents(
                onReady = {
                    mainHandler.post { statusLine = "Roadsville ready · unlock step by step" }
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
                        statusLine = if (safe) "Cleared · $id · next unlocked" else "Retry · $id"
                        if (safe) {
                            adsManager.onQuestScenarioComplete(activity)
                        }
                        scope.launch { reload() }
                    }
                },
                onExitToMap = {
                    mainHandler.post {
                        statusLine = "District map"
                        scope.launch { reload() }
                    }
                },
            ),
        )
        Surface(
            shape = RoundedCornerShape(bottomStart = 12.dp, bottomEnd = 12.dp),
            color = MaterialTheme.colorScheme.surface.copy(alpha = 0.9f),
            modifier = Modifier
                .align(Alignment.TopCenter)
                .fillMaxWidth(),
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                val snap = overview
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        "Road Quest",
                        style = MaterialTheme.typography.labelLarge,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.primary,
                    )
                    Text(
                        "${snap?.stage ?: "CURIOUS"} · ★ ${snap?.stars ?: 0} · $statusLine",
                        style = MaterialTheme.typography.labelSmall,
                        maxLines = 1,
                    )
                }
            }
        }
    }
}
