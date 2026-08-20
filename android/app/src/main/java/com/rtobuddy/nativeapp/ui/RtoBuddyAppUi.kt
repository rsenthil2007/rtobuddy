package com.rtobuddy.nativeapp.ui

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Article
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.MenuBook
import androidx.compose.material.icons.outlined.Quiz
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

private enum class RootTab(val label: String) {
    Home("Home"),
    Learn("Learn"),
    Exam("Exam"),
    Tools("Tools"),
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RtoBuddyAppUi() {
    var tab by remember { mutableStateOf(RootTab.Home) }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    selected = tab == RootTab.Home,
                    onClick = { tab = RootTab.Home },
                    icon = { Icon(Icons.Outlined.Home, contentDescription = null) },
                    label = { Text(RootTab.Home.label) },
                )
                NavigationBarItem(
                    selected = tab == RootTab.Learn,
                    onClick = { tab = RootTab.Learn },
                    icon = { Icon(Icons.Outlined.MenuBook, contentDescription = null) },
                    label = { Text(RootTab.Learn.label) },
                )
                NavigationBarItem(
                    selected = tab == RootTab.Exam,
                    onClick = { tab = RootTab.Exam },
                    icon = { Icon(Icons.Outlined.Quiz, contentDescription = null) },
                    label = { Text(RootTab.Exam.label) },
                )
                NavigationBarItem(
                    selected = tab == RootTab.Tools,
                    onClick = { tab = RootTab.Tools },
                    icon = { Icon(Icons.Outlined.Settings, contentDescription = null) },
                    label = { Text(RootTab.Tools.label) },
                )
            }
        },
    ) { padding ->
        when (tab) {
            RootTab.Home -> HomeScreen(padding)
            RootTab.Learn -> PlaceholderScreen("Learn", "Offline rules, signs, signals, markings, and state overlays will live here.", padding)
            RootTab.Exam -> PlaceholderScreen("Exam", "Practice, simulator, challenge, replay mistakes, Spot It, and confidence-based drills will live here.", padding)
            RootTab.Tools -> PlaceholderScreen("Tools", "Official services, vehicle guidance, and About / Sources will live here.", padding)
        }
    }
}

@Composable
private fun HomeScreen(padding: PaddingValues) {
    val sections = listOf(
        "Mission Control" to "Streak, daily missions, daily rule, and continue training.",
        "Today’s route" to "A compact habit loop for daily learning.",
        "Confidence map" to "See strong vs weak areas at a glance.",
        "Achievements" to "Earned identity badges based on actual activity.",
        "Can You Spot It?" to "Scenario-based road awareness drills.",
        "Pass in 7 Days" to "Structured guided preparation plan.",
        "State / UT smart panel" to "Local rule reminders and official links.",
    )
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(padding),
        verticalArrangement = Arrangement.spacedBy(12.dp),
        contentPadding = PaddingValues(16.dp),
    ) {
        item {
            Text("RTOBuddy Native", fontWeight = FontWeight.Bold)
            Text("Offline-first Kotlin app scaffold")
        }
        items(sections) { (title, body) ->
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Icon(Icons.Outlined.Article, contentDescription = null)
                        Text(title, fontWeight = FontWeight.SemiBold)
                    }
                    Text(body)
                }
            }
        }
    }
}

@Composable
private fun PlaceholderScreen(title: String, body: String, padding: PaddingValues) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(padding)
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text(title, fontWeight = FontWeight.Bold)
        Text(body)
    }
}
