package com.rtobuddy.nativeapp.ui

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Explore
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.MenuBook
import androidx.compose.material.icons.outlined.QueryStats
import androidx.compose.material.icons.outlined.Quiz
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.rtobuddy.nativeapp.data.AssetCatalog
import com.rtobuddy.nativeapp.data.RtoBuddyRepository
import com.rtobuddy.nativeapp.ui.exam.ExamScreen
import com.rtobuddy.nativeapp.ui.home.HomeLaunch
import com.rtobuddy.nativeapp.ui.home.HomeScreen
import com.rtobuddy.nativeapp.ui.learn.LearnScreen
import com.rtobuddy.nativeapp.ui.progress.ProgressScreen
import com.rtobuddy.nativeapp.ui.quest.QuestScreen
import com.rtobuddy.nativeapp.ui.tools.ToolsScreen

private enum class RootTab(val label: String) {
    Home("Home"),
    Quest("Quest"),
    Library("Library"),
    Drill("Drill"),
    Progress("Progress"),
    Tools("Tools"),
}

@Composable
fun RtoBuddyAppUi(
    repository: RtoBuddyRepository,
    catalog: AssetCatalog,
) {
    var tab by remember { mutableStateOf(RootTab.Home) }
    var libraryTab by remember { mutableStateOf<String?>(null) }
    var pendingExam by remember { mutableStateOf<HomeLaunch?>(null) }
    var homeRefresh by remember { mutableIntStateOf(0) }
    var progressRefresh by remember { mutableIntStateOf(0) }
    var questRefresh by remember { mutableIntStateOf(0) }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    selected = tab == RootTab.Home,
                    onClick = {
                        tab = RootTab.Home
                        homeRefresh += 1
                    },
                    icon = { Icon(Icons.Outlined.Home, contentDescription = null) },
                    label = { Text(RootTab.Home.label) },
                )
                NavigationBarItem(
                    selected = tab == RootTab.Quest,
                    onClick = {
                        tab = RootTab.Quest
                        questRefresh += 1
                    },
                    icon = { Icon(Icons.Outlined.Explore, contentDescription = null) },
                    label = { Text(RootTab.Quest.label) },
                )
                NavigationBarItem(
                    selected = tab == RootTab.Library,
                    onClick = { tab = RootTab.Library },
                    icon = { Icon(Icons.Outlined.MenuBook, contentDescription = null) },
                    label = { Text(RootTab.Library.label) },
                )
                NavigationBarItem(
                    selected = tab == RootTab.Drill,
                    onClick = { tab = RootTab.Drill },
                    icon = { Icon(Icons.Outlined.Quiz, contentDescription = null) },
                    label = { Text(RootTab.Drill.label) },
                )
                NavigationBarItem(
                    selected = tab == RootTab.Progress,
                    onClick = {
                        tab = RootTab.Progress
                        progressRefresh += 1
                    },
                    icon = { Icon(Icons.Outlined.QueryStats, contentDescription = null) },
                    label = { Text(RootTab.Progress.label) },
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
            RootTab.Home -> HomeScreen(
                repository = repository,
                padding = padding,
                refreshToken = homeRefresh,
                onLaunchExam = { launch ->
                    pendingExam = launch
                    tab = RootTab.Drill
                },
                onOpenLibrary = { section ->
                    libraryTab = section
                    tab = RootTab.Library
                },
                onOpenProgress = {
                    progressRefresh += 1
                    tab = RootTab.Progress
                },
                onOpenState = {
                    libraryTab = "state"
                    tab = RootTab.Library
                },
                onOpenQuest = {
                    questRefresh += 1
                    tab = RootTab.Quest
                },
            )

            RootTab.Quest -> QuestScreen(
                repository = repository,
                padding = padding,
                refreshToken = questRefresh,
            )

            RootTab.Library -> LearnScreen(
                repository = repository,
                padding = padding,
                initialTab = libraryTab,
            )

            RootTab.Drill -> ExamScreen(
                repository = repository,
                catalog = catalog,
                padding = padding,
                pendingLaunch = pendingExam,
                onLaunchConsumed = { pendingExam = null },
            )

            RootTab.Progress -> ProgressScreen(
                repository = repository,
                padding = padding,
                refreshToken = progressRefresh,
                onLaunchExam = { launch ->
                    pendingExam = launch
                    tab = RootTab.Drill
                },
                onOpenState = {
                    libraryTab = "state"
                    tab = RootTab.Library
                },
            )

            RootTab.Tools -> ToolsScreen(
                repository = repository,
                padding = padding,
            )
        }
    }
}
