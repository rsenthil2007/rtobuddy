package com.rtobuddy.nativeapp.di

import com.rtobuddy.nativeapp.data.OfflineFirstRtoBuddyRepository
import com.rtobuddy.nativeapp.data.RtoBuddyRepository

object AppModule {
    fun provideRepository(): RtoBuddyRepository = OfflineFirstRtoBuddyRepository()
}
