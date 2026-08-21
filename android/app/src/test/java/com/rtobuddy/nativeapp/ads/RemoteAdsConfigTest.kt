package com.rtobuddy.nativeapp.ads

import kotlinx.serialization.json.Json
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

class RemoteAdsConfigTest {
    private val json = Json { ignoreUnknownKeys = true; isLenient = true }

    @Test
    fun defaultIsDisabled() {
        assertFalse(AdsConfigDefaults.DISABLED.adsEnabled)
    }

    @Test
    fun parsesEnabledFlag() {
        val raw = """
            {"ads":"Enabled","bannerEnabled":true,"bannerPosition":"top","interstitialBetweenQuests":true,"interstitialCooldownSec":5}
        """.trimIndent()
        val cfg = json.decodeFromString(RemoteAdsConfig.serializer(), raw)
        assertTrue(cfg.adsEnabled)
        assertTrue(cfg.bannerEnabled)
        assertEquals("top", cfg.bannerPosition)
        assertEquals(5, cfg.interstitialCooldownSec)
    }

    @Test
    fun parsesDisabledFlag() {
        val raw = """{"ads":"Disabled","bannerEnabled":false}"""
        val cfg = json.decodeFromString(RemoteAdsConfig.serializer(), raw)
        assertFalse(cfg.adsEnabled)
    }
}
