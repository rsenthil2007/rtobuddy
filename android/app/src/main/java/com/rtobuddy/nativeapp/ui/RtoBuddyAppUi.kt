package com.rtobuddy.nativeapp.ui

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.MenuBook
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
import androidx.compose.foundation.layout.fillMaxSize
import com.rtobuddy.nativeapp.data.AssetCatalog
import com.rtobuddy.nativeapp.data.RtoBuddyRepository
import com.rtobuddy.nativeapp.ui.exam.ExamScreen
import com.rtobuddy.nativeapp.ui.home.HomeLaunch
import com.rtobuddy.nativeapp.ui.home.HomeScreen
import com.rtobuddy.nativeapp.ui.learn.LearnScreen
import com.rtobuddy.nativeapp.ui.tools.ToolsScreen

private enum class RootTab(val label: String) {
    Home("Home"),
    Learn("Learn"),
    Exam("Exam"),
    Tools("Tools"),
}

@Composable
fun RtoBuddyAppUi(
    repository: RtoBuddyRepository,
    catalog: AssetCatalog,
) {
    var tab by remember { mutableStateOf(RootTab.Home) }
    var learnTab by remember { mutableStateOf<String?>(null) }
    var pendingExam by remember { mutableStateOf<HomeLaunch?>(null) }
    var homeRefresh by remember { mutableIntStateOf(0) }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    selected = tab == RootTab.Home,
                    onClick = { tab = RootTab.Home; homeRefresh += 1 },
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
            RootTab.Home -> HomeScreen(
                repository = repository,
                padding = padding,
                refreshToken = homeRefresh,
                onLaunchExam = { launch ->
                    pendingExam = launch
                    tab = RootTab.Exam
                },
                onOpenLearn = { section ->
                    learnTab = section
                    tab = RootTab.Learn
                },
                onOpenState = {
                    learnTab = "state"
                    tab = RootTab.Learn
                },
            )

            RootTab.Learn -> LearnScreen(
                repository = repository,
                padding = padding,
                initialTab = learnTab,
            )

            RootTab.Exam -> ExamScreen(
                repository = repository,
                catalog = catalog,
                padding = padding,
                pendingLaunch = pendingExam,
                onLaunchConsumed = { pendingExam = null },
            )

            RootTab.Tools -> ToolsScreen(
                repository = repository,
                padding = padding,
            )
        }
    }
}
