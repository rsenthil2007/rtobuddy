package com.rtobuddy.nativeapp.data

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.rtobuddy.nativeapp.domain.model.DailyActivity
import com.rtobuddy.nativeapp.domain.model.ExamAttempt
import com.rtobuddy.nativeapp.domain.model.RoadQuestProgress
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import java.time.LocalDate
import java.time.format.DateTimeFormatter

private val Context.progressDataStore by preferencesDataStore(name = "rtobuddy_progress")

class ProgressStore(private val context: Context) {
    private val json = Json { ignoreUnknownKeys = true }
    private val jurisdictionKey = stringPreferencesKey("jurisdiction_code")
    private val themeKey = stringPreferencesKey("theme_id")
    private val attemptsKey = stringPreferencesKey("attempts_json")
    private val activityKey = stringPreferencesKey("activity_json")
    private val mistakesKey = stringPreferencesKey("recent_mistakes_json")
    private val questKey = stringPreferencesKey("road_quest_json")

    val jurisdictionCode: Flow<String> = context.progressDataStore.data.map { prefs ->
        prefs[jurisdictionKey] ?: "TN"
    }

    val themeId: Flow<String> = context.progressDataStore.data.map { prefs ->
        prefs[themeKey] ?: "BALANCED"
    }

    suspend fun setJurisdiction(code: String) {
        context.progressDataStore.edit { it[jurisdictionKey] = code }
    }

    suspend fun setThemeId(theme: String) {
        context.progressDataStore.edit { it[themeKey] = theme }
    }

    suspend fun getAttempts(): List<ExamAttempt> {
        val raw = context.progressDataStore.data.first()[attemptsKey].orEmpty()
        if (raw.isBlank()) return emptyList()
        return runCatching { json.decodeFromString<List<ExamAttempt>>(raw) }.getOrDefault(emptyList())
    }

    suspend fun addAttempt(attempt: ExamAttempt) {
        val next = (getAttempts() + attempt).takeLast(50)
        context.progressDataStore.edit { it[attemptsKey] = json.encodeToString(next) }
    }

    suspend fun getActivity(): DailyActivity {
        val raw = context.progressDataStore.data.first()[activityKey].orEmpty()
        if (raw.isBlank()) return DailyActivity()
        return runCatching { json.decodeFromString<DailyActivity>(raw) }.getOrDefault(DailyActivity())
    }

    suspend fun saveActivity(activity: DailyActivity) {
        context.progressDataStore.edit { it[activityKey] = json.encodeToString(activity) }
    }

    suspend fun getRecentMistakes(): List<String> {
        val raw = context.progressDataStore.data.first()[mistakesKey].orEmpty()
        if (raw.isBlank()) return emptyList()
        return runCatching { json.decodeFromString<List<String>>(raw) }.getOrDefault(emptyList())
    }

    suspend fun setRecentMistakes(ids: List<String>) {
        context.progressDataStore.edit { it[mistakesKey] = json.encodeToString(ids.take(20)) }
    }

    suspend fun getQuestProgress(): RoadQuestProgress {
        val raw = context.progressDataStore.data.first()[questKey].orEmpty()
        if (raw.isBlank()) return RoadQuestProgress()
        return runCatching { json.decodeFromString<RoadQuestProgress>(raw) }.getOrDefault(RoadQuestProgress())
    }

    suspend fun saveQuestProgress(progress: RoadQuestProgress) {
        context.progressDataStore.edit { it[questKey] = json.encodeToString(progress) }
    }

    companion object {
        private val fmt = DateTimeFormatter.ISO_LOCAL_DATE
        fun todayKey(): String = LocalDate.now().format(fmt)
        fun yesterdayKey(): String = LocalDate.now().minusDays(1).format(fmt)
    }
}
