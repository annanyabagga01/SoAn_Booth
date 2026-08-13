plugins {
    id("com.android.application")
}

android {
    namespace = "com.soanbooth.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.soanbooth.app"
        minSdk = 23
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
    }
}

dependencies {
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("androidx.activity:activity:1.10.1")
}
