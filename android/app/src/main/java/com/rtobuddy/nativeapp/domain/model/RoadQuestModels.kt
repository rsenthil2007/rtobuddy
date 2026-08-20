package com.rtobuddy.nativeapp.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class RoadQuestFile(
    val version: String = "1.0",
    val title: String = "Road Quest",
    val world: String = "Roadsville",
    val guide: String = "Buddy",
    val stages: List<String> = emptyList(),
    val appreciation: List<String> = emptyList(),
    val corrections: List<String> = emptyList(),
    val streakLines: List<String> = emptyList(),
    val chapters: List<QuestChapter> = emptyList(),
)

@Serializable
data class QuestChapter(
    val id: String,
    val order: Int = 0,
    val title: String,
    val subtitle: String = "",
    val emoji: String = "",
    val playable: Boolean = false,
    val teaser: String = "",
    val objectives: List<String> = emptyList(),
    val scenes: List<QuestScene> = emptyList(),
)

@Serializable
data class QuestScene(
    val id: String,
    val type: String = "story",
    val buddy: String = "",
    val body: String = "",
    val prompt: String = "",
    val signId: String? = null,
    val choices: List<String> = emptyList(),
    val correct: Int = 0,
    val feedback: QuestFeedback = QuestFeedback(),
    val hotspots: List<QuestHotspot> = emptyList(),
    val knowledgeRefs: List<String> = emptyList(),
    val continueLabel: String = "Continue",
)

@Serializable
data class QuestFeedback(
    val correct: String = "",
    val incorrect: String = "",
)

@Serializable
data class QuestHotspot(
    val id: String,
    val label: String,
    val reveal: String = "",
)

@Serializable
data class RoadQuestProgress(
    val completedSceneIds: List<String> = emptyList(),
    val completedChapterIds: List<String> = emptyList(),
    val safeStreak: Int = 0,
    val bestSafeStreak: Int = 0,
    val stars: Int = 0,
)

data class QuestChapterStatus(
    val chapter: QuestChapter,
    val unlocked: Boolean,
    val completed: Boolean,
    val sceneCount: Int,
    val completedScenes: Int,
)

data class QuestOverview(
    val title: String,
    val world: String,
    val guide: String,
    val stage: String,
    val stars: Int,
    val safeStreak: Int,
    val bestSafeStreak: Int,
    val completedPlayable: Int,
    val totalPlayable: Int,
    val chapters: List<QuestChapterStatus>,
    val nextChapterId: String?,
    val completedSceneIds: List<String> = emptyList(),
    val appreciation: List<String> = emptyList(),
    val corrections: List<String> = emptyList(),
    val streakLines: List<String> = emptyList(),
)
