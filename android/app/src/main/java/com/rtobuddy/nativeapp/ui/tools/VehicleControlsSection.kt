package com.rtobuddy.nativeapp.ui.tools

import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import coil.decode.SvgDecoder
import coil.request.ImageRequest
import com.rtobuddy.nativeapp.data.RtoBuddyRepository
import com.rtobuddy.nativeapp.domain.model.VehicleControl
import com.rtobuddy.nativeapp.domain.model.VehicleControlVariant
import com.rtobuddy.nativeapp.ui.components.SectionCard

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun VehicleControlsSection(repository: RtoBuddyRepository) {
    var variants by remember { mutableStateOf<List<VehicleControlVariant>>(emptyList()) }
    var selectedIndex by remember { mutableIntStateOf(0) }
    var selectedControlId by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        variants = repository.getVehicleControlVariants()
    }

    val variant = variants.getOrNull(selectedIndex) ?: return

    LaunchedEffect(selectedIndex, variants) {
        selectedControlId = variants.getOrNull(selectedIndex)?.controls?.firstOrNull()?.id
    }

    val selectedControl = variant.controls.firstOrNull { it.id == selectedControlId }

    SectionCard(
        title = "About your vehicle",
        body = "Tap a control on the diagram or pick from the list — geared bike, scooter, and car essentials.",
    ) {
        FlowRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp),
        ) {
            variants.forEachIndexed { index, item ->
                FilterChip(
                    selected = selectedIndex == index,
                    onClick = { selectedIndex = index },
                    label = { Text(item.title) },
                )
            }
        }

        Text(
            variant.subtitle,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.primary,
        )

        VehicleDiagram(
            diagramAsset = variant.diagram_asset,
            controls = variant.controls,
            selectedControlId = selectedControlId,
            onSelect = { selectedControlId = it },
        )

        if (selectedControl != null) {
            ControlDetailCard(selectedControl)
        }

        Text(
            "All controls",
            fontWeight = FontWeight.SemiBold,
            style = MaterialTheme.typography.labelLarge,
            modifier = Modifier.padding(top = 4.dp),
        )
        FlowRow(
            horizontalArrangement = Arrangement.spacedBy(6.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp),
        ) {
            variant.controls.forEach { control ->
                FilterChip(
                    selected = control.id == selectedControlId,
                    onClick = { selectedControlId = control.id },
                    label = { Text(control.label) },
                )
            }
        }
    }
}

@Composable
private fun VehicleDiagram(
    diagramAsset: String,
    controls: List<VehicleControl>,
    selectedControlId: String?,
    onSelect: (String) -> Unit,
) {
    val context = LocalContext.current
    val shape = RoundedCornerShape(12.dp)
    val highlightColor = MaterialTheme.colorScheme.primary
    val idleColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.35f)

    BoxWithConstraints(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
    ) {
        val diagramHeight = maxWidth * 0.625f

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(diagramHeight)
                .clip(shape)
                .border(1.dp, MaterialTheme.colorScheme.outlineVariant, shape),
        ) {
            AsyncImage(
                model = ImageRequest.Builder(context)
                    .data("file:///android_asset/$diagramAsset")
                    .decoderFactory(SvgDecoder.Factory())
                    .build(),
                contentDescription = "Vehicle controls diagram",
                modifier = Modifier.matchParentSize(),
                contentScale = ContentScale.Fit,
            )

            controls.forEach { control ->
                val hs = control.hotspot
                val isSelected = control.id == selectedControlId
                Box(
                    modifier = Modifier
                        .offset(
                            x = maxWidth * hs.x.toFloat(),
                            y = diagramHeight * hs.y.toFloat(),
                        )
                        .width(maxWidth * hs.w.toFloat())
                        .height(diagramHeight * hs.h.toFloat())
                        .clip(RoundedCornerShape(6.dp))
                        .border(
                            width = if (isSelected) 2.dp else 1.dp,
                            color = if (isSelected) highlightColor else idleColor,
                            shape = RoundedCornerShape(6.dp),
                        )
                        .clickable { onSelect(control.id) },
                )
            }
        }
    }
}

@Composable
private fun ControlDetailCard(control: VehicleControl) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(10.dp))
            .border(1.dp, MaterialTheme.colorScheme.primaryContainer, RoundedCornerShape(10.dp))
            .padding(12.dp),
        verticalArrangement = Arrangement.spacedBy(4.dp),
    ) {
        Text(
            control.label,
            fontWeight = FontWeight.SemiBold,
            style = MaterialTheme.typography.titleSmall,
            color = MaterialTheme.colorScheme.primary,
        )
        Text(control.description, style = MaterialTheme.typography.bodyMedium)
    }
}
