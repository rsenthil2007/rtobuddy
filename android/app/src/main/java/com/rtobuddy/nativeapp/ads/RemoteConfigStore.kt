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
import javax.net.ssl.HostnameVerifier
import javax.net.ssl.HttpsURLConnection
import javax.net.ssl.SSLContext
import javax.net.ssl.TrustManager
import javax.net.ssl.X509TrustManager
import java.security.cert.X509Certificate

class RemoteConfigStore {
    private val json = Json { ignoreUnknownKeys = true; isLenient = true }
    private val _config = MutableStateFlow(AdsConfigDefaults.DISABLED)
    val config: StateFlow<RemoteAdsConfig> = _config.asStateFlow()

    suspend fun refresh(): RemoteAdsConfig = withContext(Dispatchers.IO) {
        val primary = BuildConfig.REMOTE_ADS_CONFIG_URL.trim()
        val fallback = BuildConfig.REMOTE_ADS_CONFIG_URL_FALLBACK.trim()
        val urls = listOf(primary, fallback).filter { it.isNotBlank() }.distinct()
        if (urls.isEmpty()) {
            _config.value = AdsConfigDefaults.DISABLED
            return@withContext _config.value
        }

        for (url in urls) {
            val parsed = runCatching { fetchConfig(url) }.getOrElse { err ->
                Log.w(TAG, "Ads config fetch failed for $url: ${err.message}")
                null
            }
            if (parsed != null) {
                _config.value = parsed
                Log.i(TAG, "Remote ads config from $url → ads=${parsed.ads}")
                return@withContext parsed
            }
        }

        Log.w(TAG, "All ads-config URLs failed — keeping Disabled")
        _config.value = AdsConfigDefaults.DISABLED
        AdsConfigDefaults.DISABLED
    }

    private fun fetchConfig(urlString: String): RemoteAdsConfig {
        val url = URL(urlString)
        val conn = (url.openConnection() as HttpURLConnection).apply {
            connectTimeout = 10_000
            readTimeout = 10_000
            requestMethod = "GET"
            setRequestProperty("Accept", "application/json")
            instanceFollowRedirects = true
            // Closed-group: InterServer may use IP HTTPS with a non-matching cert.
            if (this is HttpsURLConnection && url.host == "157.250.205.140") {
                relaxSslForClosedGroupIp(this)
            }
        }
        val code = conn.responseCode
        if (code !in 200..299) {
            error("HTTP $code")
        }
        val body = conn.inputStream.bufferedReader().use { it.readText() }
        return json.decodeFromString(RemoteAdsConfig.serializer(), body)
    }

    /**
     * Temporary closed-group helper so IP-based HTTPS works before a real domain/cert.
     * Replace with a proper hostname + Let's Encrypt cert for production.
     */
    private fun relaxSslForClosedGroupIp(conn: HttpsURLConnection) {
        val trustAll = arrayOf<TrustManager>(
            object : X509TrustManager {
                override fun checkClientTrusted(chain: Array<X509Certificate>, authType: String) {}
                override fun checkServerTrusted(chain: Array<X509Certificate>, authType: String) {}
                override fun getAcceptedIssuers(): Array<X509Certificate> = emptyArray()
            },
        )
        val ctx = SSLContext.getInstance("TLS")
        ctx.init(null, trustAll, java.security.SecureRandom())
        conn.sslSocketFactory = ctx.socketFactory
        conn.hostnameVerifier = HostnameVerifier { _, _ -> true }
    }

    companion object {
        private const val TAG = "RemoteAdsConfig"
    }
}
