package com.rtobuddy.nativeapp.ads

import android.app.Activity
import android.content.Context
import android.util.Log
import com.google.android.gms.ads.AdError
import com.google.android.gms.ads.AdRequest
import com.google.android.gms.ads.FullScreenContentCallback
import com.google.android.gms.ads.LoadAdError
import com.google.android.gms.ads.MobileAds
import com.google.android.gms.ads.interstitial.InterstitialAd
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback
import com.rtobuddy.nativeapp.BuildConfig
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import java.util.concurrent.atomic.AtomicBoolean

/**
 * AdMob wrapper. Ads stay off until remote config says Enabled.
 * Uses Google sample unit IDs in debug; production IDs via BuildConfig.
 */
class AdsManager(
    context: Context,
    private val remoteConfig: RemoteConfigStore,
) {
    private val appContext = context.applicationContext
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
    private val initialized = AtomicBoolean(false)
    private var interstitial: InterstitialAd? = null
    private var lastInterstitialAtMs: Long = 0L

    val config: StateFlow<RemoteAdsConfig> = remoteConfig.config

    fun start() {
        scope.launch {
            remoteConfig.refresh()
            val cfg = remoteConfig.config.value
            if (!cfg.adsEnabled) {
                Log.i(TAG, "Ads disabled by remote/default config")
                return@launch
            }
            ensureSdk()
            preloadInterstitial()
        }
    }

    fun refreshConfig() {
        scope.launch {
            remoteConfig.refresh()
            if (remoteConfig.config.value.adsEnabled) {
                ensureSdk()
                preloadInterstitial()
            } else {
                interstitial = null
            }
        }
    }

    private fun ensureSdk() {
        if (initialized.compareAndSet(false, true)) {
            MobileAds.initialize(appContext) { }
        }
    }

    fun shouldShowBanner(): Boolean {
        val cfg = remoteConfig.config.value
        return cfg.adsEnabled && cfg.bannerEnabled
    }

    fun bannerAtBottom(): Boolean {
        return !remoteConfig.config.value.bannerPosition.equals("top", ignoreCase = true)
    }

    fun onQuestScenarioComplete(activity: Activity?) {
        val cfg = remoteConfig.config.value
        if (!cfg.adsEnabled || !cfg.interstitialBetweenQuests || activity == null) return
        val cooldownMs = cfg.interstitialCooldownSec.coerceAtLeast(0) * 1000L
        val now = System.currentTimeMillis()
        if (now - lastInterstitialAtMs < cooldownMs) return
        val ad = interstitial ?: run {
            preloadInterstitial()
            return
        }
        ad.fullScreenContentCallback = object : FullScreenContentCallback() {
            override fun onAdDismissedFullScreenContent() {
                interstitial = null
                lastInterstitialAtMs = System.currentTimeMillis()
                preloadInterstitial()
            }

            override fun onAdFailedToShowFullScreenContent(adError: AdError) {
                interstitial = null
                preloadInterstitial()
            }
        }
        ad.show(activity)
        interstitial = null
    }

    private fun preloadInterstitial() {
        if (!remoteConfig.config.value.adsEnabled) return
        ensureSdk()
        val request = AdRequest.Builder().build()
        InterstitialAd.load(
            appContext,
            BuildConfig.ADMOB_INTERSTITIAL_UNIT_ID,
            request,
            object : InterstitialAdLoadCallback() {
                override fun onAdLoaded(ad: InterstitialAd) {
                    interstitial = ad
                }

                override fun onAdFailedToLoad(error: LoadAdError) {
                    Log.w(TAG, "Interstitial load failed: ${error.message}")
                    interstitial = null
                }
            },
        )
    }

    companion object {
        private const val TAG = "AdsManager"
    }
}
