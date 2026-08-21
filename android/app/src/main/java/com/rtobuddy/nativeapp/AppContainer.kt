package com.rtobuddy.nativeapp

import android.content.Context
import com.rtobuddy.nativeapp.ads.AdsManager
import com.rtobuddy.nativeapp.ads.RemoteConfigStore
import com.rtobuddy.nativeapp.data.AssetCatalog
import com.rtobuddy.nativeapp.data.OfflineFirstRtoBuddyRepository
import com.rtobuddy.nativeapp.data.ProgressStore
import com.rtobuddy.nativeapp.data.RtoBuddyRepository

class AppContainer(context: Context) {
    private val appContext = context.applicationContext
    val catalog = AssetCatalog(appContext)
    val progress = ProgressStore(appContext)
    val repository: RtoBuddyRepository = OfflineFirstRtoBuddyRepository(catalog, progress)
    val remoteConfig = RemoteConfigStore()
    val adsManager = AdsManager(appContext, remoteConfig)
}
