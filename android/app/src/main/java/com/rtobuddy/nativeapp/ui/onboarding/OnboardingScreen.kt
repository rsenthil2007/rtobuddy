package com.rtobuddy.nativeapp.ui.onboarding

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp

private data class OnboardPage(
    val title: String,
    val body: String,
)

private val pages = listOf(
    OnboardPage(
        title = "Welcome to RTOBuddy",
        body = "Learn LLR road sense offline — signs, markings, drills, and Roadsville quests.",
    ),
    OnboardPage(
        title = "Roadsville Quest",
        body = "Finish districts in order. Tap what you notice, choose the safer move, earn stars.",
    ),
    OnboardPage(
        title = "Library & Drill",
        body = "Study signs and markings, then practice with timed drills before your real test.",
    ),
)

@Composable
fun OnboardingScreen(
    onFinished: () -> Unit,
) {
    var page by remember { mutableIntStateOf(0) }
    val item = pages[page]

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.SpaceBetween,
    ) {
        TextButton(
            onClick = onFinished,
            modifier = Modifier.align(Alignment.End),
        ) {
            Text("Skip")
        }

        Column(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(horizontal = 8.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text(
                item.title,
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center,
                color = MaterialTheme.colorScheme.primary,
            )
            Spacer(Modifier.height(16.dp))
            Text(
                item.body,
                style = MaterialTheme.typography.bodyLarge,
                textAlign = TextAlign.Center,
            )
        }

        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(
                "${page + 1} / ${pages.size}",
                style = MaterialTheme.typography.labelMedium,
                modifier = Modifier.align(Alignment.CenterHorizontally),
            )
            if (page < pages.lastIndex) {
                Button(
                    onClick = { page += 1 },
                    modifier = Modifier.fillMaxWidth(),
                ) {
                    Text("Next")
                }
            } else {
                Button(onClick = onFinished, modifier = Modifier.fillMaxWidth()) {
                    Text("Start learning")
                }
            }
            OutlinedButton(onClick = onFinished, modifier = Modifier.fillMaxWidth()) {
                Text("I already know my way")
            }
        }
    }
}
