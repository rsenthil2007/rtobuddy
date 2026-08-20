package com.rtobuddy.nativeapp.data

import com.rtobuddy.nativeapp.domain.ExamResult
import com.rtobuddy.nativeapp.domain.model.DailyActivity
import com.rtobuddy.nativeapp.domain.model.DailyRule
import com.rtobuddy.nativeapp.domain.model.ExamAttempt
import com.rtobuddy.nativeapp.domain.model.ExamQuestion
import com.rtobuddy.nativeapp.domain.model.JurisdictionInfo
import com.rtobuddy.nativeapp.domain.model.LocalReminder
import com.rtobuddy.nativeapp.domain.model.MissionProgress
import com.rtobuddy.nativeapp.domain.model.OfficialService
import com.rtobuddy.nativeapp.domain.model.ReadinessSnapshot
import com.rtobuddy.nativeapp.domain.model.RoadMarking
import com.rtobuddy.nativeapp.domain.model.RoadRule
import com.rtobuddy.nativeapp.domain.model.SevenDayStep
import com.rtobuddy.nativeapp.domain.model.StateUtRule
import com.rtobuddy.nativeapp.domain.model.TrafficSign
import com.rtobuddy.nativeapp.domain.model.TrafficSignal
import com.rtobuddy.nativeapp.domain.model.readinessStatus
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first

interface RtoBuddyRepository {
    val jurisdictionCode: Flow<String>
    suspend fun setJurisdiction(code: String)
    suspend fun getJurisdictions(): List<JurisdictionInfo>
    suspend fun getReadinessSnapshot(): ReadinessSnapshot
    suspend fun getMissionProgress(): MissionProgress
    suspend fun getSevenDayPlan(): List<SevenDayStep>
    suspend fun getDailyRule(): DailyRule
    suspend fun getLocalReminder(): LocalReminder?
    suspend fun getSigns(): List<TrafficSign>
    suspend fun getSignals(): List<TrafficSignal>
    suspend fun getMarkings(): List<RoadMarking>
    suspend fun getRules(): List<RoadRule>
    suspend fun getQuestions(): List<ExamQuestion>
    suspend fun getServices(): List<OfficialService>
    suspend fun getStateRules(): List<StateUtRule>
    suspend fun trackSignView(signId: String)
    suspend fun trackStateRuleView()
    suspend fun saveExamResult(result: ExamResult)
    suspend fun getRecentMistakeIds(): List<String>
    suspend fun getWeakCategory(): String?
    suspend fun refreshFromNetworkIfAvailable()
}

