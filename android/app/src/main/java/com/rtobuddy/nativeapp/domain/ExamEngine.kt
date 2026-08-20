package com.rtobuddy.nativeapp.domain

import com.rtobuddy.nativeapp.domain.model.ExamQuestion
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import kotlin.math.roundToInt

data class ExamSession(
    val questions: List<ExamQuestion>,
    val category: String,
    val mode: String,
    val label: String,
)

data class ExamResult(
    val correct: Int,
    val total: Int,
    val percent: Int,
    val missedIds: List<String>,
    val category: String,
    val mode: String,
    val timestamp: String,
)

object ExamEngine {
    fun createExam(
        all: List<ExamQuestion>,
        category: String = "all",
        count: Int = 10,
        mode: String = "practice",
        questionIds: List<String>? = null,
    ): ExamSession {
        val pool = when {
            questionIds != null -> all.filter { it.id in questionIds }
            category == "all" || category.isBlank() -> all
            else -> all.filter { it.category == category }
        }.ifEmpty { all }

        val selected = pool.shuffled()
            .take(count.coerceAtMost(pool.size).coerceAtLeast(1))
            .map { shuffleOptions(it) }
        val label = when (mode) {
            "simulator" -> "Exam Simulator"
            "challenge" -> "Challenge Mode"
            "replay" -> "Mistake Replay"
            "spot" -> "Can You Spot It?"
            else -> when (category) {
                "traffic_sign" -> "Signs Drill"
                "traffic_signal" -> "Signals Sprint"
                "road_marking" -> "Markings Drill"
                "road_rule" -> "Rules Practice"
                else -> "Practice Exam"
            }
        }
        return ExamSession(selected, category, mode, label)
    }

    /** Shuffle choice order so the correct option is not stuck in one position. */
    fun shuffleOptions(question: ExamQuestion): ExamQuestion {
        if (question.options.size <= 1) return question
        val pairs = question.options.mapIndexed { index, text -> index to text }.shuffled()
        val newAnswer = pairs.indexOfFirst { it.first == question.answer_index }.coerceAtLeast(0)
        return question.copy(
            options = pairs.map { it.second },
            answer_index = newAnswer,
        )
    }

    fun score(
        session: ExamSession,
        answers: Map<Int, Int>,
    ): ExamResult {
        var correct = 0
        val missed = mutableListOf<String>()
        session.questions.forEachIndexed { index, q ->
            val chosen = answers[index]
            if (chosen != null && chosen == q.answer_index) {
                correct += 1
            } else {
                missed += q.id
            }
        }
        val total = session.questions.size.coerceAtLeast(1)
        val percent = ((correct.toDouble() / total) * 100).roundToInt()
        return ExamResult(
            correct = correct,
            total = total,
            percent = percent,
            missedIds = missed,
            category = session.category,
            mode = session.mode,
            timestamp = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
        )
    }
}
