package com.rtobuddy.nativeapp.data

import com.rtobuddy.nativeapp.domain.ExamResult
import com.rtobuddy.nativeapp.domain.model.Achievement
import com.rtobuddy.nativeapp.domain.model.CatalogStats
import com.rtobuddy.nativeapp.domain.model.ConfidenceItem
import com.rtobuddy.nativeapp.domain.model.DailyActivity
import com.rtobuddy.nativeapp.domain.model.DailyRule
import com.rtobuddy.nativeapp.domain.model.EmergencyNumber
import com.rtobuddy.nativeapp.domain.model.ExamQuestion
import com.rtobuddy.nativeapp.domain.model.JurisdictionInfo
import com.rtobuddy.nativeapp.domain.model.LocalReminder
import com.rtobuddy.nativeapp.domain.model.MissionProgress
import com.rtobuddy.nativeapp.domain.model.OfficialService
import com.rtobuddy.nativeapp.domain.model.QuestChapter
import com.rtobuddy.nativeapp.domain.model.QuestChapterStatus
import com.rtobuddy.nativeapp.domain.model.QuestOverview
import com.rtobuddy.nativeapp.domain.model.ReadinessSnapshot
import com.rtobuddy.nativeapp.domain.model.RoadMarking
import com.rtobuddy.nativeapp.domain.model.RoadQuestProgress
import com.rtobuddy.nativeapp.domain.model.RoadRule
import com.rtobuddy.nativeapp.domain.model.SevenDayStep
import com.rtobuddy.nativeapp.domain.model.StateUtRule
import com.rtobuddy.nativeapp.domain.model.TrafficSign
import com.rtobuddy.nativeapp.domain.model.TrafficSignal
import com.rtobuddy.nativeapp.domain.model.readinessStatus
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlin.math.roundToInt

interface RtoBuddyRepository {
    val jurisdictionCode: Flow<String>
    val themeId: Flow<String>
    suspend fun setJurisdiction(code: String)
    suspend fun setThemeId(theme: String)
    val onboardingDone: Flow<Boolean>
    suspend fun setOnboardingDone(done: Boolean)
    suspend fun getJurisdictions(): List<JurisdictionInfo>
    suspend fun getReadinessSnapshot(): ReadinessSnapshot
    suspend fun getMissionProgress(): MissionProgress
    suspend fun getCatalogStats(): CatalogStats
    suspend fun getConfidenceMap(): List<ConfidenceItem>
    suspend fun getAchievements(): List<Achievement>
    suspend fun getRecentScores(): List<Int>
    suspend fun getSevenDayPlan(): List<SevenDayStep>
    suspend fun getDailyRule(): DailyRule
    suspend fun getLocalReminder(): LocalReminder?
    suspend fun getSigns(): List<TrafficSign>
    suspend fun getSignals(): List<TrafficSignal>
    suspend fun getMarkings(): List<RoadMarking>
    suspend fun getRules(): List<RoadRule>
    suspend fun getQuestions(): List<ExamQuestion>
    suspend fun getSpotItQuestionIds(): List<String>
    suspend fun getServices(): List<OfficialService>
    suspend fun getEmergencyNumbers(): List<EmergencyNumber>
    suspend fun getStateRules(): List<StateUtRule>
    suspend fun getQuestOverview(): QuestOverview
    suspend fun getQuestChapter(chapterId: String): QuestChapter?
    suspend fun completeQuestScene(chapterId: String, sceneId: String, safeChoice: Boolean?): RoadQuestProgress
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
    override val themeId: Flow<String> = progress.themeId
    override val onboardingDone: Flow<Boolean> = progress.onboardingDone

    override suspend fun setJurisdiction(code: String) = progress.setJurisdiction(code)
    override suspend fun setThemeId(theme: String) = progress.setThemeId(theme)
    override suspend fun setOnboardingDone(done: Boolean) = progress.setOnboardingDone(done)

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

