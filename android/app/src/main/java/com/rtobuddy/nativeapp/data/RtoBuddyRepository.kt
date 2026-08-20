package com.rtobuddy.nativeapp.data

import com.rtobuddy.nativeapp.domain.model.MissionProgress
import com.rtobuddy.nativeapp.domain.model.ReadinessSnapshot
import com.rtobuddy.nativeapp.domain.model.SevenDayStep

interface RtoBuddyRepository {
    suspend fun getReadinessSnapshot(): ReadinessSnapshot
    suspend fun getMissionProgress(): MissionProgress
    suspend fun getSevenDayPlan(): List<SevenDayStep>
    suspend fun refreshFromNetworkIfAvailable()
}

class OfflineFirstRtoBuddyRepository : RtoBuddyRepository {
    override suspend fun getReadinessSnapshot(): ReadinessSnapshot {
        return ReadinessSnapshot(bestScore = 84, streakDays = 4, attempts = 12, status = "Exam Ready")
    }

    override suspend fun getMissionProgress(): MissionProgress {
        return MissionProgress(signsViewed = 3, exam10Completed = false, stateRuleReviewed = true)
    }

    override suspend fun getSevenDayPlan(): List<SevenDayStep> {
        return listOf(
            SevenDayStep(1, "Signs Drill", "Master the most common signs.", completed = true),
            SevenDayStep(2, "Signals Sprint", "Understand signals quickly."),
            SevenDayStep(3, "Road Markings", "Lane, crossing, and edge markings."),
            SevenDayStep(4, "Road Rules", "Core national rules."),
            SevenDayStep(5, "State specifics", "Review your State / UT differences."),
            SevenDayStep(6, "Mock tests", "Timed test practice."),
            SevenDayStep(7, "Final simulator", "Full exam-like run."),
        )
    }

    override suspend fun refreshFromNetworkIfAvailable() {
        // Offline-first product: the packaged dataset remains the source of truth until
        // remote sync is introduced in the next implementation slice.
    }
}