class OfflineFirstRtoBuddyRepository(
    private val catalog: AssetCatalog,
    private val progress: ProgressStore,
) : RtoBuddyRepository {
    override val jurisdictionCode: Flow<String> = progress.jurisdictionCode

    override suspend fun setJurisdiction(code: String) = progress.setJurisdiction(code)

    override suspend fun getJurisdictions(): List<JurisdictionInfo> = catalog.jurisdictions

    override suspend fun getReadinessSnapshot(): ReadinessSnapshot {
        val attempts = progress.getAttempts()
        val best = attempts.maxOfOrNull { it.percent } ?: 0
        val activity = ensureActivityDay()
        return ReadinessSnapshot(
            bestScore = best,
            streakDays = activity.streakDays,
            attempts = attempts.size,
            status = readinessStatus(best),
        )
    }

    override suspend fun getMissionProgress(): MissionProgress {
        val activity = ensureActivityDay()
        return MissionProgress(
            signsViewed = activity.signIds.size,
            exam10Completed = activity.exam10Completed,
            stateRuleReviewed = activity.stateRuleReviewed,
        )
    }

    override suspend fun getSevenDayPlan(): List<SevenDayStep> {
        val activity = ensureActivityDay()
        val attempts = progress.getAttempts()
        return listOf(
            SevenDayStep(1, "Signs Drill", "Master the most common signs.", "signs", activity.signIds.size >= 5),
            SevenDayStep(2, "Signals Sprint", "Understand signals quickly.", "signals", attempts.any { it.category == "traffic_signal" }),
            SevenDayStep(3, "Road Markings", "Lane, crossing, and edge markings.", "markings", attempts.any { it.category == "road_marking" }),
            SevenDayStep(4, "Road Rules", "Core national rules.", "rules", attempts.any { it.category == "road_rule" }),
            SevenDayStep(5, "State specifics", "Review your State / UT differences.", "state", activity.stateRuleReviewed),
            SevenDayStep(6, "Mock tests", "Timed test practice.", "exam10", activity.exam10Completed || attempts.any { it.total >= 10 }),
            SevenDayStep(7, "Final simulator", "Full exam-like run.", "simulator", attempts.any { it.mode == "simulator" }),
        )
    }

    override suspend fun getDailyRule(): DailyRule {
        val rules = catalog.rules
        if (rules.isEmpty()) return DailyRule("", "No rule loaded", "")
        val key = ProgressStore.todayKey()
        var hash = 0
        for (c in key) hash = 31 * hash + c.code
        val idx = ((hash % rules.size) + rules.size) % rules.size
        val rule = rules[idx]
        return DailyRule(rule.id, rule.title, rule.summary)
    }

    override suspend fun getLocalReminder(): LocalReminder? {
        val first = getStateRules().firstOrNull() ?: return null
        return LocalReminder(first.title, first.summary)
    }

    override suspend fun getSigns(): List<TrafficSign> = catalog.signs
    override suspend fun getSignals(): List<TrafficSignal> = catalog.signals
    override suspend fun getMarkings(): List<RoadMarking> = catalog.markings
    override suspend fun getRules(): List<RoadRule> = catalog.rules
    override suspend fun getQuestions(): List<ExamQuestion> = catalog.questions
    override suspend fun getServices(): List<OfficialService> = catalog.services

    override suspend fun getStateRules(): List<StateUtRule> {
        val code = progress.jurisdictionCode.first()
        return catalog.stateRules(code)
    }

    override suspend fun trackSignView(signId: String) {
        val today = ProgressStore.todayKey()
        val activity = ensureActivityDay()
        if (signId in activity.signIds) return
        val updated = activity.copy(
            dateKey = today,
            signIds = (activity.signIds + signId).distinct(),
        )
        progress.saveActivity(bumpStreak(updated))
    }

    override suspend fun trackStateRuleView() {
        val activity = ensureActivityDay()
        progress.saveActivity(bumpStreak(activity.copy(stateRuleReviewed = true)))
    }

    override suspend fun saveExamResult(result: ExamResult) {
        progress.addAttempt(
            ExamAttempt(
                score = result.correct,
                total = result.total,
                percent = result.percent,
                category = result.category,
                mode = result.mode,
                timestamp = result.timestamp,
                missedIds = result.missedIds,
            ),
        )
        if (result.missedIds.isNotEmpty()) {
            progress.setRecentMistakes(result.missedIds)
        }
        val activity = ensureActivityDay()
        val exam10 = activity.exam10Completed || result.total >= 10
        progress.saveActivity(bumpStreak(activity.copy(exam10Completed = exam10)))
    }

    override suspend fun getRecentMistakeIds(): List<String> = progress.getRecentMistakes()

    override suspend fun getWeakCategory(): String? {
        val attempts = progress.getAttempts().takeLast(8)
        if (attempts.isEmpty()) return null
        val byCat = attempts.groupBy { it.category.ifBlank { "all" } }
            .filterKeys { it != "all" }
            .mapValues { (_, list) -> list.map { it.percent }.average() }
        return byCat.minByOrNull { it.value }?.key
    }

    override suspend fun refreshFromNetworkIfAvailable() {
        // Offline-first: packaged assets are the source of truth for now.
    }

    private suspend fun ensureActivityDay(): DailyActivity {
        val today = ProgressStore.todayKey()
        val current = progress.getActivity()
        if (current.dateKey == today) return current
        val reset = DailyActivity(
            dateKey = today,
            signIds = emptyList(),
            exam10Completed = false,
            stateRuleReviewed = false,
            streakDays = current.streakDays,
            lastActiveDate = current.lastActiveDate,
        )
        progress.saveActivity(reset)
        return reset
    }

    private fun bumpStreak(activity: DailyActivity): DailyActivity {
        val today = ProgressStore.todayKey()
        val yesterday = ProgressStore.yesterdayKey()
        val streak = when (activity.lastActiveDate) {
            today -> activity.streakDays.coerceAtLeast(1)
            yesterday -> activity.streakDays + 1
            else -> 1
        }
        return activity.copy(streakDays = streak, lastActiveDate = today, dateKey = today)
    }
}
