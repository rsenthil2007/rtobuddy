package com.rtobuddy.nativeapp.ui.quest

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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import coil.decode.SvgDecoder
import coil.request.ImageRequest
import com.rtobuddy.nativeapp.data.RtoBuddyRepository
import com.rtobuddy.nativeapp.domain.model.QuestChapter
import com.rtobuddy.nativeapp.domain.model.QuestChapterStatus
import com.rtobuddy.nativeapp.domain.model.QuestOverview
import com.rtobuddy.nativeapp.domain.model.TrafficSign
import com.rtobuddy.nativeapp.ui.components.SectionCard
import kotlinx.coroutines.launch

@Composable
fun QuestScreen(
    repository: RtoBuddyRepository,
    padding: PaddingValues,
    refreshToken: Int,
) {
    val scope = rememberCoroutineScope()
    var overview by remember { mutableStateOf<QuestOverview?>(null) }
    var activeChapter by remember { mutableStateOf<QuestChapter?>(null) }
    var sceneIndex by remember { mutableIntStateOf(0) }
    var signs by remember { mutableStateOf<List<TrafficSign>>(emptyList()) }

    suspend fun reload() {
        overview = repository.getQuestOverview()
        if (signs.isEmpty()) signs = repository.getSigns()
    }

    LaunchedEffect(refreshToken) { reload() }

    val chapter = activeChapter
    if (chapter != null) {
        ChapterPlayer(
            chapter = chapter,
            sceneIndex = sceneIndex,
            signs = signs,
            overview = overview,
            padding = padding,
            onBack = {
                activeChapter = null
                sceneIndex = 0
                scope.launch { reload() }
            },
            onAdvance = { nextIndex ->
                if (nextIndex >= chapter.scenes.size) {
                    activeChapter = null
                    sceneIndex = 0
                    scope.launch { reload() }
                } else {
                    sceneIndex = nextIndex
                }
            },
            onCompleteScene = { sceneId, safe ->
                scope.launch {
                    repository.completeQuestScene(chapter.id, sceneId, safe)
                    overview = repository.getQuestOverview()
                }
            },
        )
        return
    }

    val snap = overview
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
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                ) {
                    Text(
                        "ROAD QUEST",
                        style = MaterialTheme.typography.labelLarge,
                        color = MaterialTheme.colorScheme.primary,
                        fontWeight = FontWeight.Bold,
                    )
                    Text(
                        snap?.world ?: "Roadsville",
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold,
                    )
                    Text(
                        "Explore with ${snap?.guide ?: "Buddy"}. Experience why rules exist — then the LLR feels natural.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.8f),
                    )
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        StageChip(label = snap?.stage ?: "CURIOUS")
                        Text("★ ${snap?.stars ?: 0}", style = MaterialTheme.typography.titleMedium)
                        if ((snap?.safeStreak ?: 0) > 0) {
                            Text(
                                "Safe streak ${snap?.safeStreak}",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.primary,
                            )
                        }
                    }
                    val done = snap?.completedPlayable ?: 0
                    val total = (snap?.totalPlayable ?: 1).coerceAtLeast(1)
                    LinearProgressIndicator(
                        progress = { done.toFloat() / total },
                        modifier = Modifier.fillMaxWidth(),
                    )
                    Text(
                        "$done of $total districts explored",
                        style = MaterialTheme.typography.labelMedium,
                    )
                    val nextId = snap?.nextChapterId
                    if (nextId != null) {
                        Button(
                            onClick = {
                                scope.launch {
                                    activeChapter = repository.getQuestChapter(nextId)
                                    sceneIndex = firstIncompleteSceneIndex(activeChapter, overview)
                                }
                            },
                            modifier = Modifier.fillMaxWidth(),
                        ) {
                            Text("Continue journey")
                        }
                    }
                }
            }
        }

        item {
            Text(
                "Districts of Roadsville",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
            )
        }

        items(snap?.chapters.orEmpty()) { status ->
            ChapterMapCard(
                status = status,
                isNext = status.chapter.id == snap?.nextChapterId,
                onOpen = {
                    if (!status.unlocked) return@ChapterMapCard
                    if (!status.chapter.playable) return@ChapterMapCard
                    scope.launch {
                        activeChapter = repository.getQuestChapter(status.chapter.id)
                        sceneIndex = firstIncompleteSceneIndex(activeChapter, overview)
                    }
                },
            )
        }

        item {
            SectionCard(
                title = "How learning feels here",
                body = "Wrong answers are part of the journey. Buddy never says “you failed” — only “let’s see why.” By the end, rules should feel comfortable, not crammed.",
            )
        }
    }
}

