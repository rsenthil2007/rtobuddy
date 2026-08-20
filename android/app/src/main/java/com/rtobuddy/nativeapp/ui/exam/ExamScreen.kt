package com.rtobuddy.nativeapp.ui.exam

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import coil.decode.SvgDecoder
import coil.request.ImageRequest
import com.rtobuddy.nativeapp.data.AssetCatalog
import com.rtobuddy.nativeapp.data.RtoBuddyRepository
import com.rtobuddy.nativeapp.domain.ExamEngine
import com.rtobuddy.nativeapp.domain.ExamResult
import com.rtobuddy.nativeapp.domain.ExamSession
import com.rtobuddy.nativeapp.domain.model.readinessStatus
import com.rtobuddy.nativeapp.ui.components.SectionCard
import com.rtobuddy.nativeapp.ui.home.HomeLaunch
import kotlinx.coroutines.launch

private sealed interface ExamUiState {
    data object Setup : ExamUiState
    data class Running(val session: ExamSession) : ExamUiState
    data class Result(val session: ExamSession, val result: ExamResult) : ExamUiState
}

@Composable
fun ExamScreen(
    repository: RtoBuddyRepository,
    catalog: AssetCatalog,
    padding: PaddingValues,
    pendingLaunch: HomeLaunch?,
    onLaunchConsumed: () -> Unit,
) {
    val scope = rememberCoroutineScope()
    var state by remember { mutableStateOf<ExamUiState>(ExamUiState.Setup) }
    var category by remember { mutableStateOf("all") }
    var count by remember { mutableIntStateOf(10) }
    var mode by remember { mutableStateOf("practice") }
    var index by remember { mutableIntStateOf(0) }
    val answers = remember { mutableStateMapOf<Int, Int>() }
    var revealed by remember { mutableStateOf(false) }
    var questionCount by remember { mutableIntStateOf(0) }

    LaunchedEffect(Unit) {
        questionCount = repository.getQuestions().size
    }

    LaunchedEffect(pendingLaunch) {
        val launch = pendingLaunch ?: return@LaunchedEffect
        val all = repository.getQuestions()
        val ids = launch.questionIds
            ?: if (launch.mode == "replay") repository.getRecentMistakeIds() else null
        val session = ExamEngine.createExam(
            all = all,
            category = launch.category,
            count = launch.count,
            mode = launch.mode,
            questionIds = ids,
        )
        answers.clear()
        index = 0
        revealed = false
        state = ExamUiState.Running(session)
        onLaunchConsumed()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(padding)
            .padding(16.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        when (val ui = state) {
            ExamUiState.Setup -> {
                Text("Drill", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                Text("$questionCount questions available offline")
                SectionCard(title = "Category") {
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf(
                            "all" to "Mixed",
                            "traffic_sign" to "Signs",
                            "traffic_signal" to "Signals",
                            "road_marking" to "Markings",
                            "road_rule" to "Rules",
                        ).forEach { (value, label) ->
                            FilterChip(
                                selected = category == value,
                                onClick = { category = value },
                                label = { Text(label) },
                            )
                        }
                    }
                }
                SectionCard(title = "Length") {
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf(5, 10, 15, 20).forEach { n ->
                            FilterChip(selected = count == n, onClick = { count = n }, label = { Text("$n") })
                        }
                    }
                }
                SectionCard(title = "Mode") {
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        listOf("practice" to "Practice", "simulator" to "Simulator", "challenge" to "Challenge").forEach { (value, label) ->
                            FilterChip(selected = mode == value, onClick = { mode = value }, label = { Text(label) })
                        }
                    }
                    Text(
                        when (mode) {
                            "simulator" -> "No feedback until the end — closest to the real exam."
                            "challenge" -> "Score-focused run you can share later."
                            else -> "Immediate feedback after each answer."
                        },
                    )
                }
                Button(onClick = {
                    scope.launch {
                        val session = ExamEngine.createExam(repository.getQuestions(), category, count, mode)
                        answers.clear()
                        index = 0
                        revealed = false
                        state = ExamUiState.Running(session)
                    }
                }) { Text("Start ${if (mode == "practice") "practice" else mode}") }
            }

            is ExamUiState.Running -> {
                val session = ui.session
                val q = session.questions[index]
                Text(session.label, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                Text("Question ${index + 1} of ${session.questions.size}")
                Text(q.question, style = MaterialTheme.typography.titleMedium)

                val sign = catalog.signById(q.sign_id)
                sign?.image_asset?.let { asset ->
                    val context = LocalContext.current
                    AsyncImage(
                        model = ImageRequest.Builder(context)
                            .data("file:///android_asset/signs/$asset")
                            .decoderFactory(SvgDecoder.Factory())
                            .build(),
                        contentDescription = null,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(140.dp),
                        contentScale = ContentScale.Fit,
                    )
                    if (revealed || session.mode == "simulator") {
                        // keep label hidden in practice until reveal; never show name before answer in practice
                    }
                    if (revealed) {
                        Text(sign.name, fontWeight = FontWeight.SemiBold)
                    }
                } ?: run {
                    catalog.signalById(q.signal_id)?.let {
                        if (revealed) Text("Signal: ${it.name}", fontWeight = FontWeight.SemiBold)
                    }
                    catalog.markingById(q.marking_id)?.let {
                        if (revealed) Text("Marking: ${it.name}", fontWeight = FontWeight.SemiBold)
                    }
                }

                q.options.forEachIndexed { optIndex, option ->
                    val selected = answers[index] == optIndex
                    OutlinedButton(
                        onClick = {
                            if (session.mode == "simulator") {
                                answers[index] = optIndex
                            } else if (!revealed) {
                                answers[index] = optIndex
                                revealed = true
                            }
                        },
                        enabled = session.mode == "simulator" || !revealed || selected,
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Text(option)
                    }
                }

                if (revealed && session.mode != "simulator") {
                    val correct = answers[index] == q.answer_index
                    Text(if (correct) "Correct" else "Not quite", fontWeight = FontWeight.Bold)
                    Text(q.explanation)
                }

                val canAdvance = if (session.mode == "simulator") {
                    answers.containsKey(index)
                } else {
                    revealed
                }
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    if (index > 0) {
                        OutlinedButton(onClick = {
                            index -= 1
                            revealed = answers.containsKey(index) && session.mode != "simulator"
                        }) { Text("Previous") }
                    }
                    if (index < session.questions.lastIndex) {
                        Button(
                            onClick = {
                                if (canAdvance) {
                                    index += 1
                                    revealed = answers.containsKey(index) && session.mode != "simulator"
                                }
                            },
                            enabled = canAdvance,
                        ) { Text("Next") }
                    } else {
                        Button(
                            onClick = {
                                val result = ExamEngine.score(session, answers.toMap())
                                scope.launch {
                                    repository.saveExamResult(result)
                                    state = ExamUiState.Result(session, result)
                                }
                            },
                            enabled = if (session.mode == "simulator") {
                                answers.size == session.questions.size
                            } else {
                                revealed
                            },
                        ) { Text("Finish") }
                    }
                }
                OutlinedButton(onClick = {
                    state = ExamUiState.Setup
                    answers.clear()
                    index = 0
                    revealed = false
                }) { Text("Exit") }
            }

            is ExamUiState.Result -> {
                val result = ui.result
                Text("Results", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                Text("${result.correct}/${result.total} · ${result.percent}%")
                Text(readinessStatus(result.percent), fontWeight = FontWeight.SemiBold)
                if (result.missedIds.isNotEmpty()) {
                    Text("Missed ${result.missedIds.size} question(s). Use Replay mistakes from Home.")
                }
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(onClick = {
                        state = ExamUiState.Setup
                        answers.clear()
                        index = 0
                        revealed = false
                    }) { Text("Back to setup") }
                    if (result.missedIds.isNotEmpty()) {
                        OutlinedButton(onClick = {
                            scope.launch {
                                val session = ExamEngine.createExam(
                                    repository.getQuestions(),
                                    count = result.missedIds.size.coerceAtMost(10),
                                    mode = "replay",
                                    questionIds = result.missedIds,
                                )
                                answers.clear()
                                index = 0
                                revealed = false
                                state = ExamUiState.Running(session)
                            }
                        }) { Text("Practice misses") }
                    }
                }
            }
        }
    }
}