    override suspend fun getCatalogStats(): CatalogStats = CatalogStats(
        signs = catalog.signs.size,
        signals = catalog.signals.size,
        markings = catalog.markings.size,
        rules = catalog.rules.size,
        questions = catalog.questions.size,
        jurisdictions = catalog.jurisdictions.size,
    )

    override suspend fun getConfidenceMap(): List<ConfidenceItem> {
        val labels = mapOf(
            "traffic_sign" to "Signs",
            "traffic_signal" to "Signals",
            "road_marking" to "Markings",
            "road_rule" to "Rules",
        )
        val attempts = progress.getAttempts()
        return labels.map { (category, label) ->
            val list = attempts.filter { it.category == category }
            val avg = if (list.isEmpty()) 0 else list.map { it.percent }.average().roundToInt()
            ConfidenceItem(
                category = category,
                label = label,
                attempts = list.size,
                averagePercent = avg,
                level = when {
                    list.isEmpty() -> "Not started"
                    avg >= 80 -> "Strong"
                    avg >= 60 -> "Building"
                    else -> "Needs work"
                },
            )
        }
    }

    override suspend fun getAchievements(): List<Achievement> {
        val attempts = progress.getAttempts()
        val activity = ensureActivityDay()
        val best = attempts.maxOfOrNull { it.percent } ?: 0
        val questProgress = progress.getQuestProgress()
        return listOf(
            Achievement("first_drill", "First drill", "Complete any practice run", attempts.isNotEmpty()),
            Achievement("streak_3", "3-day streak", "Learn across 3 consecutive days", activity.streakDays >= 3),
            Achievement("signs_5", "Sign scout", "Open 5 signs in a day", activity.signIds.size >= 5),
            Achievement("exam_ready", "Exam Ready", "Hit 75%+ on any attempt", best >= 75),
            Achievement("simulator", "Simulator pilot", "Finish an exam simulator", attempts.any { it.mode == "simulator" }),
            Achievement("state_aware", "State aware", "Review a State/UT rule", activity.stateRuleReviewed),
            Achievement("roadsville", "Roadsville arrival", "Complete Welcome to Roadsville", questProgress.completedChapterIds.contains("welcome")),
            Achievement("sign_forest", "Sign forest walker", "Complete Sign Forest", questProgress.completedChapterIds.contains("sign_forest")),
            Achievement("first_challenge", "First challenge", "Finish the First Road Challenge", questProgress.completedChapterIds.contains("scenario_challenge")),
        )
    }

    override suspend fun getRecentScores(): List<Int> =
        progress.getAttempts().takeLast(8).map { it.percent }

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

    override suspend fun getSpotItQuestionIds(): List<String> {
        val animated = catalog.questions.filter { !it.animation.isNullOrBlank() }.map { it.id }
        if (animated.isNotEmpty()) return animated.shuffled().take(6)
        return catalog.questions
            .filter { !it.sign_id.isNullOrBlank() || !it.signal_id.isNullOrBlank() }
            .shuffled()
            .take(6)
            .map { it.id }
    }

    override suspend fun getServices(): List<OfficialService> = catalog.services

    override suspend fun getEmergencyNumbers(): List<EmergencyNumber> = catalog.emergencyNumbers

    override suspend fun getStateRules(): List<StateUtRule> {
        val code = progress.jurisdictionCode.first()
        return catalog.stateRules(code)
    }