private fun firstIncompleteSceneIndex(chapter: QuestChapter?, overview: QuestOverview?): Int {
    if (chapter == null || chapter.scenes.isEmpty()) return 0
    val done = overview?.completedSceneIds?.toSet().orEmpty()
    val idx = chapter.scenes.indexOfFirst { it.id !in done }
    return if (idx < 0) 0 else idx
}

@Composable
private fun StageChip(label: String) {
    Surface(
        shape = RoundedCornerShape(50),
        color = MaterialTheme.colorScheme.primary.copy(alpha = 0.18f),
    ) {
        Text(
            label,
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
            style = MaterialTheme.typography.labelLarge,
            color = MaterialTheme.colorScheme.primary,
            fontWeight = FontWeight.Bold,
        )
    }
}

@Composable
private fun ChapterMapCard(
    status: QuestChapterStatus,
    isNext: Boolean,
    onOpen: () -> Unit,
) {
    val chapter = status.chapter
    val enabled = status.unlocked && chapter.playable
    Surface(
        shape = RoundedCornerShape(16.dp),
        tonalElevation = if (isNext) 3.dp else 1.dp,
        color = when {
            status.completed -> MaterialTheme.colorScheme.primary.copy(alpha = 0.12f)
            isNext -> MaterialTheme.colorScheme.surface
            !status.unlocked -> MaterialTheme.colorScheme.surface.copy(alpha = 0.55f)
            else -> MaterialTheme.colorScheme.surface
        },
        modifier = Modifier
            .fillMaxWidth()
            .then(if (enabled) Modifier.clickable(onClick = onOpen) else Modifier),
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .background(
                        MaterialTheme.colorScheme.primary.copy(alpha = if (status.unlocked) 0.2f else 0.08f),
                        CircleShape,
                    ),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    if (status.completed) "✓" else chapter.emoji.ifBlank { "${chapter.order}" },
                    style = MaterialTheme.typography.titleMedium,
                )
            }
            Column(modifier = Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
                Text(chapter.title, fontWeight = FontWeight.SemiBold)
                Text(
                    when {
                        !status.unlocked -> "Locked — finish the previous district"
                        !chapter.playable -> chapter.teaser.ifBlank { chapter.subtitle }
                        status.completed -> "Completed · revisit anytime"
                        isNext -> "Up next · ${chapter.subtitle}"
                        else -> chapter.subtitle
                    },
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.75f),
                )
                if (chapter.playable && status.sceneCount > 0) {
                    Text(
                        "${status.completedScenes}/${status.sceneCount} scenes",
                        style = MaterialTheme.typography.labelSmall,
                    )
                }
            }
        }
    }
}

