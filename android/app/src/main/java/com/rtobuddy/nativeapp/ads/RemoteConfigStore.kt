package com.rtobuddy.nativeapp.ads

import android.util.Log
import com.rtobuddy.nativeapp.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import java.net.HttpURLConnection
import java.net.URL

class RemoteConfigStore {
    private val json = Json { ignoreUnknownKeys = true; isLenient = true }
    private val _config = MutableStateFlow(AdsConfigDefaults.DISABLED)
    val config: StateFlow<RemoteAdsConfig> = _config.asStateFlow()

    suspend fun refresh(): RemoteAdsConfig = withContext(Dispatchers.IO) {
        val url = BuildConfig.REMOTE_ADS_CONFIG_URL.trim()
        if (url.isBlank()) {
            _config.value = AdsConfigDefaults.DISABLED
            return@withContext _config.value
        }
        runCatching {
            val conn = (URL(url).openConnection() as HttpURLConnection).apply {
                connectTimeout = 8_000
                readTimeout = 8_000
                requestMethod = "GET"
                setRequestProperty("Accept", "application/json")
                instanceFollowRedirects = true
            }
            conn.inputStream.bufferedReader().use { reader ->
                val body = reader.readText()
                val parsed = json.decodeFromString(RemoteAdsConfig.serializer(), body)
                _config.value = parsed
                Log.i(TAG, "Remote ads config: ads=${parsed.ads} banner=${parsed.bannerEnabled}")
                parsed
            }
        }.getOrElse { err ->
            Log.w(TAG, "Remote ads config fetch failed — keeping disabled", err)
            // Fail closed: never enable ads if remote is unreachable.
            _config.value = AdsConfigDefaults.DISABLED
            AdsConfigDefaults.DISABLED
        }
    }

    companion object {
        private const val TAG = "RemoteAdsConfig"
    }
}
