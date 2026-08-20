package com.rtobuddy.nativeapp.domain.model

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
)

data class ReadinessSnapshot(
    val bestScore: Int = 0,
    val streakDays: Int = 0,
    val attempts: Int = 0,
    val status: String = "Keep Practising",
)

data class SevenDayStep(
    val day: Int,
    val title: String,
    val detail: String,
    val completed: Boolean = false,
)
