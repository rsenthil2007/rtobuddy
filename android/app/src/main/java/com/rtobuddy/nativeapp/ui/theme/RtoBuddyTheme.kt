package com.rtobuddy.nativeapp.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

enum class AppThemeId(val label: String) {
    CLASSIC("Classic"),
    BALANCED("Balanced"),
    HARDCORE("Hardcore"),
    ;

    companion object {
        fun fromStored(value: String?): AppThemeId =
            entries.firstOrNull { it.name.equals(value, ignoreCase = true) } ?: BALANCED
    }
}

private val ClassicColors = lightColorScheme(
    primary = Color(0xFF1F4B99),
    onPrimary = Color.White,
    secondary = Color(0xFF3D6BB3),
    background = Color(0xFFF4F6FA),
    surface = Color.White,
    onBackground = Color(0xFF1A1C1E),
    onSurface = Color(0xFF1A1C1E),
    outline = Color(0xFFB8C0CC),
)

private val BalancedColors = darkColorScheme(
    primary = Color(0xFF7EB6FF),
    onPrimary = Color(0xFF00315F),
    secondary = Color(0xFF9CC2FF),
    background = Color(0xFF12161C),
    surface = Color(0xFF1B222C),
    onBackground = Color(0xFFE6EAF0),
    onSurface = Color(0xFFE6EAF0),
    outline = Color(0xFF445062),
)

private val HardcoreColors = darkColorScheme(
    primary = Color(0xFF39FF14),
    onPrimary = Color(0xFF003300),
    secondary = Color(0xFF00E5FF),
    background = Color(0xFF05070A),
    surface = Color(0xFF0E1418),
    onBackground = Color(0xFFE8FFE8),
    onSurface = Color(0xFFE8FFE8),
    outline = Color(0xFF1F3B2A),
)

@Composable
fun RtoBuddyTheme(
    themeId: AppThemeId,
    content: @Composable () -> Unit,
) {
    val colors = when (themeId) {
        AppThemeId.CLASSIC -> ClassicColors
        AppThemeId.BALANCED -> BalancedColors
        AppThemeId.HARDCORE -> HardcoreColors
    }
    MaterialTheme(
        colorScheme = colors,
        content = content,
    )
}
