package com.rtobuddy.nativeapp.domain.model

import kotlinx.serialization.Serializable

enum class TopicArea {
    TRAFFIC_SIGN,
    TRAFFIC_SIGNAL,
    ROAD_MARKING,
    ROAD_RULE,
    LEARNER_AND_PROCESS,
}

data class MissionProgress(
    val signsViewed: Int = 0,
    val exam10Completed: Boolean = false,
    val stateRuleReviewed: Boolean = false,
) {
    val completedCount: Int
        get() = listOf(signsViewed >= 5, exam10Completed, stateRuleReviewed).count { it }
}

data class ReadinessSnapshot(
    val bestScore: Int = 0,
    val streakDays: Int = 0,
    val attempts: Int = 0,
    val status: String = "Keep Practising",
)

data class CatalogStats(
    val signs: Int = 0,
    val signals: Int = 0,
    val markings: Int = 0,
    val rules: Int = 0,
    val questions: Int = 0,
    val jurisdictions: Int = 0,
)

data class ConfidenceItem(
    val category: String,
    val label: String,
    val attempts: Int,
    val averagePercent: Int,
    val level: String,
)

data class Achievement(
    val id: String,
    val title: String,
    val detail: String,
    val earned: Boolean,
)

data class SevenDayStep(
    val day: Int,
    val title: String,
    val detail: String,
    val action: String,
    val completed: Boolean = false,
)

data class DailyRule(
    val id: String,
    val title: String,
    val summary: String,
)

data class JurisdictionInfo(
    val code: String,
    val name: String,
)

data class LocalReminder(
    val title: String,
    val summary: String,
)

@Serializable
data class ExamQuestion(
    val id: String,
    val category: String = "",
    val difficulty: String = "",
    val question: String,
    val options: List<String> = emptyList(),
    val answer_index: Int = 0,
    val explanation: String = "",
    val sign_id: String? = null,
    val signal_id: String? = null,
    val marking_id: String? = null,
    val animation: String? = null,
)

@Serializable
data class TrafficSign(
    val id: String,
    val name: String,
    val category: String = "",
    val meaning: String = "",
    val image_asset: String? = null,
)

@Serializable
data class TrafficSignal(
    val id: String,
    val name: String,
    val category: String = "",
    val meaning: String = "",
)

@Serializable
data class RoadMarking(
    val id: String,
    val name: String,
    val category: String = "",
    val meaning: String = "",
)

@Serializable
data class RoadRule(
    val id: String,
    val title: String,
    val summary: String = "",
    val category: String = "",
    val exam_relevant: Boolean = false,
)

@Serializable
data class OfficialService(
    val id: String,
    val name: String,
    val purpose: String = "",
    val url: String = "",
    val scope: String = "",
)

@Serializable
data class EmergencyNumber(
    val id: String,
    val number: String,
    val name: String,
    val when_to_call: String,
)

@Serializable
data class StateUtRule(
    val id: String,
    val title: String,
    val summary: String = "",
    val category: String = "",
)

@Serializable
data class ExamAttempt(
    val score: Int,
    val total: Int,
    val percent: Int,
    val category: String,
    val mode: String,
    val timestamp: String,
    val missedIds: List<String> = emptyList(),
)

@Serializable
data class DailyActivity(
    val dateKey: String = "",
    val signIds: List<String> = emptyList(),
    val exam10Completed: Boolean = false,
    val stateRuleReviewed: Boolean = false,
    val streakDays: Int = 0,
    val lastActiveDate: String = "",
)

fun readinessStatus(bestScore: Int): String = when {
    bestScore >= 90 -> "Strong"
    bestScore >= 75 -> "Exam Ready"
    bestScore >= 50 -> "Improving"
    else -> "Keep Practising"
}
