import java.util.Properties

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
    id("org.jetbrains.kotlin.plugin.serialization")
}

val ciDebugKeystore = rootProject.file("keystore/rtobuddy-ci-debug.jks")
val ciDebugProps = rootProject.file("keystore/ci-debug.properties")

android {
    namespace = "com.rtobuddy.nativeapp"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.rtobuddy.nativeapp"
        minSdk = 26
        targetSdk = 35
        versionCode = 21
        versionName = "1.8.5"
        vectorDrawables.useSupportLibrary = true
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"

        // Temporarily hosted in the existing myChat HTTPS web root (same folder as index.html).
        buildConfigField(
            "String",
            "REMOTE_ADS_CONFIG_URL",
            "\"https://157.250.205.140/ads-config.json\"",
        )
        buildConfigField(
            "String",
            "REMOTE_ADS_CONFIG_URL_FALLBACK",
            "\"http://157.250.205.140/ads-config.json\"",
        )
        // Google sample units (safe for closed testing). Replace with your AdMob IDs for production.
        buildConfigField("String", "ADMOB_BANNER_UNIT_ID", "\"ca-app-pub-3940256099942544/6300978111\"")
        buildConfigField("String", "ADMOB_INTERSTITIAL_UNIT_ID", "\"ca-app-pub-3940256099942544/1033173712\"")
        buildConfigField("String", "ADMOB_APP_ID", "\"ca-app-pub-3940256099942544~3347511713\"")
    }

    signingConfigs {
        if (ciDebugKeystore.exists()) {
            create("ciDebug") {
                val props = Properties().apply {
                    ciDebugProps.takeIf { it.exists() }?.inputStream()?.use { load(it) }
                }
                storeFile = ciDebugKeystore
                storePassword = props.getProperty("storePassword") ?: "rtobuddyci"
                keyAlias = props.getProperty("keyAlias") ?: "rtobuddyci"
                keyPassword = props.getProperty("keyPassword") ?: "rtobuddyci"
            }
        }
    }

    buildTypes {
        debug {
            if (ciDebugKeystore.exists()) {
                signingConfig = signingConfigs.getByName("ciDebug")
            }
        }
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro",
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
        buildConfig = true
    }
    packaging {
        resources.excludes += "/META-INF/{AL2.0,LGPL2.1}"
    }
}

dependencies {
    val composeBom = platform("androidx.compose:compose-bom:2024.10.01")
    implementation(composeBom)
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    debugImplementation("androidx.compose.ui:ui-tooling")

    implementation("androidx.activity:activity-compose:1.9.3")
    implementation("androidx.activity:activity-ktx:1.9.3")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.7")
    implementation("androidx.navigation:navigation-compose:2.8.5")
    implementation("androidx.datastore:datastore-preferences:1.1.1")
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.7.3")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")
    implementation("io.coil-kt:coil-compose:2.7.0")
    implementation("io.coil-kt:coil-svg:2.7.0")
    implementation("com.google.android.gms:play-services-ads:23.6.0")

    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.9.0")
    androidTestImplementation("androidx.test.ext:junit:1.2.1")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.6.1")
    androidTestImplementation(composeBom)
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}
