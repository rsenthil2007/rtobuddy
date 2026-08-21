package com.rtobuddy.nativeapp

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.hasText
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

/**
 * Smoke E2E: cold launch → finish/skip onboarding → tabs visible.
 * Run on a device/emulator: ./gradlew :app:connectedDebugAndroidTest
 */
@RunWith(AndroidJUnit4::class)
class AppSmokeE2ETest {
    @get:Rule
    val composeRule = createAndroidComposeRule<MainActivity>()

    @Test
    fun onboardingOrHomeIsReachable() {
        val skipNodes = composeRule.onAllNodes(hasText("Skip")).fetchSemanticsNodes()
        if (skipNodes.isNotEmpty()) {
            composeRule.onNodeWithText("Skip").performClick()
        }
        composeRule.onNodeWithText("Home").assertIsDisplayed()
        composeRule.onNodeWithText("Quest").assertIsDisplayed()
        composeRule.onNodeWithText("Library").assertIsDisplayed()
    }

    @Test
    fun canOpenLibraryTab() {
        val skipNodes = composeRule.onAllNodes(hasText("Skip")).fetchSemanticsNodes()
        if (skipNodes.isNotEmpty()) {
            composeRule.onNodeWithText("Skip").performClick()
        }
        composeRule.onNodeWithText("Library").performClick()
        composeRule.waitForIdle()
    }
}
