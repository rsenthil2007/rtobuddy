package com.rtobuddy.nativeapp.domain

import com.rtobuddy.nativeapp.domain.model.RulesCheckEntry
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class RulesCheckEngineTest {
    private val sample = RulesCheckEntry(
        id = "RC-2W-001",
        title = "Helmet for rider and pillion",
        vehicle_types = listOf("2W"),
        keywords = listOf("helmet", "194D"),
        simple_rule = "Wear helmet",
        legal_reference = "MVA s.129; s.194D",
        should_do = listOf("Wear BIS helmet"),
        should_not_do = listOf("Ride bareheaded"),
        penalty = "Fine under s.194D",
    )

    @Test
    fun findsByKeyword() {
        val hits = RulesCheckEngine.search("helmet", listOf(sample))
        assertEquals(1, hits.size)
        assertEquals("RC-2W-001", hits.first().id)
    }

    @Test
    fun findsBySectionNumber() {
        val hits = RulesCheckEngine.search("194D", listOf(sample))
        assertTrue(hits.isNotEmpty())
    }

    @Test
    fun filtersByVehicleType() {
        val car = sample.copy(id = "RC-4W-001", vehicle_types = listOf("4W"), keywords = listOf("seatbelt"))
        val hits = RulesCheckEngine.search("helmet", listOf(sample, car), vehicleFilter = "4W")
        assertTrue(hits.isEmpty())
    }
}