@Composable
private fun ChapterPlayer(
    chapter: QuestChapter,
    sceneIndex: Int,
    signs: List<TrafficSign>,
    overview: QuestOverview?,
    padding: PaddingValues,
    onBack: () -> Unit,
    onAdvance: (Int) -> Unit,
    onCompleteScene: (sceneId: String, safeChoice: Boolean?) -> Unit,
) {
    val scene = chapter.scenes.getOrNull(sceneIndex)
    if (scene == null) {
        LaunchedEffect(Unit) { onBack() }
        return
    }

    var revealedHotspots by remember(scene.id) { mutableStateOf(setOf<String>()) }
    var selectedChoice by remember(scene.id) { mutableStateOf<Int?>(null) }
    var feedback by remember(scene.id) { mutableStateOf<String?>(null) }
    var answeredSafe by remember(scene.id) { mutableStateOf<Boolean?>(null) }
    var sceneSaved by remember(scene.id) { mutableStateOf(false) }

    val decisionType = scene.type in setOf("choose", "spot", "match")
    val exploreReady = scene.type != "explore" || revealedHotspots.size >= scene.hotspots.size
    val canContinue = when (scene.type) {
        "story" -> true
        "explore" -> exploreReady
        else -> answeredSafe == true
    }

    fun pickChoice(index: Int) {
        if (answeredSafe == true) return
        selectedChoice = index
        val safe = index == scene.correct
        answeredSafe = safe
        val line = if (safe) {
            val streakBonus = if ((overview?.safeStreak ?: 0) >= 2) {
                overview?.streakLines?.randomOrNull()
            } else null
            streakBonus
                ?: overview?.appreciation?.randomOrNull()
                ?: scene.feedback.correct
        } else {
            listOfNotNull(
                overview?.corrections?.randomOrNull(),
                scene.feedback.incorrect.takeIf { it.isNotBlank() },
            ).joinToString(" ")
        }
        feedback = line.ifBlank {
            if (safe) scene.feedback.correct else scene.feedback.incorrect
        }
        if (safe && !sceneSaved) {
            sceneSaved = true
            onCompleteScene(scene.id, true)
        } else if (!safe) {
            onCompleteScene(scene.id, false)
        }
    }

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(padding),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            OutlinedButton(onClick = onBack) { Text("Map") }
        }
        item {
            Text(
                chapter.title,
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
            )
            Text(
                "Scene ${sceneIndex + 1} of ${chapter.scenes.size}",
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.primary,
            )
        }
        item {
            BuddyCard(text = scene.buddy)
        }
        if (scene.body.isNotBlank()) {
            item {
                Text(scene.body, style = MaterialTheme.typography.bodyLarge)
            }
        }
        if (!scene.signId.isNullOrBlank()) {
            item {
                val sign = signs.firstOrNull { it.id == scene.signId }
                if (sign != null) {
                    Surface(shape = RoundedCornerShape(12.dp), tonalElevation = 1.dp) {
                        Column(
                            modifier = Modifier.padding(12.dp),
                            verticalArrangement = Arrangement.spacedBy(6.dp),
                        ) {
                            Text(sign.name, fontWeight = FontWeight.SemiBold)
                            QuestSignImage(asset = sign.image_asset, name = sign.name)
                        }
                    }
                }
            }
        }
        if (scene.prompt.isNotBlank()) {
            item {
                Text(scene.prompt, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
            }
        }
        if (scene.type == "explore") {
            items(scene.hotspots) { hotspot ->
                val open = hotspot.id in revealedHotspots
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    tonalElevation = 1.dp,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable {
                            revealedHotspots = revealedHotspots + hotspot.id
                        },
                ) {
                    Column(modifier = Modifier.padding(12.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text(hotspot.label, fontWeight = FontWeight.Medium)
                        if (open) {
                            Text(hotspot.reveal, style = MaterialTheme.typography.bodyMedium)
                        } else {
                            Text("Tap to notice", style = MaterialTheme.typography.labelSmall)
                        }
                    }
                }
            }
        }
        if (decisionType) {
            items(scene.choices.size) { index ->
                val choice = scene.choices[index]
                val selected = selectedChoice == index
                val tint = when {
                    answeredSafe == true && index == scene.correct ->
                        MaterialTheme.colorScheme.primary.copy(alpha = 0.2f)
                    selected && answeredSafe == false ->
                        MaterialTheme.colorScheme.error.copy(alpha = 0.15f)
                    else -> MaterialTheme.colorScheme.surface
                }
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = tint,
                    tonalElevation = 1.dp,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { pickChoice(index) },
                ) {
                    Text(
                        choice,
                        modifier = Modifier.padding(14.dp),
                        style = MaterialTheme.typography.bodyLarge,
                    )
                }
            }
        }
        if (!feedback.isNullOrBlank()) {
            item {
                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = MaterialTheme.colorScheme.primary.copy(alpha = 0.12f),
                ) {
                    Text(
                        feedback.orEmpty(),
                        modifier = Modifier.padding(14.dp),
                        style = MaterialTheme.typography.bodyMedium,
                    )
                }
            }
        }
        item {
            Spacer(Modifier.height(4.dp))
            Button(
                onClick = {
                    if (scene.type == "story" || scene.type == "explore") {
                        if (!sceneSaved) {
                            sceneSaved = true
                            onCompleteScene(scene.id, null)
                        }
                    }
                    onAdvance(sceneIndex + 1)
                },
                enabled = canContinue,
                modifier = Modifier.fillMaxWidth(),
            ) {
                Text(scene.continueLabel.ifBlank { "Continue" })
            }
            if (decisionType && answeredSafe == false) {
                Text(
                    "Try again — look once more.",
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.7f),
                    modifier = Modifier.padding(top = 8.dp),
                )
            }
        }
    }
}

@Composable
private fun BuddyCard(text: String) {
    if (text.isBlank()) return
    Row(
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalAlignment = Alignment.Top,
    ) {
        Box(
            modifier = Modifier
                .size(44.dp)
                .background(MaterialTheme.colorScheme.secondary.copy(alpha = 0.25f), CircleShape),
            contentAlignment = Alignment.Center,
        ) {
            Text("B", fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
        }
        Surface(
            shape = RoundedCornerShape(topStart = 4.dp, topEnd = 16.dp, bottomStart = 16.dp, bottomEnd = 16.dp),
            color = MaterialTheme.colorScheme.surface,
            tonalElevation = 2.dp,
            modifier = Modifier.weight(1f),
        ) {
            Column(modifier = Modifier.padding(12.dp)) {
                Text("Buddy", style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.primary)
                Text(text, style = MaterialTheme.typography.bodyLarge)
            }
        }
    }
}

@Composable
private fun QuestSignImage(asset: String?, name: String) {
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
            .height(120.dp),
        contentScale = ContentScale.Fit,
    )
}
