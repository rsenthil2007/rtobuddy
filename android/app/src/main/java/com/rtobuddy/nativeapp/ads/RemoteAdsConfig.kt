package com.rtobuddy.nativeapp.ads

import kotlinx.serialization.Serializable

/**
 * Remote ads config (hosted JSON). Default in-app state is always disabled
 * until a successful fetch returns ads=Enabled.
 *
 * Host this file on InterServer (or GitHub raw) and point BuildConfig.REMOTE_ADS_CONFIG_URL at it.
 *
 * Example:
 * {
 *   "ads": "Enabled",
 *   "bannerEnabled": true,
 *   "bannerPosition": "bottom",
 *   "interstitialBetweenQuests": true,
 *   "interstitialCooldownSec": 5
 * }
 */
@Serializable
data class RemoteAdsConfig(
    val ads: String = "Disabled",
    val bannerEnabled: Boolean = true,
    val bannerPosition: String = "bottom",
    val interstitialBetweenQuests: Boolean = true,
    val interstitialCooldownSec: Int = 5,
    val message: String? = null,
) {
    val adsEnabled: Boolean
        get() = ads.equals("Enabled", ignoreCase = true) ||
            ads.equals("true", ignoreCase = true) ||
            ads.equals("1")
}

object AdsConfigDefaults {
    val DISABLED = RemoteAdsConfig(ads = "Disabled")
}
