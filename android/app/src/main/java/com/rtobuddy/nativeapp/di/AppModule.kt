package com.rtobuddy.nativeapp.di

import com.rtobuddy.nativeapp.data.OfflineFirstRtoBuddyRepository
import com.rtobuddy.nativeapp.data.RtoBuddyRepository
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideRepository(): RtoBuddyRepository = OfflineFirstRtoBuddyRepository()
}
