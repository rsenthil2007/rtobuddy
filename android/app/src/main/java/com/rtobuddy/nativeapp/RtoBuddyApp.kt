package com.rtobuddy.nativeapp

import android.app.Application

class RtoBuddyApp : Application() {
    lateinit var container: AppContainer
        private set

    override fun onCreate() {
        super.onCreate()
        container = AppContainer(this)
        // Fetch remote ads flag (fail-closed → Disabled). Does not block UI.
        container.adsManager.start()
    }
}