    override suspend fun getQuestOverview(): QuestOverview {
        val quest = catalog.roadQuest
        val questProgress = progress.getQuestProgress()
        val completedIds = questProgress.completedChapterIds.toSet()
        val completedScenes = questProgress.completedSceneIds.toSet()
        val sorted = quest.chapters.sortedBy { it.order }
        val playable = sorted.filter { it.playable }
        val completedPlayable = playable.count { it.id in completedIds }
        val stage = questStage(quest.stages, completedPlayable)

        val statuses = sorted.map { chapter ->
            val unlocked = isQuestChapterUnlocked(chapter, playable, completedIds, completedPlayable)
            val sceneIds = chapter.scenes.map { it.id }
            QuestChapterStatus(
                chapter = chapter,
                unlocked = unlocked,
                completed = chapter.id in completedIds,
                sceneCount = sceneIds.size,
                completedScenes = sceneIds.count { it in completedScenes },
            )
        }
        val nextChapterId = statuses
            .firstOrNull { it.chapter.playable && it.unlocked && !it.completed }
            ?.chapter?.id

        return QuestOverview(
            title = quest.title,
            world = quest.world,
            guide = quest.guide,
            stage = stage,
            stars = questProgress.stars,
            safeStreak = questProgress.safeStreak,
            bestSafeStreak = questProgress.bestSafeStreak,
            completedPlayable = completedPlayable,
            totalPlayable = playable.size,
            chapters = statuses,
            nextChapterId = nextChapterId,
            completedSceneIds = questProgress.completedSceneIds,
            appreciation = quest.appreciation,
            corrections = quest.corrections,
            streakLines = quest.streakLines,
        )
    }

    override suspend fun getQuestChapter(chapterId: String): QuestChapter? {
        val quest = catalog.roadQuest
        val chapter = quest.chapters.firstOrNull { it.id == chapterId } ?: return null
        val sorted = quest.chapters.sortedBy { it.order }
        val playable = sorted.filter { it.playable }
        val questProgress = progress.getQuestProgress()
        val completedIds = questProgress.completedChapterIds.toSet()
        val completedPlayable = playable.count { it.id in completedIds }
        if (!chapter.playable) return chapter
        return if (isQuestChapterUnlocked(chapter, playable, completedIds, completedPlayable)) chapter else null
    }

    override suspend fun completeQuestScene(
        chapterId: String,
        sceneId: String,
        safeChoice: Boolean?,
    ): RoadQuestProgress {
        val quest = catalog.roadQuest
        val chapter = quest.chapters.firstOrNull { it.id == chapterId }
        var updated = progress.getQuestProgress()

        // Wrong choices teach — they do not complete the scene.
        if (safeChoice != false) {
            val wasNew = sceneId !in updated.completedSceneIds
            val scenesDone = (updated.completedSceneIds + sceneId).distinct()
            updated = updated.copy(completedSceneIds = scenesDone)

            // Closed-group MVP: one star per newly cleared district/scene.
            if (wasNew && safeChoice == true) {
                updated = updated.copy(stars = updated.stars + 1)
            }

            if (chapter != null) {
                val allDone = chapter.scenes.isNotEmpty() &&
                    chapter.scenes.all { it.id in scenesDone }
                if (allDone && chapter.id !in updated.completedChapterIds) {
                    updated = updated.copy(
                        completedChapterIds = updated.completedChapterIds + chapter.id,
                    )
                }
            }
        }

        updated = when (safeChoice) {
            true -> {
                val streak = updated.safeStreak + 1
                updated.copy(
                    safeStreak = streak,
                    bestSafeStreak = maxOf(updated.bestSafeStreak, streak),
                )
            }
            false -> updated.copy(safeStreak = 0)
            null -> updated
        }

        progress.saveQuestProgress(updated)
        val activity = ensureActivityDay()
        progress.saveActivity(bumpStreak(activity))
        return updated
    }

    private fun isQuestChapterUnlocked(
        chapter: QuestChapter,
        playableSorted: List<QuestChapter>,
        completedChapterIds: Set<String>,
        completedPlayable: Int,
    ): Boolean {
        if (!chapter.playable) return completedPlayable >= 5
        val index = playableSorted.indexOfFirst { it.id == chapter.id }
        if (index <= 0) return true
        return playableSorted[index - 1].id in completedChapterIds
    }

    private fun questStage(stages: List<String>, completedPlayable: Int): String {
        if (stages.isEmpty()) return "CURIOUS"
        val index = when {
            completedPlayable <= 0 -> 0
            completedPlayable <= 2 -> 1
            completedPlayable == 3 -> 2
            completedPlayable == 4 -> 3
            else -> 4
        }.coerceAtMost(stages.lastIndex)
        return stages[index]
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
